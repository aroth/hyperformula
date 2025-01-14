/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { CellError, ErrorType } from '../../Cell';
import { ErrorMessage } from '../../error-message';
import { coerceComplexToString } from '../ArithmeticHelper';
import { ArgumentTypes, FunctionPlugin } from './FunctionPlugin';
export class ComplexPlugin extends FunctionPlugin {
    complex(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('COMPLEX'), (re, im, unit) => {
            if (unit !== 'i' && unit !== 'j') {
                return new CellError(ErrorType.VALUE, ErrorMessage.ShouldBeIorJ);
            }
            return coerceComplexToString([re, im], unit);
        });
    }
    imabs(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('IMABS'), abs);
    }
    imaginary(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('IMAGINARY'), ([_re, im]) => im);
    }
    imreal(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('IMREAL'), ([re, _im]) => re);
    }
    imargument(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('IMARGUMENT'), ([re, im]) => {
            if (re === 0 && im === 0) {
                return new CellError(ErrorType.DIV_BY_ZERO);
            }
            return Math.atan2(im, re);
        });
    }
    imconjugate(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('IMCONJUGATE'), ([re, im]) => coerceComplexToString([re, -im]));
    }
    imcos(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('IMCOS'), (arg) => coerceComplexToString(cos(arg)));
    }
    imcosh(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('IMCOSH'), (arg) => coerceComplexToString(cosh(arg)));
    }
    imcot(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('IMCOT'), (arg) => coerceComplexToString(div(cos(arg), sin(arg))));
    }
    imcsc(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('IMCSC'), (arg) => coerceComplexToString(div([1, 0], sin(arg))));
    }
    imcsch(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('IMCSCH'), (arg) => coerceComplexToString(div([1, 0], sinh(arg))));
    }
    imsec(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('IMSEC'), (arg) => coerceComplexToString(div([1, 0], cos(arg))));
    }
    imsech(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('IMSECH'), (arg) => coerceComplexToString(div([1, 0], cosh(arg))));
    }
    imsin(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('IMSIN'), (arg) => coerceComplexToString(sin(arg)));
    }
    imsinh(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('IMSINH'), (arg) => coerceComplexToString(sinh(arg)));
    }
    imtan(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('IMTAN'), (arg) => coerceComplexToString(div(sin(arg), cos(arg))));
    }
    imdiv(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('IMDIV'), (arg1, arg2) => coerceComplexToString(div(arg1, arg2)));
    }
    improduct(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('IMPRODUCT'), (...args) => {
            const coerced = this.arithmeticHelper.coerceComplexExactRanges(args);
            if (coerced instanceof CellError) {
                return coerced;
            }
            let prod = [1, 0];
            for (const val of coerced) {
                prod = mul(prod, val);
            }
            return coerceComplexToString(prod);
        });
    }
    imsum(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('IMSUM'), (...args) => {
            const coerced = this.arithmeticHelper.coerceComplexExactRanges(args);
            if (coerced instanceof CellError) {
                return coerced;
            }
            let sum = [0, 0];
            for (const val of coerced) {
                sum = add(sum, val);
            }
            return coerceComplexToString(sum);
        });
    }
    imsub(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('IMSUB'), (arg1, arg2) => coerceComplexToString(sub(arg1, arg2)));
    }
    imexp(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('IMEXP'), (arg) => coerceComplexToString(exp(arg)));
    }
    imln(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('IMLN'), (arg) => coerceComplexToString(ln(arg)));
    }
    imlog10(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('IMLOG10'), (arg) => {
            const [re, im] = ln(arg);
            const c = Math.log(10);
            return coerceComplexToString([re / c, im / c]);
        });
    }
    imlog2(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('IMLOG2'), (arg) => {
            const [re, im] = ln(arg);
            const c = Math.log(2);
            return coerceComplexToString([re / c, im / c]);
        });
    }
    impower(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('IMPOWER'), (arg, n) => coerceComplexToString(power(arg, n)));
    }
    imsqrt(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('IMSQRT'), (arg) => coerceComplexToString(power(arg, 0.5)));
    }
}
ComplexPlugin.implementedFunctions = {
    'COMPLEX': {
        method: 'complex',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER },
            { argumentType: ArgumentTypes.NUMBER },
            { argumentType: ArgumentTypes.STRING, defaultValue: 'i' },
        ],
    },
    'IMABS': {
        method: 'imabs',
        parameters: [
            { argumentType: ArgumentTypes.COMPLEX },
        ],
    },
    'IMAGINARY': {
        method: 'imaginary',
        parameters: [
            { argumentType: ArgumentTypes.COMPLEX },
        ],
    },
    'IMREAL': {
        method: 'imreal',
        parameters: [
            { argumentType: ArgumentTypes.COMPLEX },
        ],
    },
    'IMARGUMENT': {
        method: 'imargument',
        parameters: [
            { argumentType: ArgumentTypes.COMPLEX },
        ],
    },
    'IMCONJUGATE': {
        method: 'imconjugate',
        parameters: [
            { argumentType: ArgumentTypes.COMPLEX },
        ],
    },
    'IMCOS': {
        method: 'imcos',
        parameters: [
            { argumentType: ArgumentTypes.COMPLEX },
        ],
    },
    'IMCOSH': {
        method: 'imcosh',
        parameters: [
            { argumentType: ArgumentTypes.COMPLEX },
        ],
    },
    'IMCOT': {
        method: 'imcot',
        parameters: [
            { argumentType: ArgumentTypes.COMPLEX },
        ],
    },
    'IMCSC': {
        method: 'imcsc',
        parameters: [
            { argumentType: ArgumentTypes.COMPLEX },
        ],
    },
    'IMCSCH': {
        method: 'imcsch',
        parameters: [
            { argumentType: ArgumentTypes.COMPLEX },
        ],
    },
    'IMSEC': {
        method: 'imsec',
        parameters: [
            { argumentType: ArgumentTypes.COMPLEX },
        ],
    },
    'IMSECH': {
        method: 'imsech',
        parameters: [
            { argumentType: ArgumentTypes.COMPLEX },
        ],
    },
    'IMSIN': {
        method: 'imsin',
        parameters: [
            { argumentType: ArgumentTypes.COMPLEX },
        ],
    },
    'IMSINH': {
        method: 'imsinh',
        parameters: [
            { argumentType: ArgumentTypes.COMPLEX },
        ],
    },
    'IMTAN': {
        method: 'imtan',
        parameters: [
            { argumentType: ArgumentTypes.COMPLEX },
        ],
    },
    'IMDIV': {
        method: 'imdiv',
        parameters: [
            { argumentType: ArgumentTypes.COMPLEX },
            { argumentType: ArgumentTypes.COMPLEX },
        ],
    },
    'IMPRODUCT': {
        method: 'improduct',
        parameters: [
            { argumentType: ArgumentTypes.ANY },
        ],
        repeatLastArgs: 1,
    },
    'IMSUM': {
        method: 'imsum',
        parameters: [
            { argumentType: ArgumentTypes.ANY },
        ],
        repeatLastArgs: 1,
    },
    'IMSUB': {
        method: 'imsub',
        parameters: [
            { argumentType: ArgumentTypes.COMPLEX },
            { argumentType: ArgumentTypes.COMPLEX },
        ],
    },
    'IMEXP': {
        method: 'imexp',
        parameters: [
            { argumentType: ArgumentTypes.COMPLEX },
        ],
    },
    'IMLN': {
        method: 'imln',
        parameters: [
            { argumentType: ArgumentTypes.COMPLEX },
        ],
    },
    'IMLOG10': {
        method: 'imlog10',
        parameters: [
            { argumentType: ArgumentTypes.COMPLEX },
        ],
    },
    'IMLOG2': {
        method: 'imlog2',
        parameters: [
            { argumentType: ArgumentTypes.COMPLEX },
        ],
    },
    'IMPOWER': {
        method: 'impower',
        parameters: [
            { argumentType: ArgumentTypes.COMPLEX },
            { argumentType: ArgumentTypes.NUMBER },
        ],
    },
    'IMSQRT': {
        method: 'imsqrt',
        parameters: [
            { argumentType: ArgumentTypes.COMPLEX },
        ],
    },
};
function add([re1, im1], [re2, im2]) {
    return [re1 + re2, im1 + im2];
}
function sub([re1, im1], [re2, im2]) {
    return [re1 - re2, im1 - im2];
}
function mul([re1, im1], [re2, im2]) {
    return [re1 * re2 - im1 * im2, re1 * im2 + re2 * im1];
}
function div([re1, im1], [re2, im2]) {
    const denom = Math.pow(re2, 2) + Math.pow(im2, 2);
    const [nomRe, nomIm] = mul([re1, im1], [re2, -im2]);
    return [nomRe / denom, nomIm / denom];
}
function cos([re, im]) {
    return [Math.cos(re) * Math.cosh(im), -Math.sin(re) * Math.sinh(im)];
}
function cosh([re, im]) {
    return [Math.cosh(re) * Math.cos(im), Math.sinh(re) * Math.sin(im)];
}
function sin([re, im]) {
    return [Math.sin(re) * Math.cosh(im), Math.cos(re) * Math.sinh(im)];
}
function sinh([re, im]) {
    return [Math.sinh(re) * Math.cos(im), Math.cosh(re) * Math.sin(im)];
}
function exp([re, im]) {
    return [Math.exp(re) * Math.cos(im), Math.exp(re) * Math.sin(im)];
}
function abs([re, im]) {
    return Math.sqrt(re * re + im * im);
}
function ln([re, im]) {
    return [Math.log(abs([re, im])), Math.atan2(im, re)];
}
function power(arg, n) {
    const [re, im] = ln(arg);
    return exp([n * re, n * im]);
}
