/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { AbsoluteCellRange } from './AbsoluteCellRange';
import { absolutizeDependencies, filterDependenciesOutOfScope } from './absolutizeDependencies';
import { ArraySize } from './ArraySize';
import { equalSimpleCellAddress, invalidSimpleCellAddress, simpleCellAddress } from './Cell';
import { CellContent } from './CellContentParser';
import { ClipboardCellType } from './ClipboardOperations';
import { ContentChanges } from './ContentChanges';
import { ArrayVertex, EmptyCellVertex, FormulaCellVertex, ParsingErrorVertex, SparseStrategy, ValueCellVertex } from './DependencyGraph';
import { FormulaVertex } from './DependencyGraph/FormulaCellVertex';
import { AddColumnsTransformer } from './dependencyTransformers/AddColumnsTransformer';
import { AddRowsTransformer } from './dependencyTransformers/AddRowsTransformer';
import { CleanOutOfScopeDependenciesTransformer } from './dependencyTransformers/CleanOutOfScopeDependenciesTransformer';
import { MoveCellsTransformer } from './dependencyTransformers/MoveCellsTransformer';
import { RemoveColumnsTransformer } from './dependencyTransformers/RemoveColumnsTransformer';
import { RemoveRowsTransformer } from './dependencyTransformers/RemoveRowsTransformer';
import { RemoveSheetTransformer } from './dependencyTransformers/RemoveSheetTransformer';
import { InvalidArgumentsError, NamedExpressionDoesNotExistError, NoRelativeAddressesAllowedError, SheetSizeLimitExceededError, SourceLocationHasArrayError, TargetLocationHasArrayError } from './errors';
import { EmptyValue, getRawValue } from './interpreter/InterpreterValue';
import { doesContainRelativeReferences } from './NamedExpressions';
import { NamedExpressionDependency } from './parser';
import { findBoundaries } from './Sheet';
import { ColumnsSpan, RowsSpan } from './Span';
import { StatType } from './statistics';
export class RemoveRowsCommand {
    constructor(sheet, indexes) {
        this.sheet = sheet;
        this.indexes = indexes;
    }
    normalizedIndexes() {
        return normalizeRemovedIndexes(this.indexes);
    }
    rowsSpans() {
        return this.normalizedIndexes().map(normalizedIndex => RowsSpan.fromNumberOfRows(this.sheet, normalizedIndex[0], normalizedIndex[1]));
    }
}
export class AddRowsCommand {
    constructor(sheet, indexes) {
        this.sheet = sheet;
        this.indexes = indexes;
    }
    normalizedIndexes() {
        return normalizeAddedIndexes(this.indexes);
    }
    rowsSpans() {
        return this.normalizedIndexes().map(normalizedIndex => RowsSpan.fromNumberOfRows(this.sheet, normalizedIndex[0], normalizedIndex[1]));
    }
}
export class AddColumnsCommand {
    constructor(sheet, indexes) {
        this.sheet = sheet;
        this.indexes = indexes;
    }
    normalizedIndexes() {
        return normalizeAddedIndexes(this.indexes);
    }
    columnsSpans() {
        return this.normalizedIndexes().map(normalizedIndex => ColumnsSpan.fromNumberOfColumns(this.sheet, normalizedIndex[0], normalizedIndex[1]));
    }
}
export class RemoveColumnsCommand {
    constructor(sheet, indexes) {
        this.sheet = sheet;
        this.indexes = indexes;
    }
    normalizedIndexes() {
        return normalizeRemovedIndexes(this.indexes);
    }
    columnsSpans() {
        return this.normalizedIndexes().map(normalizedIndex => ColumnsSpan.fromNumberOfColumns(this.sheet, normalizedIndex[0], normalizedIndex[1]));
    }
}
export class Operations {
    constructor(config, dependencyGraph, columnSearch, cellContentParser, parser, stats, lazilyTransformingAstService, namedExpressions, arraySizePredictor) {
        this.dependencyGraph = dependencyGraph;
        this.columnSearch = columnSearch;
        this.cellContentParser = cellContentParser;
        this.parser = parser;
        this.stats = stats;
        this.lazilyTransformingAstService = lazilyTransformingAstService;
        this.namedExpressions = namedExpressions;
        this.arraySizePredictor = arraySizePredictor;
        this.changes = ContentChanges.empty();
        this.allocateNamedExpressionAddressSpace();
        this.maxColumns = config.maxColumns;
        this.maxRows = config.maxRows;
    }
    get sheetMapping() {
        return this.dependencyGraph.sheetMapping;
    }
    get addressMapping() {
        return this.dependencyGraph.addressMapping;
    }
    removeRows(cmd) {
        const rowsRemovals = [];
        for (const rowsToRemove of cmd.rowsSpans()) {
            const rowsRemoval = this.doRemoveRows(rowsToRemove);
            if (rowsRemoval) {
                rowsRemovals.push(rowsRemoval);
            }
        }
        return rowsRemovals;
    }
    addRows(cmd) {
        for (const addedRows of cmd.rowsSpans()) {
            this.doAddRows(addedRows);
        }
    }
    addColumns(cmd) {
        for (const addedColumns of cmd.columnsSpans()) {
            this.doAddColumns(addedColumns);
        }
    }
    removeColumns(cmd) {
        const columnsRemovals = [];
        for (const columnsToRemove of cmd.columnsSpans()) {
            const columnsRemoval = this.doRemoveColumns(columnsToRemove);
            if (columnsRemoval) {
                columnsRemovals.push(columnsRemoval);
            }
        }
        return columnsRemovals;
    }
    removeSheet(sheetId) {
        this.dependencyGraph.removeSheet(sheetId);
        let version;
        this.stats.measure(StatType.TRANSFORM_ASTS, () => {
            const transformation = new RemoveSheetTransformer(sheetId);
            transformation.performEagerTransformations(this.dependencyGraph, this.parser);
            version = this.lazilyTransformingAstService.addTransformation(transformation);
        });
        this.sheetMapping.removeSheet(sheetId);
        this.columnSearch.removeSheet(sheetId);
        const scopedNamedExpressions = this.namedExpressions.getAllNamedExpressionsForScope(sheetId).map((namedexpression) => this.removeNamedExpression(namedexpression.normalizeExpressionName(), sheetId));
        return { version: version, scopedNamedExpressions };
    }
    removeSheetByName(sheetName) {
        const sheetId = this.sheetMapping.fetch(sheetName);
        return this.removeSheet(sheetId);
    }
    clearSheet(sheetId) {
        this.dependencyGraph.clearSheet(sheetId);
        this.columnSearch.removeSheet(sheetId);
    }
    addSheet(name) {
        const sheetId = this.sheetMapping.addSheet(name);
        const sheet = [];
        this.dependencyGraph.addressMapping.autoAddSheet(sheetId, sheet, findBoundaries(sheet));
        return this.sheetMapping.fetchDisplayName(sheetId);
    }
    renameSheet(sheetId, newName) {
        return this.sheetMapping.renameSheet(sheetId, newName);
    }
    moveRows(sheet, startRow, numberOfRows, targetRow) {
        const rowsToAdd = RowsSpan.fromNumberOfRows(sheet, targetRow, numberOfRows);
        this.lazilyTransformingAstService.beginCombinedMode(sheet);
        this.doAddRows(rowsToAdd);
        if (targetRow < startRow) {
            startRow += numberOfRows;
        }
        const startAddress = simpleCellAddress(sheet, 0, startRow);
        const targetAddress = simpleCellAddress(sheet, 0, targetRow);
        this.moveCells(startAddress, Number.POSITIVE_INFINITY, numberOfRows, targetAddress);
        const rowsToRemove = RowsSpan.fromNumberOfRows(sheet, startRow, numberOfRows);
        this.doRemoveRows(rowsToRemove);
        return this.lazilyTransformingAstService.commitCombinedMode();
    }
    moveColumns(sheet, startColumn, numberOfColumns, targetColumn) {
        const columnsToAdd = ColumnsSpan.fromNumberOfColumns(sheet, targetColumn, numberOfColumns);
        this.lazilyTransformingAstService.beginCombinedMode(sheet);
        this.doAddColumns(columnsToAdd);
        if (targetColumn < startColumn) {
            startColumn += numberOfColumns;
        }
        const startAddress = simpleCellAddress(sheet, startColumn, 0);
        const targetAddress = simpleCellAddress(sheet, targetColumn, 0);
        this.moveCells(startAddress, numberOfColumns, Number.POSITIVE_INFINITY, targetAddress);
        const columnsToRemove = ColumnsSpan.fromNumberOfColumns(sheet, startColumn, numberOfColumns);
        this.doRemoveColumns(columnsToRemove);
        return this.lazilyTransformingAstService.commitCombinedMode();
    }
    moveCells(sourceLeftCorner, width, height, destinationLeftCorner) {
        this.ensureItIsPossibleToMoveCells(sourceLeftCorner, width, height, destinationLeftCorner);
        const sourceRange = AbsoluteCellRange.spanFrom(sourceLeftCorner, width, height);
        const targetRange = AbsoluteCellRange.spanFrom(destinationLeftCorner, width, height);
        const toRight = destinationLeftCorner.col - sourceLeftCorner.col;
        const toBottom = destinationLeftCorner.row - sourceLeftCorner.row;
        const toSheet = destinationLeftCorner.sheet;
        const currentDataAtTarget = this.getRangeClipboardCells(targetRange);
        const valuesToRemove = this.dependencyGraph.rawValuesFromRange(targetRange);
        this.columnSearch.removeValues(valuesToRemove);
        const valuesToMove = this.dependencyGraph.rawValuesFromRange(sourceRange);
        this.columnSearch.moveValues(valuesToMove, toRight, toBottom, toSheet);
        let version;
        this.stats.measure(StatType.TRANSFORM_ASTS, () => {
            const transformation = new MoveCellsTransformer(sourceRange, toRight, toBottom, toSheet);
            transformation.performEagerTransformations(this.dependencyGraph, this.parser);
            version = this.lazilyTransformingAstService.addTransformation(transformation);
        });
        this.dependencyGraph.moveCells(sourceRange, toRight, toBottom, toSheet);
        const addedGlobalNamedExpressions = this.updateNamedExpressionsForMovedCells(sourceLeftCorner, width, height, destinationLeftCorner);
        return {
            version: version,
            overwrittenCellsData: currentDataAtTarget,
            addedGlobalNamedExpressions: addedGlobalNamedExpressions
        };
    }
    setRowOrder(sheetId, rowMapping) {
        const buffer = [];
        let oldContent = [];
        for (const [source, target] of rowMapping) {
            if (source !== target) {
                const rowRange = AbsoluteCellRange.spanFrom({ sheet: sheetId, col: 0, row: source }, Infinity, 1);
                const row = this.getRangeClipboardCells(rowRange);
                oldContent = oldContent.concat(row);
                buffer.push(row.map(([{ sheet, col }, cell]) => [{ sheet, col, row: target }, cell]));
            }
        }
        buffer.forEach(row => this.restoreClipboardCells(sheetId, row.values()));
        return oldContent;
    }
    setColumnOrder(sheetId, columnMapping) {
        const buffer = [];
        let oldContent = [];
        for (const [source, target] of columnMapping) {
            if (source !== target) {
                const rowRange = AbsoluteCellRange.spanFrom({ sheet: sheetId, col: source, row: 0 }, 1, Infinity);
                const column = this.getRangeClipboardCells(rowRange);
                oldContent = oldContent.concat(column);
                buffer.push(column.map(([{ sheet, col: _col, row }, cell]) => [{ sheet, col: target, row }, cell]));
            }
        }
        buffer.forEach(column => this.restoreClipboardCells(sheetId, column.values()));
        return oldContent;
    }
    addNamedExpression(expressionName, expression, sheetId, options) {
        const namedExpression = this.namedExpressions.addNamedExpression(expressionName, sheetId, options);
        this.storeNamedExpressionInCell(namedExpression.address, expression);
        this.adjustNamedExpressionEdges(namedExpression, expressionName, sheetId);
    }
    restoreNamedExpression(namedExpression, content, sheetId) {
        const expressionName = namedExpression.displayName;
        this.restoreCell(namedExpression.address, content);
        const restoredNamedExpression = this.namedExpressions.restoreNamedExpression(namedExpression, sheetId);
        this.adjustNamedExpressionEdges(restoredNamedExpression, expressionName, sheetId);
    }
    changeNamedExpressionExpression(expressionName, newExpression, sheetId, options) {
        const namedExpression = this.namedExpressions.namedExpressionForScope(expressionName, sheetId);
        if (!namedExpression) {
            throw new NamedExpressionDoesNotExistError(expressionName);
        }
        const oldNamedExpression = namedExpression.copy();
        namedExpression.options = options;
        const content = this.getClipboardCell(namedExpression.address);
        this.storeNamedExpressionInCell(namedExpression.address, newExpression);
        return [oldNamedExpression, content];
    }
    removeNamedExpression(expressionName, sheetId) {
        const namedExpression = this.namedExpressions.namedExpressionForScope(expressionName, sheetId);
        if (!namedExpression) {
            throw new NamedExpressionDoesNotExistError(expressionName);
        }
        this.namedExpressions.remove(namedExpression.displayName, sheetId);
        const content = this.getClipboardCell(namedExpression.address);
        if (sheetId !== undefined) {
            const globalNamedExpression = this.namedExpressions.workbookNamedExpressionOrPlaceholder(expressionName);
            this.dependencyGraph.exchangeNode(namedExpression.address, globalNamedExpression.address);
        }
        else {
            this.dependencyGraph.setCellEmpty(namedExpression.address);
        }
        return [
            namedExpression,
            content
        ];
    }
    ensureItIsPossibleToMoveCells(sourceLeftCorner, width, height, destinationLeftCorner) {
        if (invalidSimpleCellAddress(sourceLeftCorner) ||
            !((isPositiveInteger(width) && isPositiveInteger(height)) || isRowOrColumnRange(sourceLeftCorner, width, height)) ||
            invalidSimpleCellAddress(destinationLeftCorner) ||
            !this.sheetMapping.hasSheetWithId(sourceLeftCorner.sheet) ||
            !this.sheetMapping.hasSheetWithId(destinationLeftCorner.sheet)) {
            throw new InvalidArgumentsError('a valid range of cells to move.');
        }
        const sourceRange = AbsoluteCellRange.spanFrom(sourceLeftCorner, width, height);
        const targetRange = AbsoluteCellRange.spanFrom(destinationLeftCorner, width, height);
        if (targetRange.exceedsSheetSizeLimits(this.maxColumns, this.maxRows)) {
            throw new SheetSizeLimitExceededError();
        }
        if (this.dependencyGraph.arrayMapping.isFormulaArrayInRange(sourceRange)) {
            throw new SourceLocationHasArrayError();
        }
        if (this.dependencyGraph.arrayMapping.isFormulaArrayInRange(targetRange)) {
            throw new TargetLocationHasArrayError();
        }
    }
    restoreClipboardCells(sourceSheetId, cells) {
        const addedNamedExpressions = [];
        for (const [address, clipboardCell] of cells) {
            this.restoreCell(address, clipboardCell);
            if (clipboardCell.type === ClipboardCellType.FORMULA) {
                const { dependencies } = this.parser.fetchCachedResult(clipboardCell.hash);
                addedNamedExpressions.push(...this.updateNamedExpressionsForTargetAddress(sourceSheetId, address, dependencies));
            }
        }
        return addedNamedExpressions;
    }
    restoreCell(address, clipboardCell) {
        switch (clipboardCell.type) {
            case ClipboardCellType.VALUE: {
                this.setValueToCell(clipboardCell, address);
                break;
            }
            case ClipboardCellType.FORMULA: {
                this.setFormulaToCellFromCache(clipboardCell.hash, address);
                break;
            }
            case ClipboardCellType.EMPTY: {
                this.setCellEmpty(address);
                break;
            }
            case ClipboardCellType.PARSING_ERROR: {
                this.setParsingErrorToCell(clipboardCell.rawInput, clipboardCell.errors, address);
                break;
            }
        }
    }
    getOldContent(address) {
        const vertex = this.dependencyGraph.getCell(address);
        if (vertex === undefined || vertex instanceof EmptyCellVertex) {
            return [address, { type: ClipboardCellType.EMPTY }];
        }
        else if (vertex instanceof ValueCellVertex) {
            return [address, Object.assign({ type: ClipboardCellType.VALUE }, vertex.getValues())];
        }
        else if (vertex instanceof FormulaVertex) {
            return [vertex.getAddress(this.lazilyTransformingAstService), {
                    type: ClipboardCellType.FORMULA,
                    hash: this.parser.computeHashFromAst(vertex.getFormula(this.lazilyTransformingAstService))
                }];
        }
        else if (vertex instanceof ParsingErrorVertex) {
            return [address, { type: ClipboardCellType.PARSING_ERROR, rawInput: vertex.rawInput, errors: vertex.errors }];
        }
        throw Error('Trying to copy unsupported type');
    }
    getClipboardCell(address) {
        const vertex = this.dependencyGraph.getCell(address);
        if (vertex === undefined || vertex instanceof EmptyCellVertex) {
            return { type: ClipboardCellType.EMPTY };
        }
        else if (vertex instanceof ValueCellVertex) {
            return Object.assign({ type: ClipboardCellType.VALUE }, vertex.getValues());
        }
        else if (vertex instanceof ArrayVertex) {
            const val = vertex.getArrayCellValue(address);
            if (val === EmptyValue) {
                return { type: ClipboardCellType.EMPTY };
            }
            return { type: ClipboardCellType.VALUE, parsedValue: val, rawValue: vertex.getArrayCellRawValue(address) };
        }
        else if (vertex instanceof FormulaCellVertex) {
            return {
                type: ClipboardCellType.FORMULA,
                hash: this.parser.computeHashFromAst(vertex.getFormula(this.lazilyTransformingAstService))
            };
        }
        else if (vertex instanceof ParsingErrorVertex) {
            return { type: ClipboardCellType.PARSING_ERROR, rawInput: vertex.rawInput, errors: vertex.errors };
        }
        throw Error('Trying to copy unsupported type');
    }
    getSheetClipboardCells(sheet) {
        const sheetHeight = this.dependencyGraph.getSheetHeight(sheet);
        const sheetWidth = this.dependencyGraph.getSheetWidth(sheet);
        const arr = new Array(sheetHeight);
        for (let i = 0; i < sheetHeight; i++) {
            arr[i] = new Array(sheetWidth);
            for (let j = 0; j < sheetWidth; j++) {
                const address = simpleCellAddress(sheet, j, i);
                arr[i][j] = this.getClipboardCell(address);
            }
        }
        return arr;
    }
    getRangeClipboardCells(range) {
        const result = [];
        for (const address of range.addresses(this.dependencyGraph)) {
            result.push([address, this.getClipboardCell(address)]);
        }
        return result;
    }
    setCellContent(address, newCellContent) {
        const parsedCellContent = this.cellContentParser.parse(newCellContent);
        const oldContent = this.getOldContent(address);
        if (parsedCellContent instanceof CellContent.Formula) {
            const parserResult = this.parser.parse(parsedCellContent.formula, address);
            const { ast, errors } = parserResult;
            if (errors.length > 0) {
                this.setParsingErrorToCell(parsedCellContent.formula, errors, address);
            }
            else {
                const size = this.arraySizePredictor.checkArraySize(ast, address);
                this.setFormulaToCell(address, size, parserResult);
            }
        }
        else if (parsedCellContent instanceof CellContent.Empty) {
            this.setCellEmpty(address);
        }
        else {
            this.setValueToCell({ parsedValue: parsedCellContent.value, rawValue: newCellContent }, address);
        }
        return oldContent;
    }
    setSheetContent(sheetId, newSheetContent) {
        this.clearSheet(sheetId);
        for (let i = 0; i < newSheetContent.length; i++) {
            for (let j = 0; j < newSheetContent[i].length; j++) {
                const address = simpleCellAddress(sheetId, j, i);
                this.setCellContent(address, newSheetContent[i][j]);
            }
        }
    }
    setParsingErrorToCell(rawInput, errors, address) {
        const oldValue = this.dependencyGraph.getCellValue(address);
        const vertex = new ParsingErrorVertex(errors, rawInput);
        const arrayChanges = this.dependencyGraph.setParsingErrorToCell(address, vertex);
        this.columnSearch.remove(getRawValue(oldValue), address);
        this.columnSearch.applyChanges(arrayChanges.getChanges());
        this.changes.addAll(arrayChanges);
        this.changes.addChange(vertex.getCellValue(), address);
    }
    setFormulaToCell(address, size, { ast, hasVolatileFunction, hasStructuralChangeFunction, dependencies }) {
        const oldValue = this.dependencyGraph.getCellValue(address);
        const arrayChanges = this.dependencyGraph.setFormulaToCell(address, ast, absolutizeDependencies(dependencies, address), size, hasVolatileFunction, hasStructuralChangeFunction);
        this.columnSearch.remove(getRawValue(oldValue), address);
        this.columnSearch.applyChanges(arrayChanges.getChanges());
        this.changes.addAll(arrayChanges);
    }
    setValueToCell(value, address) {
        const oldValue = this.dependencyGraph.getCellValue(address);
        const arrayChanges = this.dependencyGraph.setValueToCell(address, value);
        this.columnSearch.change(getRawValue(oldValue), getRawValue(value.parsedValue), address);
        this.columnSearch.applyChanges(arrayChanges.getChanges().filter(change => !equalSimpleCellAddress(change.address, address)));
        this.changes.addAll(arrayChanges);
        this.changes.addChange(value.parsedValue, address);
    }
    setCellEmpty(address) {
        if (this.dependencyGraph.isArrayInternalCell(address)) {
            return;
        }
        const oldValue = this.dependencyGraph.getCellValue(address);
        const arrayChanges = this.dependencyGraph.setCellEmpty(address);
        this.columnSearch.remove(getRawValue(oldValue), address);
        this.columnSearch.applyChanges(arrayChanges.getChanges());
        this.changes.addAll(arrayChanges);
        this.changes.addChange(EmptyValue, address);
    }
    setFormulaToCellFromCache(formulaHash, address) {
        const { ast, hasVolatileFunction, hasStructuralChangeFunction, dependencies } = this.parser.fetchCachedResult(formulaHash);
        const absoluteDependencies = absolutizeDependencies(dependencies, address);
        const [cleanedAst] = new CleanOutOfScopeDependenciesTransformer(address.sheet).transformSingleAst(ast, address);
        this.parser.rememberNewAst(cleanedAst);
        const cleanedDependencies = filterDependenciesOutOfScope(absoluteDependencies);
        const size = this.arraySizePredictor.checkArraySize(ast, address);
        this.dependencyGraph.setFormulaToCell(address, cleanedAst, cleanedDependencies, size, hasVolatileFunction, hasStructuralChangeFunction);
    }
    /**
     * Returns true if row number is outside of given sheet.
     *
     * @param row - row number
     * @param sheet - sheet id number
     */
    rowEffectivelyNotInSheet(row, sheet) {
        const height = this.dependencyGraph.addressMapping.getHeight(sheet);
        return row >= height;
    }
    getAndClearContentChanges() {
        const changes = this.changes;
        this.changes = ContentChanges.empty();
        return changes;
    }
    forceApplyPostponedTransformations() {
        this.dependencyGraph.forceApplyPostponedTransformations();
    }
    /**
     * Removes multiple rows from sheet. </br>
     * Does nothing if rows are outside of effective sheet size.
     *
     * @param sheet - sheet id from which rows will be removed
     * @param rowStart - number of the first row to be deleted
     * @param rowEnd - number of the last row to be deleted
     * */
    doRemoveRows(rowsToRemove) {
        if (this.rowEffectivelyNotInSheet(rowsToRemove.rowStart, rowsToRemove.sheet)) {
            return;
        }
        const removedCells = [];
        for (const [address] of this.dependencyGraph.entriesFromRowsSpan(rowsToRemove)) {
            removedCells.push({ address, cellType: this.getClipboardCell(address) });
        }
        const { affectedArrays, contentChanges } = this.dependencyGraph.removeRows(rowsToRemove);
        this.columnSearch.applyChanges(contentChanges.getChanges());
        let version;
        this.stats.measure(StatType.TRANSFORM_ASTS, () => {
            const transformation = new RemoveRowsTransformer(rowsToRemove);
            transformation.performEagerTransformations(this.dependencyGraph, this.parser);
            version = this.lazilyTransformingAstService.addTransformation(transformation);
        });
        this.rewriteAffectedArrays(affectedArrays);
        return { version: version, removedCells, rowFrom: rowsToRemove.rowStart, rowCount: rowsToRemove.numberOfRows };
    }
    /**
     * Removes multiple columns from sheet. </br>
     * Does nothing if columns are outside of effective sheet size.
     *
     * @param sheet - sheet id from which columns will be removed
     * @param columnStart - number of the first column to be deleted
     * @param columnEnd - number of the last row to be deleted
     */
    doRemoveColumns(columnsToRemove) {
        if (this.columnEffectivelyNotInSheet(columnsToRemove.columnStart, columnsToRemove.sheet)) {
            return;
        }
        const removedCells = [];
        for (const [address] of this.dependencyGraph.entriesFromColumnsSpan(columnsToRemove)) {
            removedCells.push({ address, cellType: this.getClipboardCell(address) });
        }
        const { affectedArrays, contentChanges } = this.dependencyGraph.removeColumns(columnsToRemove);
        this.columnSearch.applyChanges(contentChanges.getChanges());
        this.columnSearch.removeColumns(columnsToRemove);
        let version;
        this.stats.measure(StatType.TRANSFORM_ASTS, () => {
            const transformation = new RemoveColumnsTransformer(columnsToRemove);
            transformation.performEagerTransformations(this.dependencyGraph, this.parser);
            version = this.lazilyTransformingAstService.addTransformation(transformation);
        });
        this.rewriteAffectedArrays(affectedArrays);
        return {
            version: version,
            removedCells,
            columnFrom: columnsToRemove.columnStart,
            columnCount: columnsToRemove.numberOfColumns
        };
    }
    /**
     * Add multiple rows to sheet. </br>
     * Does nothing if rows are outside of effective sheet size.
     *
     * @param sheet - sheet id in which rows will be added
     * @param row - row number above which the rows will be added
     * @param numberOfRowsToAdd - number of rows to add
     */
    doAddRows(addedRows) {
        if (this.rowEffectivelyNotInSheet(addedRows.rowStart, addedRows.sheet)) {
            return;
        }
        const { affectedArrays } = this.dependencyGraph.addRows(addedRows);
        this.stats.measure(StatType.TRANSFORM_ASTS, () => {
            const transformation = new AddRowsTransformer(addedRows);
            transformation.performEagerTransformations(this.dependencyGraph, this.parser);
            this.lazilyTransformingAstService.addTransformation(transformation);
        });
        this.rewriteAffectedArrays(affectedArrays);
    }
    rewriteAffectedArrays(affectedArrays) {
        for (const arrayVertex of affectedArrays.values()) {
            if (arrayVertex.array.size.isRef) {
                continue;
            }
            const ast = arrayVertex.getFormula(this.lazilyTransformingAstService);
            const address = arrayVertex.getAddress(this.lazilyTransformingAstService);
            const hash = this.parser.computeHashFromAst(ast);
            this.setFormulaToCellFromCache(hash, address);
        }
    }
    /**
     * Add multiple columns to sheet </br>
     * Does nothing if columns are outside of effective sheet size
     *
     * @param sheet - sheet id in which columns will be added
     * @param column - column number above which the columns will be added
     * @param numberOfColumns - number of columns to add
     */
    doAddColumns(addedColumns) {
        if (this.columnEffectivelyNotInSheet(addedColumns.columnStart, addedColumns.sheet)) {
            return;
        }
        const { affectedArrays, contentChanges } = this.dependencyGraph.addColumns(addedColumns);
        this.columnSearch.addColumns(addedColumns);
        this.columnSearch.applyChanges(contentChanges.getChanges());
        this.stats.measure(StatType.TRANSFORM_ASTS, () => {
            const transformation = new AddColumnsTransformer(addedColumns);
            transformation.performEagerTransformations(this.dependencyGraph, this.parser);
            this.lazilyTransformingAstService.addTransformation(transformation);
        });
        this.rewriteAffectedArrays(affectedArrays);
    }
    /**
     * Returns true if row number is outside of given sheet.
     *
     * @param column - row number
     * @param sheet - sheet id number
     */
    columnEffectivelyNotInSheet(column, sheet) {
        const width = this.dependencyGraph.addressMapping.getWidth(sheet);
        return column >= width;
    }
    adjustNamedExpressionEdges(namedExpression, expressionName, sheetId) {
        if (sheetId === undefined) {
            return;
        }
        const localVertex = this.dependencyGraph.fetchCellOrCreateEmpty(namedExpression.address);
        const globalNamedExpression = this.namedExpressions.workbookNamedExpressionOrPlaceholder(expressionName);
        const globalVertex = this.dependencyGraph.fetchCellOrCreateEmpty(globalNamedExpression.address);
        for (const adjacentNode of this.dependencyGraph.graph.adjacentNodes(globalVertex)) {
            if (adjacentNode instanceof FormulaCellVertex && adjacentNode.getAddress(this.lazilyTransformingAstService).sheet === sheetId) {
                const ast = adjacentNode.getFormula(this.lazilyTransformingAstService);
                const formulaAddress = adjacentNode.getAddress(this.lazilyTransformingAstService);
                const { dependencies } = this.parser.fetchCachedResultForAst(ast);
                for (const dependency of absolutizeDependencies(dependencies, formulaAddress)) {
                    if (dependency instanceof NamedExpressionDependency && dependency.name.toLowerCase() === namedExpression.displayName.toLowerCase()) {
                        this.dependencyGraph.graph.removeEdge(globalVertex, adjacentNode);
                        this.dependencyGraph.graph.addEdge(localVertex, adjacentNode);
                    }
                }
            }
        }
    }
    storeNamedExpressionInCell(address, expression) {
        const parsedCellContent = this.cellContentParser.parse(expression);
        if (parsedCellContent instanceof CellContent.Formula) {
            const parsingResult = this.parser.parse(parsedCellContent.formula, simpleCellAddress(-1, 0, 0));
            if (doesContainRelativeReferences(parsingResult.ast)) {
                throw new NoRelativeAddressesAllowedError();
            }
            const { ast, hasVolatileFunction, hasStructuralChangeFunction, dependencies } = parsingResult;
            this.dependencyGraph.setFormulaToCell(address, ast, absolutizeDependencies(dependencies, address), ArraySize.scalar(), hasVolatileFunction, hasStructuralChangeFunction);
        }
        else if (parsedCellContent instanceof CellContent.Empty) {
            this.setCellEmpty(address);
        }
        else {
            this.setValueToCell({ parsedValue: parsedCellContent.value, rawValue: expression }, address);
        }
    }
    updateNamedExpressionsForMovedCells(sourceLeftCorner, width, height, destinationLeftCorner) {
        if (sourceLeftCorner.sheet === destinationLeftCorner.sheet) {
            return [];
        }
        const addedGlobalNamedExpressions = [];
        const targetRange = AbsoluteCellRange.spanFrom(destinationLeftCorner, width, height);
        for (const formulaAddress of targetRange.addresses(this.dependencyGraph)) {
            const vertex = this.addressMapping.fetchCell(formulaAddress);
            if (vertex instanceof FormulaCellVertex && formulaAddress.sheet !== sourceLeftCorner.sheet) {
                const ast = vertex.getFormula(this.lazilyTransformingAstService);
                const { dependencies } = this.parser.fetchCachedResultForAst(ast);
                addedGlobalNamedExpressions.push(...this.updateNamedExpressionsForTargetAddress(sourceLeftCorner.sheet, formulaAddress, dependencies));
            }
        }
        return addedGlobalNamedExpressions;
    }
    updateNamedExpressionsForTargetAddress(sourceSheet, targetAddress, dependencies) {
        if (sourceSheet === targetAddress.sheet) {
            return [];
        }
        const addedGlobalNamedExpressions = [];
        const vertex = this.addressMapping.fetchCell(targetAddress);
        for (const namedExpressionDependency of absolutizeDependencies(dependencies, targetAddress)) {
            if (!(namedExpressionDependency instanceof NamedExpressionDependency)) {
                continue;
            }
            const expressionName = namedExpressionDependency.name;
            const sourceVertex = this.dependencyGraph.fetchNamedExpressionVertex(expressionName, sourceSheet);
            const namedExpressionInTargetScope = this.namedExpressions.isExpressionInScope(expressionName, targetAddress.sheet);
            const targetScopeExpressionVertex = namedExpressionInTargetScope
                ? this.dependencyGraph.fetchNamedExpressionVertex(expressionName, targetAddress.sheet)
                : this.copyOrFetchGlobalNamedExpressionVertex(expressionName, sourceVertex, addedGlobalNamedExpressions);
            if (targetScopeExpressionVertex !== sourceVertex) {
                this.dependencyGraph.graph.softRemoveEdge(sourceVertex, vertex);
                this.dependencyGraph.graph.addEdge(targetScopeExpressionVertex, vertex);
            }
        }
        return addedGlobalNamedExpressions;
    }
    allocateNamedExpressionAddressSpace() {
        this.dependencyGraph.addressMapping.addSheet(-1, new SparseStrategy(0, 0));
    }
    copyOrFetchGlobalNamedExpressionVertex(expressionName, sourceVertex, addedNamedExpressions) {
        let expression = this.namedExpressions.namedExpressionForScope(expressionName);
        if (expression === undefined) {
            expression = this.namedExpressions.addNamedExpression(expressionName);
            addedNamedExpressions.push(expression.normalizeExpressionName());
            if (sourceVertex instanceof FormulaCellVertex) {
                const parsingResult = this.parser.fetchCachedResultForAst(sourceVertex.getFormula(this.lazilyTransformingAstService));
                const { ast, hasVolatileFunction, hasStructuralChangeFunction, dependencies } = parsingResult;
                this.dependencyGraph.setFormulaToCell(expression.address, ast, absolutizeDependencies(dependencies, expression.address), ArraySize.scalar(), hasVolatileFunction, hasStructuralChangeFunction);
            }
            else if (sourceVertex instanceof EmptyCellVertex) {
                this.setCellEmpty(expression.address);
            }
            else if (sourceVertex instanceof ValueCellVertex) {
                this.setValueToCell(sourceVertex.getValues(), expression.address);
            }
        }
        return this.dependencyGraph.fetchCellOrCreateEmpty(expression.address);
    }
}
export function normalizeRemovedIndexes(indexes) {
    if (indexes.length <= 1) {
        return indexes;
    }
    const sorted = [...indexes].sort(([a], [b]) => a - b);
    /* merge overlapping and adjacent indexes */
    const merged = sorted.reduce((acc, [startIndex, amount]) => {
        const previous = acc[acc.length - 1];
        const lastIndex = previous[0] + previous[1];
        if (startIndex <= lastIndex) {
            previous[1] += Math.max(0, amount - (lastIndex - startIndex));
        }
        else {
            acc.push([startIndex, amount]);
        }
        return acc;
    }, [sorted[0]]);
    /* shift further indexes */
    let shift = 0;
    for (let i = 0; i < merged.length; ++i) {
        merged[i][0] -= shift;
        shift += merged[i][1];
    }
    return merged;
}
export function normalizeAddedIndexes(indexes) {
    if (indexes.length <= 1) {
        return indexes;
    }
    const sorted = [...indexes].sort(([a], [b]) => a - b);
    /* merge indexes with same start */
    const merged = sorted.reduce((acc, [startIndex, amount]) => {
        const previous = acc[acc.length - 1];
        if (startIndex === previous[0]) {
            previous[1] = Math.max(previous[1], amount);
        }
        else {
            acc.push([startIndex, amount]);
        }
        return acc;
    }, [sorted[0]]);
    /* shift further indexes */
    let shift = 0;
    for (let i = 0; i < merged.length; ++i) {
        merged[i][0] += shift;
        shift += merged[i][1];
    }
    return merged;
}
function isPositiveInteger(x) {
    return Number.isInteger(x) && x > 0;
}
function isRowOrColumnRange(leftCorner, width, height) {
    return (leftCorner.row === 0 && isPositiveInteger(width) && height === Number.POSITIVE_INFINITY)
        || (leftCorner.col === 0 && isPositiveInteger(height) && width === Number.POSITIVE_INFINITY);
}
