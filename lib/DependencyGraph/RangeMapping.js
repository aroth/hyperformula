/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { AbsoluteCellRange } from '../AbsoluteCellRange';
import { simpleCellAddress } from '../Cell';
/**
 * Mapping from address ranges to range vertices
 */
export class RangeMapping {
    constructor() {
        /** Map in which actual data is stored. */
        this.rangeMapping = new Map();
    }
    getMappingSize(sheet) {
        var _a, _b;
        return (_b = (_a = this.rangeMapping.get(sheet)) === null || _a === void 0 ? void 0 : _a.size) !== null && _b !== void 0 ? _b : 0;
    }
    /**
     * Saves range vertex
     *
     * @param vertex - vertex to save
     */
    setRange(vertex) {
        let sheetMap = this.rangeMapping.get(vertex.getStart().sheet);
        if (sheetMap === undefined) {
            sheetMap = new Map();
            this.rangeMapping.set(vertex.getStart().sheet, sheetMap);
        }
        const key = keyFromAddresses(vertex.getStart(), vertex.getEnd());
        sheetMap.set(key, vertex);
    }
    removeRange(vertex) {
        const sheet = vertex.getStart().sheet;
        const sheetMap = this.rangeMapping.get(sheet);
        if (sheetMap === undefined) {
            return;
        }
        const key = keyFromAddresses(vertex.getStart(), vertex.getEnd());
        sheetMap.delete(key);
        if (sheetMap.size === 0) {
            this.rangeMapping.delete(sheet);
        }
    }
    /**
     * Returns associated vertex for given range
     *
     * @param start - top-left corner of the range
     * @param end - bottom-right corner of the range
     */
    getRange(start, end) {
        const sheetMap = this.rangeMapping.get(start.sheet);
        const key = keyFromAddresses(start, end);
        return sheetMap === null || sheetMap === void 0 ? void 0 : sheetMap.get(key);
    }
    fetchRange(start, end) {
        const maybeRange = this.getRange(start, end);
        if (!maybeRange) {
            throw Error('Range does not exist');
        }
        return maybeRange;
    }
    truncateRanges(span, coordinate) {
        const verticesToRemove = Array();
        const updated = Array();
        const verticesWithChangedSize = Array();
        const sheet = span.sheet;
        for (const [key, vertex] of this.entriesFromSheet(span.sheet)) {
            const range = vertex.range;
            if (span.start <= coordinate(vertex.range.end)) {
                range.removeSpan(span);
                if (range.shouldBeRemoved()) {
                    this.removeByKey(sheet, key);
                    verticesToRemove.push(vertex);
                }
                else {
                    updated.push([key, vertex]);
                }
                verticesWithChangedSize.push(vertex);
            }
        }
        const verticesToMerge = [];
        updated.sort((left, right) => compareBy(left[1], right[1], coordinate));
        for (const [oldKey, vertex] of updated) {
            const newKey = keyFromRange(vertex.range);
            if (newKey === oldKey) {
                continue;
            }
            const existingVertex = this.getByKey(sheet, newKey);
            this.removeByKey(sheet, oldKey);
            if (existingVertex !== undefined && vertex != existingVertex) {
                verticesToMerge.push([existingVertex, vertex]);
            }
            else {
                this.setRange(vertex);
            }
        }
        return {
            verticesToRemove,
            verticesToMerge,
            verticesWithChangedSize
        };
    }
    moveAllRangesInSheetAfterRowByRows(sheet, row, numberOfRows) {
        return this.updateVerticesFromSheet(sheet, (key, vertex) => {
            if (row <= vertex.start.row) {
                vertex.range.shiftByRows(numberOfRows);
                return {
                    changedSize: false,
                    vertex: vertex
                };
            }
            else if (row > vertex.start.row && row <= vertex.end.row) {
                vertex.range.expandByRows(numberOfRows);
                return {
                    changedSize: true,
                    vertex: vertex
                };
            }
            else {
                return undefined;
            }
        });
    }
    moveAllRangesInSheetAfterColumnByColumns(sheet, column, numberOfColumns) {
        return this.updateVerticesFromSheet(sheet, (key, vertex) => {
            if (column <= vertex.start.col) {
                vertex.range.shiftByColumns(numberOfColumns);
                return {
                    changedSize: false,
                    vertex: vertex
                };
            }
            else if (column > vertex.start.col && column <= vertex.end.col) {
                vertex.range.expandByColumns(numberOfColumns);
                return {
                    changedSize: true,
                    vertex: vertex
                };
            }
            else {
                return undefined;
            }
        });
    }
    moveRangesInsideSourceRange(sourceRange, toRight, toBottom, toSheet) {
        this.updateVerticesFromSheet(sourceRange.sheet, (key, vertex) => {
            if (sourceRange.containsRange(vertex.range)) {
                vertex.range.shiftByColumns(toRight);
                vertex.range.shiftByRows(toBottom);
                vertex.range.moveToSheet(toSheet);
                return {
                    changedSize: false,
                    vertex: vertex
                };
            }
            else {
                return undefined;
            }
        });
    }
    removeRangesInSheet(sheet) {
        if (this.rangeMapping.has(sheet)) {
            const ranges = this.rangeMapping.get(sheet).values();
            this.rangeMapping.delete(sheet);
            return ranges;
        }
        return [][Symbol.iterator]();
    }
    *rangesInSheet(sheet) {
        const sheetMap = this.rangeMapping.get(sheet);
        if (!sheetMap) {
            return;
        }
        yield* sheetMap.values();
    }
    *rangeVerticesContainedInRange(sourceRange) {
        for (const rangeVertex of this.rangesInSheet(sourceRange.sheet)) {
            if (sourceRange.containsRange(rangeVertex.range)) {
                yield rangeVertex;
            }
        }
    }
    /**
     * Finds smaller range does have own vertex.
     *
     * @param range
     */
    findSmallerRange(range) {
        if (range.height() > 1 && Number.isFinite(range.height())) {
            const valuesRangeEndRowLess = simpleCellAddress(range.end.sheet, range.end.col, range.end.row - 1);
            const rowLessVertex = this.getRange(range.start, valuesRangeEndRowLess);
            if (rowLessVertex !== undefined) {
                const restRange = new AbsoluteCellRange(simpleCellAddress(range.start.sheet, range.start.col, range.end.row), range.end);
                return {
                    smallerRangeVertex: rowLessVertex,
                    restRange,
                };
            }
        }
        return {
            restRange: range,
        };
    }
    *entriesFromSheet(sheet) {
        const sheetMap = this.rangeMapping.get(sheet);
        if (!sheetMap) {
            return;
        }
        yield* sheetMap.entries();
    }
    removeByKey(sheet, key) {
        this.rangeMapping.get(sheet).delete(key);
    }
    getByKey(sheet, key) {
        var _a;
        return (_a = this.rangeMapping.get(sheet)) === null || _a === void 0 ? void 0 : _a.get(key);
    }
    updateVerticesFromSheet(sheet, fn) {
        const updated = Array();
        for (const [key, vertex] of this.entriesFromSheet(sheet)) {
            const result = fn(key, vertex);
            if (result !== undefined) {
                this.removeByKey(sheet, key);
                updated.push(result);
            }
        }
        updated.forEach(entry => {
            this.setRange(entry.vertex);
        });
        return {
            verticesWithChangedSize: updated
                .filter(entry => entry.changedSize)
                .map(entry => entry.vertex)
        };
    }
}
function keyFromAddresses(start, end) {
    return `${start.col},${start.row},${end.col},${end.row}`;
}
function keyFromRange(range) {
    return keyFromAddresses(range.start, range.end);
}
const compareBy = (left, right, coordinate) => {
    const leftStart = coordinate(left.range.start);
    const rightStart = coordinate(left.range.start);
    if (leftStart === rightStart) {
        const leftEnd = coordinate(left.range.end);
        const rightEnd = coordinate(right.range.end);
        return leftEnd - rightEnd;
    }
    else {
        return leftStart - rightStart;
    }
};
