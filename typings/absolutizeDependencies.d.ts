/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { SimpleCellAddress } from './Cell';
import { CellDependency } from './CellDependency';
import { RelativeDependency } from './parser';
/**
 * Converts dependencies from maybe relative addressing to absolute addressing.
 *
 * @param deps - list of addresses in R0C0 format
 * @param baseAddress - base address with regard to which make a convertion
 */
export declare const absolutizeDependencies: (deps: RelativeDependency[], baseAddress: SimpleCellAddress) => CellDependency[];
export declare const filterDependenciesOutOfScope: (deps: CellDependency[]) => CellDependency[];
