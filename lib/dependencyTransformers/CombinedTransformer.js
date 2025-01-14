/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
export class CombinedTransformer {
    constructor(sheet) {
        this.sheet = sheet;
        this.transformations = [];
    }
    add(transformation) {
        this.transformations.push(transformation);
    }
    performEagerTransformations(graph, parser) {
        this.transformations.forEach(transformation => transformation.performEagerTransformations(graph, parser));
    }
    transformSingleAst(ast, address) {
        let [transformedAst, transformedAddress] = [ast, address];
        this.transformations.forEach(transformation => {
            [transformedAst, transformedAddress] = transformation.transformSingleAst(transformedAst, transformedAddress);
        });
        return [transformedAst, transformedAddress];
    }
    isIrreversible() {
        return true;
    }
}
