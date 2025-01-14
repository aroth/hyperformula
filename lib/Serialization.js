/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { simpleCellAddress } from './Cell';
import { ArrayVertex, FormulaCellVertex, ParsingErrorVertex } from './DependencyGraph';
import { buildLexerConfig, Unparser } from './parser';
export class Serialization {
    constructor(dependencyGraph, unparser, exporter) {
        this.dependencyGraph = dependencyGraph;
        this.unparser = unparser;
        this.exporter = exporter;
    }
    getCellFormula(address, targetAddress) {
        const formulaVertex = this.dependencyGraph.getCell(address);
        if (formulaVertex instanceof FormulaCellVertex) {
            const formula = formulaVertex.getFormula(this.dependencyGraph.lazilyTransformingAstService);
            targetAddress = targetAddress !== null && targetAddress !== void 0 ? targetAddress : address;
            return this.unparser.unparse(formula, targetAddress);
        }
        else if (formulaVertex instanceof ArrayVertex) {
            const arrayVertexAddress = formulaVertex.getAddress(this.dependencyGraph.lazilyTransformingAstService);
            if (arrayVertexAddress.row !== address.row || arrayVertexAddress.col !== address.col || arrayVertexAddress.sheet !== address.sheet) {
                return undefined;
            }
            targetAddress = targetAddress !== null && targetAddress !== void 0 ? targetAddress : address;
            const formula = formulaVertex.getFormula(this.dependencyGraph.lazilyTransformingAstService);
            if (formula !== undefined) {
                return this.unparser.unparse(formula, targetAddress);
            }
        }
        else if (formulaVertex instanceof ParsingErrorVertex) {
            return formulaVertex.getFormula();
        }
        return undefined;
    }
    getCellSerialized(address, targetAddress) {
        var _a;
        return (_a = this.getCellFormula(address, targetAddress)) !== null && _a !== void 0 ? _a : this.getRawValue(address);
    }
    getCellValue(address) {
        return this.exporter.exportValue(this.dependencyGraph.getScalarValue(address));
    }
    getRawValue(address) {
        return this.dependencyGraph.getRawValue(address);
    }
    getSheetValues(sheet) {
        return this.genericSheetGetter(sheet, (arg) => this.getCellValue(arg));
    }
    getSheetFormulas(sheet) {
        return this.genericSheetGetter(sheet, (arg) => this.getCellFormula(arg));
    }
    genericSheetGetter(sheet, getter) {
        const sheetHeight = this.dependencyGraph.getSheetHeight(sheet);
        const sheetWidth = this.dependencyGraph.getSheetWidth(sheet);
        const arr = new Array(sheetHeight);
        for (let i = 0; i < sheetHeight; i++) {
            arr[i] = new Array(sheetWidth);
            for (let j = 0; j < sheetWidth; j++) {
                const address = simpleCellAddress(sheet, j, i);
                arr[i][j] = getter(address);
            }
            for (let j = sheetWidth - 1; j >= 0; j--) {
                if (arr[i][j] === null || arr[i][j] === undefined) {
                    arr[i].pop();
                }
                else {
                    break;
                }
            }
        }
        for (let i = sheetHeight - 1; i >= 0; i--) {
            if (arr[i].length === 0) {
                arr.pop();
            }
            else {
                break;
            }
        }
        return arr;
    }
    genericAllSheetsGetter(sheetGetter) {
        const result = {};
        for (const sheetName of this.dependencyGraph.sheetMapping.displayNames()) {
            const sheetId = this.dependencyGraph.sheetMapping.fetch(sheetName);
            result[sheetName] = sheetGetter(sheetId);
        }
        return result;
    }
    getSheetSerialized(sheet) {
        return this.genericSheetGetter(sheet, (arg) => this.getCellSerialized(arg));
    }
    getAllSheetsValues() {
        return this.genericAllSheetsGetter((arg) => this.getSheetValues(arg));
    }
    getAllSheetsFormulas() {
        return this.genericAllSheetsGetter((arg) => this.getSheetFormulas(arg));
    }
    getAllSheetsSerialized() {
        return this.genericAllSheetsGetter((arg) => this.getSheetSerialized(arg));
    }
    getAllNamedExpressionsSerialized() {
        const idMap = [];
        let id = 0;
        for (const sheetName of this.dependencyGraph.sheetMapping.displayNames()) {
            const sheetId = this.dependencyGraph.sheetMapping.fetch(sheetName);
            idMap[sheetId] = id;
            id++;
        }
        return this.dependencyGraph.namedExpressions.getAllNamedExpressions().map((entry) => {
            return {
                name: entry.expression.displayName,
                expression: this.getCellSerialized(entry.expression.address),
                scope: entry.scope !== undefined ? idMap[entry.scope] : undefined,
                options: entry.expression.options
            };
        });
    }
    withNewConfig(newConfig, namedExpressions) {
        const newUnparser = new Unparser(newConfig, buildLexerConfig(newConfig), this.dependencyGraph.sheetMapping.fetchDisplayName, namedExpressions);
        return new Serialization(this.dependencyGraph, newUnparser, this.exporter);
    }
}
