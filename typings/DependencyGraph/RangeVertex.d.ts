/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { AbsoluteCellRange } from '../AbsoluteCellRange';
import { SimpleCellAddress } from '../Cell';
import { CriterionLambda } from '../interpreter/Criterion';
/**
 * Represents cache structure for one criterion
 */
export declare type CriterionCache = Map<string, [any, CriterionLambda[]]>;
/**
 * Represents vertex bound to range
 */
export declare class RangeVertex {
    range: AbsoluteCellRange;
    bruteForce: boolean;
    /** Cache for associative aggregate functions. */
    private functionCache;
    /** Cache for criterion-based functions. */
    private criterionFunctionCache;
    private dependentCacheRanges;
    constructor(range: AbsoluteCellRange);
    get start(): SimpleCellAddress;
    get end(): SimpleCellAddress;
    get sheet(): number;
    /**
     * Returns cached value stored for given function
     *
     * @param functionName - name of the function
     */
    getFunctionValue(functionName: string): any;
    /**
     * Stores cached value for given function
     *
     * @param functionName - name of the function
     * @param value - cached value
     */
    setFunctionValue(functionName: string, value: any): void;
    /**
     * Returns cached value for given cache key and criterion text representation
     *
     * @param cacheKey - key to retrieve from the cache
     * @param criterionString - criterion text (ex. '<=5')
     */
    getCriterionFunctionValue(cacheKey: string, criterionString: string): any;
    /**
     * Returns all cached values stored for given criterion function
     *
     * @param cacheKey - key to retrieve from the cache
     */
    getCriterionFunctionValues(cacheKey: string): Map<string, [any, CriterionLambda[]]>;
    /**
     * Stores all values for given criterion function
     *
     * @param cacheKey - key to store in the cache
     * @param values - map with values
     */
    setCriterionFunctionValues(cacheKey: string, values: CriterionCache): void;
    addDependentCacheRange(dependentRange: RangeVertex): void;
    /**
     * Clears function cache
     */
    clearCache(): void;
    /**
     * Returns start of the range (it's top-left corner)
     */
    getStart(): SimpleCellAddress;
    /**
     * Returns end of the range (it's bottom-right corner)
     */
    getEnd(): SimpleCellAddress;
}
