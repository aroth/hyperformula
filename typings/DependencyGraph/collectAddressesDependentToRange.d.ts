/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { AbsoluteCellRange } from '../AbsoluteCellRange';
import { SimpleCellAddress } from '../Cell';
import { FunctionRegistry } from '../interpreter/FunctionRegistry';
import { LazilyTransformingAstService } from '../LazilyTransformingAstService';
import { DependencyGraph } from './DependencyGraph';
import { Vertex } from './Vertex';
export declare const collectAddressesDependentToRange: (functionRegistry: FunctionRegistry, vertex: Vertex, range: AbsoluteCellRange, lazilyTransformingAstService: LazilyTransformingAstService, dependencyGraph: DependencyGraph) => SimpleCellAddress[];
