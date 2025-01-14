/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { EmptyCellVertex, ParsingErrorVertex, RangeVertex, ValueCellVertex } from './';
import { FormulaVertex } from './FormulaCellVertex';
/**
 * Represents vertex which keeps values of one or more cells
 */
export declare type CellVertex = FormulaVertex | ValueCellVertex | EmptyCellVertex | ParsingErrorVertex;
/**
 * Represents any vertex
 */
export declare type Vertex = CellVertex | RangeVertex;
