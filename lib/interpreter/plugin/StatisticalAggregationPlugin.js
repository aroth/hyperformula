/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { CellError, ErrorType } from '../../Cell';
import { ErrorMessage } from '../../error-message';
import { getRawValue, isExtendedNumber } from '../InterpreterValue';
import { centralF, chisquare, corrcoeff, covariance, geomean, mean, normal, stdev, studentt, sumsqerr, variance } from './3rdparty/jstat/jstat';
import { ArgumentTypes, FunctionPlugin } from './FunctionPlugin';
export class StatisticalAggregationPlugin extends FunctionPlugin {
    avedev(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('AVEDEV'), (...args) => {
            const coerced = this.arithmeticHelper.coerceNumbersExactRanges(args);
            if (coerced instanceof CellError) {
                return coerced;
            }
            if (coerced.length === 0) {
                return new CellError(ErrorType.DIV_BY_ZERO);
            }
            const avg = mean(coerced);
            return coerced.reduce((a, b) => a + Math.abs(b - avg), 0) / coerced.length;
        });
    }
    devsq(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('DEVSQ'), (...args) => {
            const coerced = this.arithmeticHelper.coerceNumbersExactRanges(args);
            if (coerced instanceof CellError) {
                return coerced;
            }
            if (coerced.length === 0) {
                return 0;
            }
            return sumsqerr(coerced);
        });
    }
    geomean(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('GEOMEAN'), (...args) => {
            const coerced = this.arithmeticHelper.coerceNumbersExactRanges(args);
            if (coerced instanceof CellError) {
                return coerced;
            }
            if (coerced.length === 0) {
                return new CellError(ErrorType.NUM, ErrorMessage.OneValue);
            }
            for (const val of coerced) {
                if (val <= 0) {
                    return new CellError(ErrorType.NUM, ErrorMessage.ValueSmall);
                }
            }
            return geomean(coerced);
        });
    }
    harmean(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('HARMEAN'), (...args) => {
            const coerced = this.arithmeticHelper.coerceNumbersExactRanges(args);
            if (coerced instanceof CellError) {
                return coerced;
            }
            if (coerced.length === 0) {
                return new CellError(ErrorType.NUM, ErrorMessage.OneValue);
            }
            for (const val of coerced) {
                if (val <= 0) {
                    return new CellError(ErrorType.NUM, ErrorMessage.ValueSmall);
                }
            }
            return coerced.length / (coerced.reduce((a, b) => a + 1 / b, 0));
        });
    }
    correl(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('CORREL'), (dataX, dataY) => {
            if (dataX.numberOfElements() !== dataY.numberOfElements()) {
                return new CellError(ErrorType.NA, ErrorMessage.EqualLength);
            }
            const ret = parseTwoArrays(dataX, dataY);
            if (ret instanceof CellError) {
                return ret;
            }
            const n = ret[0].length;
            if (n <= 1) {
                return new CellError(ErrorType.DIV_BY_ZERO, ErrorMessage.TwoValues);
            }
            return corrcoeff(ret[0], ret[1]);
        });
    }
    rsq(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('RSQ'), (dataX, dataY) => {
            if (dataX.numberOfElements() !== dataY.numberOfElements()) {
                return new CellError(ErrorType.NA, ErrorMessage.EqualLength);
            }
            const ret = parseTwoArrays(dataX, dataY);
            if (ret instanceof CellError) {
                return ret;
            }
            const n = ret[0].length;
            if (n <= 1) {
                return new CellError(ErrorType.DIV_BY_ZERO, ErrorMessage.TwoValues);
            }
            return Math.pow(corrcoeff(ret[0], ret[1]), 2);
        });
    }
    covariancep(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('COVARIANCE.P'), (dataX, dataY) => {
            if (dataX.numberOfElements() !== dataY.numberOfElements()) {
                return new CellError(ErrorType.NA, ErrorMessage.EqualLength);
            }
            const ret = parseTwoArrays(dataX, dataY);
            if (ret instanceof CellError) {
                return ret;
            }
            const n = ret[0].length;
            if (n < 1) {
                return new CellError(ErrorType.DIV_BY_ZERO, ErrorMessage.OneValue);
            }
            if (n === 1) {
                return 0;
            }
            return covariance(ret[0], ret[1]) * (n - 1) / n;
        });
    }
    covariances(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('COVARIANCE.S'), (dataX, dataY) => {
            if (dataX.numberOfElements() !== dataY.numberOfElements()) {
                return new CellError(ErrorType.NA, ErrorMessage.EqualLength);
            }
            const ret = parseTwoArrays(dataX, dataY);
            if (ret instanceof CellError) {
                return ret;
            }
            const n = ret[0].length;
            if (n <= 1) {
                return new CellError(ErrorType.DIV_BY_ZERO, ErrorMessage.TwoValues);
            }
            return covariance(ret[0], ret[1]);
        });
    }
    ztest(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('Z.TEST'), (range, x, sigma) => {
            const vals = this.arithmeticHelper.manyToExactNumbers(range.valuesFromTopLeftCorner());
            if (vals instanceof CellError) {
                return vals;
            }
            const n = vals.length;
            if (sigma === undefined) {
                if (n < 2) {
                    return new CellError(ErrorType.DIV_BY_ZERO, ErrorMessage.TwoValues);
                }
                sigma = stdev(vals, true);
            }
            if (n < 1) {
                return new CellError(ErrorType.NA, ErrorMessage.OneValue);
            }
            if (sigma === 0) {
                return new CellError(ErrorType.DIV_BY_ZERO);
            }
            return 1 - normal.cdf((mean(vals) - x) / (sigma / Math.sqrt(n)), 0, 1);
        });
    }
    ftest(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('F.TEST'), (dataX, dataY) => {
            const arrX = this.arithmeticHelper.manyToExactNumbers(dataX.valuesFromTopLeftCorner());
            const arrY = this.arithmeticHelper.manyToExactNumbers(dataY.valuesFromTopLeftCorner());
            if (arrX instanceof CellError) {
                return arrX;
            }
            if (arrY instanceof CellError) {
                return arrY;
            }
            if (arrX.length <= 1 || arrY.length <= 1) {
                return new CellError(ErrorType.DIV_BY_ZERO);
            }
            const vx = variance(arrX, true);
            const vy = variance(arrY, true);
            if (vx === 0 || vy === 0) {
                return new CellError(ErrorType.DIV_BY_ZERO);
            }
            const r = vx / vy;
            const v = centralF.cdf(r, arrX.length - 1, arrY.length - 1);
            return 2 * Math.min(v, 1 - v);
        });
    }
    steyx(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('STEYX'), (dataX, dataY) => {
            if (dataX.numberOfElements() !== dataY.numberOfElements()) {
                return new CellError(ErrorType.NA, ErrorMessage.EqualLength);
            }
            const ret = parseTwoArrays(dataX, dataY);
            if (ret instanceof CellError) {
                return ret;
            }
            const n = ret[0].length;
            if (n <= 2) {
                return new CellError(ErrorType.DIV_BY_ZERO, ErrorMessage.ThreeValues);
            }
            return Math.sqrt((sumsqerr(ret[0]) - Math.pow(covariance(ret[0], ret[1]) * (n - 1), 2) / sumsqerr(ret[1])) / (n - 2));
        });
    }
    slope(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('SLOPE'), (dataX, dataY) => {
            if (dataX.numberOfElements() !== dataY.numberOfElements()) {
                return new CellError(ErrorType.NA, ErrorMessage.EqualLength);
            }
            const ret = parseTwoArrays(dataX, dataY);
            if (ret instanceof CellError) {
                return ret;
            }
            const n = ret[0].length;
            if (n <= 1) {
                return new CellError(ErrorType.DIV_BY_ZERO, ErrorMessage.TwoValues);
            }
            return covariance(ret[0], ret[1]) * (n - 1) / sumsqerr(ret[1]);
        });
    }
    chisqtest(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('CHISQ.TEST'), (dataX, dataY) => {
            const r = dataX.height();
            const c = dataX.width();
            if (dataY.height() !== r || dataY.width() !== c) {
                return new CellError(ErrorType.NA, ErrorMessage.EqualLength);
            }
            const ret = parseTwoArrays(dataX, dataY);
            if (ret instanceof CellError) {
                return ret;
            }
            if (ret[0].length <= 1) {
                return new CellError(ErrorType.DIV_BY_ZERO, ErrorMessage.TwoValues);
            }
            let sum = 0;
            for (let i = 0; i < ret[0].length; i++) {
                if (ret[1][i] === 0) {
                    return new CellError(ErrorType.DIV_BY_ZERO);
                }
                sum += Math.pow(ret[0][i] - ret[1][i], 2) / ret[1][i];
            }
            if (sum < 0) {
                return new CellError(ErrorType.NUM, ErrorMessage.NaN);
            }
            return 1 - chisquare.cdf(sum, (r > 1 && c > 1) ? (r - 1) * (c - 1) : r * c - 1);
        });
    }
    ttest(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('T.TEST'), (dataX, dataY, tails, type) => {
            const arrX = this.arithmeticHelper.manyToExactNumbers(dataX.valuesFromTopLeftCorner());
            const arrY = this.arithmeticHelper.manyToExactNumbers(dataY.valuesFromTopLeftCorner());
            if (arrX instanceof CellError) {
                return arrX;
            }
            if (arrY instanceof CellError) {
                return arrY;
            }
            const n = arrX.length;
            const m = arrY.length;
            if (type === 1) {
                if (m !== n) {
                    return new CellError(ErrorType.NA, ErrorMessage.EqualLength);
                }
                if (n <= 1) {
                    return new CellError(ErrorType.DIV_BY_ZERO, ErrorMessage.TwoValues);
                }
                const sub = Array(n);
                for (let i = 0; i < n; i++) {
                    sub[i] = arrX[i] - arrY[i];
                }
                const s = stdev(sub, true);
                if (s === 0) {
                    return new CellError(ErrorType.DIV_BY_ZERO);
                }
                const t = Math.abs(Math.sqrt(n) * mean(sub) / s);
                return tails * (1 - studentt.cdf(t, n - 1));
            }
            else if (type === 2) {
                if (n <= 1 || m <= 1) {
                    return new CellError(ErrorType.DIV_BY_ZERO, ErrorMessage.TwoValues);
                }
                const s = (sumsqerr(arrX) + sumsqerr(arrY)) / (n + m - 2);
                if (s === 0) {
                    return new CellError(ErrorType.DIV_BY_ZERO);
                }
                const t = Math.abs((mean(arrX) - mean(arrY)) / Math.sqrt(s * (1 / n + 1 / m)));
                return tails * (1 - studentt.cdf(t, n + m - 2));
            }
            else { //type === 3
                if (n <= 1 || m <= 1) {
                    return new CellError(ErrorType.DIV_BY_ZERO, ErrorMessage.TwoValues);
                }
                const sx = variance(arrX, true);
                const sy = variance(arrY, true);
                if (sx === 0 && sy === 0) {
                    return new CellError(ErrorType.DIV_BY_ZERO);
                }
                const t = Math.abs((mean(arrX) - mean(arrY)) / Math.sqrt(sx / n + sy / m));
                const v = Math.pow(sx / n + sy / m, 2) / (Math.pow(sx / n, 2) / (n - 1) + Math.pow(sy / m, 2) / (m - 1));
                return tails * (1 - studentt.cdf(t, v));
            }
        });
    }
    skew(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('SKEW'), (...args) => {
            const coerced = this.arithmeticHelper.coerceNumbersExactRanges(args);
            if (coerced instanceof CellError) {
                return coerced;
            }
            const n = coerced.length;
            if (n < 3) {
                return new CellError(ErrorType.DIV_BY_ZERO, ErrorMessage.ThreeValues);
            }
            const avg = mean(coerced);
            const s = stdev(coerced, true);
            if (s === 0) {
                return new CellError(ErrorType.DIV_BY_ZERO);
            }
            return coerced.reduce((a, b) => a + Math.pow((b - avg) / s, 3), 0) * n / (n - 1) / (n - 2);
        });
    }
    skewp(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('SKEW.P'), (...args) => {
            const coerced = this.arithmeticHelper.coerceNumbersExactRanges(args);
            if (coerced instanceof CellError) {
                return coerced;
            }
            const n = coerced.length;
            if (n < 3) {
                return new CellError(ErrorType.DIV_BY_ZERO, ErrorMessage.ThreeValues);
            }
            const avg = mean(coerced);
            const s = stdev(coerced, false);
            if (s === 0) {
                return new CellError(ErrorType.DIV_BY_ZERO);
            }
            return coerced.reduce((a, b) => a + Math.pow((b - avg) / s, 3), 0) / n;
        });
    }
}
StatisticalAggregationPlugin.implementedFunctions = {
    'AVEDEV': {
        method: 'avedev',
        parameters: [
            { argumentType: ArgumentTypes.ANY },
        ],
        repeatLastArgs: 1,
    },
    'DEVSQ': {
        method: 'devsq',
        parameters: [
            { argumentType: ArgumentTypes.ANY },
        ],
        repeatLastArgs: 1,
    },
    'GEOMEAN': {
        method: 'geomean',
        parameters: [
            { argumentType: ArgumentTypes.ANY },
        ],
        repeatLastArgs: 1,
    },
    'HARMEAN': {
        method: 'harmean',
        parameters: [
            { argumentType: ArgumentTypes.ANY },
        ],
        repeatLastArgs: 1,
    },
    'CORREL': {
        method: 'correl',
        parameters: [
            { argumentType: ArgumentTypes.RANGE },
            { argumentType: ArgumentTypes.RANGE },
        ],
    },
    'RSQ': {
        method: 'rsq',
        parameters: [
            { argumentType: ArgumentTypes.RANGE },
            { argumentType: ArgumentTypes.RANGE },
        ],
    },
    'COVARIANCE.P': {
        method: 'covariancep',
        parameters: [
            { argumentType: ArgumentTypes.RANGE },
            { argumentType: ArgumentTypes.RANGE },
        ],
    },
    'COVARIANCE.S': {
        method: 'covariances',
        parameters: [
            { argumentType: ArgumentTypes.RANGE },
            { argumentType: ArgumentTypes.RANGE },
        ],
    },
    'Z.TEST': {
        method: 'ztest',
        parameters: [
            { argumentType: ArgumentTypes.RANGE },
            { argumentType: ArgumentTypes.NUMBER },
            { argumentType: ArgumentTypes.NUMBER, optionalArg: true },
        ],
    },
    'F.TEST': {
        method: 'ftest',
        parameters: [
            { argumentType: ArgumentTypes.RANGE },
            { argumentType: ArgumentTypes.RANGE },
        ],
    },
    'STEYX': {
        method: 'steyx',
        parameters: [
            { argumentType: ArgumentTypes.RANGE },
            { argumentType: ArgumentTypes.RANGE },
        ],
    },
    'SLOPE': {
        method: 'slope',
        parameters: [
            { argumentType: ArgumentTypes.RANGE },
            { argumentType: ArgumentTypes.RANGE },
        ],
    },
    'CHISQ.TEST': {
        method: 'chisqtest',
        parameters: [
            { argumentType: ArgumentTypes.RANGE },
            { argumentType: ArgumentTypes.RANGE },
        ],
    },
    'T.TEST': {
        method: 'ttest',
        parameters: [
            { argumentType: ArgumentTypes.RANGE },
            { argumentType: ArgumentTypes.RANGE },
            { argumentType: ArgumentTypes.INTEGER, minValue: 1, maxValue: 2 },
            { argumentType: ArgumentTypes.INTEGER, minValue: 1, maxValue: 3 },
        ],
    },
    'SKEW': {
        method: 'skew',
        parameters: [
            { argumentType: ArgumentTypes.ANY },
        ],
        repeatLastArgs: 1,
    },
    'SKEW.P': {
        method: 'skewp',
        parameters: [
            { argumentType: ArgumentTypes.ANY },
        ],
        repeatLastArgs: 1,
    },
};
StatisticalAggregationPlugin.aliases = {
    COVAR: 'COVARIANCE.P',
    FTEST: 'F.TEST',
    PEARSON: 'CORREL',
    ZTEST: 'Z.TEST',
    CHITEST: 'CHISQ.TEST',
    TTEST: 'T.TEST',
    COVARIANCEP: 'COVARIANCE.P',
    COVARIANCES: 'COVARIANCE.S',
    SKEWP: 'SKEW.P',
};
function parseTwoArrays(dataX, dataY) {
    const xit = dataX.iterateValuesFromTopLeftCorner();
    const yit = dataY.iterateValuesFromTopLeftCorner();
    let x, y;
    const arrX = [];
    const arrY = [];
    while (x = xit.next(), y = yit.next(), !x.done && !y.done) {
        const xval = x.value;
        const yval = y.value;
        if (xval instanceof CellError) {
            return xval;
        }
        else if (yval instanceof CellError) {
            return yval;
        }
        else if (isExtendedNumber(xval) && isExtendedNumber(yval)) {
            arrX.push(getRawValue(xval));
            arrY.push(getRawValue(yval));
        }
    }
    return [arrX, arrY];
}
