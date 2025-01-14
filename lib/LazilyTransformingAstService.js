/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { CombinedTransformer } from './dependencyTransformers/CombinedTransformer';
import { StatType } from './statistics';
export class LazilyTransformingAstService {
    constructor(stats) {
        this.stats = stats;
        this.transformations = [];
    }
    version() {
        return this.transformations.length;
    }
    addTransformation(transformation) {
        if (this.combinedTransformer !== undefined) {
            this.combinedTransformer.add(transformation);
        }
        else {
            this.transformations.push(transformation);
        }
        return this.version();
    }
    beginCombinedMode(sheet) {
        this.combinedTransformer = new CombinedTransformer(sheet);
    }
    commitCombinedMode() {
        if (this.combinedTransformer === undefined) {
            throw 'Combined mode wasn\'t started';
        }
        this.transformations.push(this.combinedTransformer);
        this.combinedTransformer = undefined;
        return this.version();
    }
    applyTransformations(ast, address, version) {
        this.stats.start(StatType.TRANSFORM_ASTS_POSTPONED);
        for (let v = version; v < this.transformations.length; v++) {
            const transformation = this.transformations[v];
            if (transformation.isIrreversible()) {
                this.undoRedo.storeDataForVersion(v, address, this.parser.computeHashFromAst(ast));
                this.parser.rememberNewAst(ast);
            }
            const [newAst, newAddress] = transformation.transformSingleAst(ast, address);
            ast = newAst;
            address = newAddress;
        }
        const cachedAst = this.parser.rememberNewAst(ast);
        this.stats.end(StatType.TRANSFORM_ASTS_POSTPONED);
        return [cachedAst, address, this.transformations.length];
    }
    *getTransformationsFrom(version, filter) {
        for (let v = version; v < this.transformations.length; v++) {
            const transformation = this.transformations[v];
            if (!filter || filter(transformation)) {
                yield transformation;
            }
        }
    }
}
