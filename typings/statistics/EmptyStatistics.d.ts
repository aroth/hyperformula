/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { Statistics } from './Statistics';
import { StatType } from './StatType';
/** Do not store stats in the memory. Stats are not needed on daily basis */
export declare class EmptyStatistics extends Statistics {
    /** @inheritDoc */
    incrementCriterionFunctionFullCacheUsed(): void;
    /** @inheritDoc */
    incrementCriterionFunctionPartialCacheUsed(): void;
    /** @inheritDoc */
    start(_name: StatType): void;
    /** @inheritDoc */
    end(_name: StatType): void;
}
