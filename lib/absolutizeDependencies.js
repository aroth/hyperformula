/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { AbsoluteCellRange } from './AbsoluteCellRange';
import { invalidSimpleCellAddress } from './Cell';
import { NamedExpressionDependency } from './parser';
/**
 * Converts dependencies from maybe relative addressing to absolute addressing.
 *
 * @param deps - list of addresses in R0C0 format
 * @param baseAddress - base address with regard to which make a convertion
 */
export const absolutizeDependencies = (deps, baseAddress) => {
    return deps.map(dep => dep.absolutize(baseAddress));
};
export const filterDependenciesOutOfScope = (deps) => {
    return deps.filter(dep => {
        if (dep instanceof NamedExpressionDependency) {
            return true;
        }
        if (dep instanceof AbsoluteCellRange) {
            return !(invalidSimpleCellAddress(dep.start) || invalidSimpleCellAddress(dep.end));
        }
        else {
            return !invalidSimpleCellAddress(dep);
        }
    });
};
