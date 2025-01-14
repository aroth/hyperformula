/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
/**
 * Represents vertex bound to range
 */
export class RangeVertex {
    constructor(range) {
        this.range = range;
        this.functionCache = new Map();
        this.criterionFunctionCache = new Map();
        this.dependentCacheRanges = new Set();
        this.bruteForce = false;
    }
    get start() {
        return this.range.start;
    }
    get end() {
        return this.range.end;
    }
    get sheet() {
        return this.range.start.sheet;
    }
    /**
     * Returns cached value stored for given function
     *
     * @param functionName - name of the function
     */
    getFunctionValue(functionName) {
        return this.functionCache.get(functionName);
    }
    /**
     * Stores cached value for given function
     *
     * @param functionName - name of the function
     * @param value - cached value
     */
    setFunctionValue(functionName, value) {
        this.functionCache.set(functionName, value);
    }
    /**
     * Returns cached value for given cache key and criterion text representation
     *
     * @param cacheKey - key to retrieve from the cache
     * @param criterionString - criterion text (ex. '<=5')
     */
    getCriterionFunctionValue(cacheKey, criterionString) {
        var _a;
        return (_a = this.getCriterionFunctionValues(cacheKey).get(criterionString)) === null || _a === void 0 ? void 0 : _a[0];
    }
    /**
     * Returns all cached values stored for given criterion function
     *
     * @param cacheKey - key to retrieve from the cache
     */
    getCriterionFunctionValues(cacheKey) {
        var _a;
        return (_a = this.criterionFunctionCache.get(cacheKey)) !== null && _a !== void 0 ? _a : new Map();
    }
    /**
     * Stores all values for given criterion function
     *
     * @param cacheKey - key to store in the cache
     * @param values - map with values
     */
    setCriterionFunctionValues(cacheKey, values) {
        this.criterionFunctionCache.set(cacheKey, values);
    }
    addDependentCacheRange(dependentRange) {
        if (dependentRange !== this) {
            this.dependentCacheRanges.add(dependentRange);
        }
    }
    /**
     * Clears function cache
     */
    clearCache() {
        this.functionCache.clear();
        this.criterionFunctionCache.clear();
        this.dependentCacheRanges.forEach(range => range.criterionFunctionCache.clear());
        this.dependentCacheRanges.clear();
    }
    /**
     * Returns start of the range (it's top-left corner)
     */
    getStart() {
        return this.start;
    }
    /**
     * Returns end of the range (it's bottom-right corner)
     */
    getEnd() {
        return this.end;
    }
}
