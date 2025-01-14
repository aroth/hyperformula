/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { AbsoluteCellRange } from '../AbsoluteCellRange';
import { SimpleCellAddress } from '../Cell';
import { Maybe } from '../Maybe';
import { Span } from '../Span';
import { RangeVertex } from './';
export interface AdjustRangesResult {
    verticesWithChangedSize: RangeVertex[];
}
export interface TruncateRangesResult extends AdjustRangesResult {
    verticesToRemove: RangeVertex[];
    verticesToMerge: [RangeVertex, RangeVertex][];
    verticesWithChangedSize: RangeVertex[];
}
/**
 * Mapping from address ranges to range vertices
 */
export declare class RangeMapping {
    /** Map in which actual data is stored. */
    private rangeMapping;
    getMappingSize(sheet: number): Maybe<number>;
    /**
     * Saves range vertex
     *
     * @param vertex - vertex to save
     */
    setRange(vertex: RangeVertex): void;
    removeRange(vertex: RangeVertex): void;
    /**
     * Returns associated vertex for given range
     *
     * @param start - top-left corner of the range
     * @param end - bottom-right corner of the range
     */
    getRange(start: SimpleCellAddress, end: SimpleCellAddress): Maybe<RangeVertex>;
    fetchRange(start: SimpleCellAddress, end: SimpleCellAddress): RangeVertex;
    truncateRanges(span: Span, coordinate: (address: SimpleCellAddress) => number): TruncateRangesResult;
    moveAllRangesInSheetAfterRowByRows(sheet: number, row: number, numberOfRows: number): AdjustRangesResult;
    moveAllRangesInSheetAfterColumnByColumns(sheet: number, column: number, numberOfColumns: number): AdjustRangesResult;
    moveRangesInsideSourceRange(sourceRange: AbsoluteCellRange, toRight: number, toBottom: number, toSheet: number): void;
    removeRangesInSheet(sheet: number): IterableIterator<RangeVertex>;
    rangesInSheet(sheet: number): IterableIterator<RangeVertex>;
    rangeVerticesContainedInRange(sourceRange: AbsoluteCellRange): IterableIterator<RangeVertex>;
    /**
     * Finds smaller range does have own vertex.
     *
     * @param range
     */
    findSmallerRange(range: AbsoluteCellRange): {
        smallerRangeVertex?: RangeVertex;
        restRange: AbsoluteCellRange;
    };
    private entriesFromSheet;
    private removeByKey;
    private getByKey;
    private updateVerticesFromSheet;
}
