/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { StatType } from './StatType';
/**
 * Provides tracking performance statistics to the engine
 */
export declare class Statistics {
    protected readonly stats: Map<StatType, number>;
    protected readonly startTimes: Map<StatType, number>;
    incrementCriterionFunctionFullCacheUsed(): void;
    incrementCriterionFunctionPartialCacheUsed(): void;
    /**
     * Resets statistics
     */
    reset(): void;
    /**
     * Starts tracking particular statistic.
     *
     * @param name - statistic to start tracking
     */
    start(name: StatType): void;
    /**
     * Stops tracking particular statistic.
     * Raise error if tracking statistic wasn't started.
     *
     * @param name - statistic to stop tracking
     */
    end(name: StatType): void;
    /**
     * Measure given statistic as execution of given function.
     *
     * @param name - statistic to track
     * @param func - function to call
     * @returns result of the function call
     */
    measure<T>(name: StatType, func: () => T): T;
    /**
     * Returns the snapshot of current results
     */
    snapshot(): Map<StatType, number>;
}
