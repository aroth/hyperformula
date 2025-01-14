/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { CellError, ErrorType } from '../../Cell';
import { ErrorMessage } from '../../error-message';
import { besseli, besselj, besselk, bessely } from './3rdparty/bessel/bessel';
import { beta, binomial, centralF, chisquare, erf, erfc, exponential, gamma, gammafn, gammaln, hypgeom, lognormal, negbin, normal, normalci, poisson, studentt, tci, weibull } from './3rdparty/jstat/jstat';
import { ArgumentTypes, FunctionPlugin } from './FunctionPlugin';
export class StatisticalPlugin extends FunctionPlugin {
    erf(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('ERF'), (lowerBound, upperBound) => {
            if (upperBound === undefined) {
                return erf(lowerBound);
            }
            else {
                return erf(upperBound) - erf(lowerBound);
            }
        });
    }
    erfc(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('ERFC'), erfc);
    }
    expondist(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('EXPON.DIST'), (x, lambda, cumulative) => {
            if (cumulative) {
                return exponential.cdf(x, lambda);
            }
            else {
                return exponential.pdf(x, lambda);
            }
        });
    }
    fisher(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('FISHER'), (x) => Math.log((1 + x) / (1 - x)) / 2);
    }
    fisherinv(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('FISHERINV'), (y) => 1 - 2 / (Math.exp(2 * y) + 1));
    }
    gamma(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('GAMMA'), gammafn);
    }
    gammadist(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('GAMMA.DIST'), (value, alphaVal, betaVal, cumulative) => {
            if (cumulative) {
                return gamma.cdf(value, alphaVal, betaVal);
            }
            else {
                return gamma.pdf(value, alphaVal, betaVal);
            }
        });
    }
    gammaln(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('GAMMALN'), gammaln);
    }
    gammainv(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('GAMMA.INV'), gamma.inv);
    }
    gauss(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('GAUSS'), (z) => normal.cdf(z, 0, 1) - 0.5);
    }
    betadist(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('BETA.DIST'), (x, alphaVal, betaVal, cumulative, A, B) => {
            if (x <= A) {
                return new CellError(ErrorType.NUM, ErrorMessage.ValueSmall);
            }
            else if (x >= B) {
                return new CellError(ErrorType.NUM, ErrorMessage.ValueLarge);
            }
            x = (x - A) / (B - A);
            if (cumulative) {
                return beta.cdf(x, alphaVal, betaVal);
            }
            else {
                return beta.pdf(x, alphaVal, betaVal);
            }
        });
    }
    betainv(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('BETA.INV'), (x, alphaVal, betaVal, A, B) => {
            if (A >= B) {
                return new CellError(ErrorType.NUM, ErrorMessage.WrongOrder);
            }
            else {
                return beta.inv(x, alphaVal, betaVal) * (B - A) + A;
            }
        });
    }
    binomialdist(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('BINOM.DIST'), (succ, trials, prob, cumulative) => {
            if (succ > trials) {
                return new CellError(ErrorType.NUM, ErrorMessage.WrongOrder);
            }
            succ = Math.trunc(succ);
            trials = Math.trunc(trials);
            if (cumulative) {
                return binomial.cdf(succ, trials, prob);
            }
            else {
                return binomial.pdf(succ, trials, prob);
            }
        });
    }
    binomialinv(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('BINOM.INV'), (trials, prob, alpha) => {
            trials = Math.trunc(trials);
            let lower = -1;
            let upper = trials;
            while (upper > lower + 1) {
                const mid = Math.trunc((lower + upper) / 2);
                if (binomial.cdf(mid, trials, prob) >= alpha) {
                    upper = mid;
                }
                else {
                    lower = mid;
                }
            }
            return upper;
        });
    }
    besselifn(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('BESSELI'), (x, n) => besseli(x, Math.trunc(n)));
    }
    besseljfn(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('BESSELJ'), (x, n) => besselj(x, Math.trunc(n)));
    }
    besselkfn(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('BESSELK'), (x, n) => besselk(x, Math.trunc(n)));
    }
    besselyfn(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('BESSELY'), (x, n) => bessely(x, Math.trunc(n)));
    }
    chisqdist(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('CHISQ.DIST'), (x, deg, cumulative) => {
            deg = Math.trunc(deg);
            if (cumulative) {
                return chisquare.cdf(x, deg);
            }
            else {
                return chisquare.pdf(x, deg);
            }
        });
    }
    chisqdistrt(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('CHISQ.DIST.RT'), (x, deg) => 1 - chisquare.cdf(x, Math.trunc(deg)));
    }
    chisqinv(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('CHISQ.INV'), (p, deg) => chisquare.inv(p, Math.trunc(deg)));
    }
    chisqinvrt(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('CHISQ.INV.RT'), (p, deg) => chisquare.inv(1.0 - p, Math.trunc(deg)));
    }
    fdist(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('F.DIST'), (x, deg1, deg2, cumulative) => {
            deg1 = Math.trunc(deg1);
            deg2 = Math.trunc(deg2);
            if (cumulative) {
                return centralF.cdf(x, deg1, deg2);
            }
            else {
                return centralF.pdf(x, deg1, deg2);
            }
        });
    }
    fdistrt(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('F.DIST.RT'), (x, deg1, deg2) => 1 - centralF.cdf(x, Math.trunc(deg1), Math.trunc(deg2)));
    }
    finv(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('F.INV'), (p, deg1, deg2) => centralF.inv(p, Math.trunc(deg1), Math.trunc(deg2)));
    }
    finvrt(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('F.INV.RT'), (p, deg1, deg2) => centralF.inv(1.0 - p, Math.trunc(deg1), Math.trunc(deg2)));
    }
    weibulldist(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('WEIBULL.DIST'), (x, shape, scale, cumulative) => {
            if (cumulative) {
                return weibull.cdf(x, scale, shape);
            }
            else {
                return weibull.pdf(x, scale, shape);
            }
        });
    }
    poissondist(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('POISSON.DIST'), (x, mean, cumulative) => {
            x = Math.trunc(x);
            if (cumulative) {
                return poisson.cdf(x, mean);
            }
            else {
                return poisson.pdf(x, mean);
            }
        });
    }
    hypgeomdist(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('HYPGEOM.DIST'), (s, numberS, populationS, numberPop, cumulative) => {
            if (s > numberS || s > populationS || numberS > numberPop || populationS > numberPop) {
                return new CellError(ErrorType.NUM, ErrorMessage.ValueLarge);
            }
            if (s + numberPop < populationS + numberS) {
                return new CellError(ErrorType.NUM, ErrorMessage.ValueLarge);
            }
            s = Math.trunc(s);
            numberS = Math.trunc(numberS);
            populationS = Math.trunc(populationS);
            numberPop = Math.trunc(numberPop);
            if (cumulative) {
                return hypgeom.cdf(s, numberPop, populationS, numberS);
            }
            else {
                return hypgeom.pdf(s, numberPop, populationS, numberS);
            }
        });
    }
    tdist(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('T.DIST'), (x, deg, cumulative) => {
            deg = Math.trunc(deg);
            if (cumulative) {
                return studentt.cdf(x, deg);
            }
            else {
                return studentt.pdf(x, deg);
            }
        });
    }
    tdist2t(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('T.DIST.2T'), (x, deg) => (1 - studentt.cdf(x, Math.trunc(deg))) * 2);
    }
    tdistrt(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('T.DIST.RT'), (x, deg) => 1 - studentt.cdf(x, Math.trunc(deg)));
    }
    tdistold(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('TDIST'), (x, deg, mode) => mode * (1 - studentt.cdf(x, Math.trunc(deg))));
    }
    tinv(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('T.INV'), (p, deg) => studentt.inv(p, Math.trunc(deg)));
    }
    tinv2t(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('T.INV.2T'), (p, deg) => studentt.inv(1 - p / 2, Math.trunc(deg)));
    }
    lognormdist(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('LOGNORM.DIST'), (x, mean, stddev, cumulative) => {
            if (cumulative) {
                return lognormal.cdf(x, mean, stddev);
            }
            else {
                return lognormal.pdf(x, mean, stddev);
            }
        });
    }
    lognorminv(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('LOGNORM.INV'), (p, mean, stddev) => lognormal.inv(p, mean, stddev));
    }
    normdist(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('NORM.DIST'), (x, mean, stddev, cumulative) => {
            if (cumulative) {
                return normal.cdf(x, mean, stddev);
            }
            else {
                return normal.pdf(x, mean, stddev);
            }
        });
    }
    norminv(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('NORM.INV'), (p, mean, stddev) => normal.inv(p, mean, stddev));
    }
    normsdist(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('NORM.S.DIST'), (x, cumulative) => {
            if (cumulative) {
                return normal.cdf(x, 0, 1);
            }
            else {
                return normal.pdf(x, 0, 1);
            }
        });
    }
    normsinv(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('NORM.S.INV'), (p) => normal.inv(p, 0, 1));
    }
    phi(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('PHI'), (x) => normal.pdf(x, 0, 1));
    }
    negbinomdist(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('NEGBINOM.DIST'), (nf, ns, p, cumulative) => {
            nf = Math.trunc(nf);
            ns = Math.trunc(ns);
            if (cumulative) {
                return negbin.cdf(nf, ns, p);
            }
            else {
                return negbin.pdf(nf, ns, p);
            }
        });
    }
    confidencenorm(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('CONFIDENCE.NORM'), 
        // eslint-disable-next-line
        // @ts-ignore
        (alpha, stddev, size) => normalci(1, alpha, stddev, Math.trunc(size))[1] - 1);
    }
    confidencet(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('CONFIDENCE.T'), (alpha, stddev, size) => {
            size = Math.trunc(size);
            if (size === 1) {
                return new CellError(ErrorType.DIV_BY_ZERO);
            }
            // eslint-disable-next-line
            // @ts-ignore
            return tci(1, alpha, stddev, size)[1] - 1;
        });
    }
    standardize(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('STANDARDIZE'), (x, mean, stddev) => (x - mean) / stddev);
    }
}
StatisticalPlugin.implementedFunctions = {
    'ERF': {
        method: 'erf',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER },
            { argumentType: ArgumentTypes.NUMBER, optionalArg: true },
        ]
    },
    'ERFC': {
        method: 'erfc',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ]
    },
    'EXPON.DIST': {
        method: 'expondist',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER, minValue: 0 },
            { argumentType: ArgumentTypes.NUMBER, greaterThan: 0 },
            { argumentType: ArgumentTypes.BOOLEAN },
        ]
    },
    'FISHER': {
        method: 'fisher',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER, greaterThan: -1, lessThan: 1 }
        ]
    },
    'FISHERINV': {
        method: 'fisherinv',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ]
    },
    'GAMMA': {
        method: 'gamma',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ]
    },
    'GAMMA.DIST': {
        method: 'gammadist',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER, minValue: 0 },
            { argumentType: ArgumentTypes.NUMBER, greaterThan: 0 },
            { argumentType: ArgumentTypes.NUMBER, greaterThan: 0 },
            { argumentType: ArgumentTypes.BOOLEAN },
        ]
    },
    'GAMMALN': {
        method: 'gammaln',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER, greaterThan: 0 }
        ]
    },
    'GAMMA.INV': {
        method: 'gammainv',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER, minValue: 0, lessThan: 1 },
            { argumentType: ArgumentTypes.NUMBER, greaterThan: 0 },
            { argumentType: ArgumentTypes.NUMBER, greaterThan: 0 },
        ]
    },
    'GAUSS': {
        method: 'gauss',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ]
    },
    'BETA.DIST': {
        method: 'betadist',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER },
            { argumentType: ArgumentTypes.NUMBER, greaterThan: 0 },
            { argumentType: ArgumentTypes.NUMBER, greaterThan: 0 },
            { argumentType: ArgumentTypes.BOOLEAN },
            { argumentType: ArgumentTypes.NUMBER, defaultValue: 0 },
            { argumentType: ArgumentTypes.NUMBER, defaultValue: 1 },
        ]
    },
    'BETA.INV': {
        method: 'betainv',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER, greaterThan: 0, maxValue: 1 },
            { argumentType: ArgumentTypes.NUMBER, greaterThan: 0 },
            { argumentType: ArgumentTypes.NUMBER, greaterThan: 0 },
            { argumentType: ArgumentTypes.NUMBER, defaultValue: 0 },
            { argumentType: ArgumentTypes.NUMBER, defaultValue: 1 },
        ]
    },
    'BINOM.DIST': {
        method: 'binomialdist',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER, minValue: 0 },
            { argumentType: ArgumentTypes.NUMBER, minValue: 0 },
            { argumentType: ArgumentTypes.NUMBER, minValue: 0, maxValue: 1 },
            { argumentType: ArgumentTypes.BOOLEAN },
        ]
    },
    'BINOM.INV': {
        method: 'binomialinv',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER, minValue: 0 },
            { argumentType: ArgumentTypes.NUMBER, minValue: 0, maxValue: 1 },
            { argumentType: ArgumentTypes.NUMBER, greaterThan: 0, lessThan: 1 },
        ]
    },
    'BESSELI': {
        method: 'besselifn',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER },
            { argumentType: ArgumentTypes.NUMBER, minValue: 0 },
        ]
    },
    'BESSELJ': {
        method: 'besseljfn',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER },
            { argumentType: ArgumentTypes.NUMBER, minValue: 0 },
        ]
    },
    'BESSELK': {
        method: 'besselkfn',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER },
            { argumentType: ArgumentTypes.NUMBER, minValue: 0 },
        ]
    },
    'BESSELY': {
        method: 'besselyfn',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER },
            { argumentType: ArgumentTypes.NUMBER, minValue: 0 },
        ]
    },
    'CHISQ.DIST': {
        method: 'chisqdist',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER },
            { argumentType: ArgumentTypes.NUMBER, minValue: 1, maxValue: 1e10 },
            { argumentType: ArgumentTypes.BOOLEAN },
        ]
    },
    'CHISQ.DIST.RT': {
        method: 'chisqdistrt',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER },
            { argumentType: ArgumentTypes.NUMBER, minValue: 1, maxValue: 1e10 },
        ]
    },
    'CHISQ.INV': {
        method: 'chisqinv',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER, minValue: 0, maxValue: 1 },
            { argumentType: ArgumentTypes.NUMBER, minValue: 1, maxValue: 1e10 },
        ]
    },
    'CHISQ.INV.RT': {
        method: 'chisqinvrt',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER, minValue: 0, maxValue: 1 },
            { argumentType: ArgumentTypes.NUMBER, minValue: 1 },
        ]
    },
    'F.DIST': {
        method: 'fdist',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER, minValue: 0 },
            { argumentType: ArgumentTypes.NUMBER, minValue: 1 },
            { argumentType: ArgumentTypes.NUMBER, minValue: 1 },
            { argumentType: ArgumentTypes.BOOLEAN },
        ]
    },
    'F.DIST.RT': {
        method: 'fdistrt',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER, minValue: 0 },
            { argumentType: ArgumentTypes.NUMBER, minValue: 1 },
            { argumentType: ArgumentTypes.NUMBER, minValue: 1 },
        ]
    },
    'F.INV': {
        method: 'finv',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER, minValue: 0, maxValue: 1 },
            { argumentType: ArgumentTypes.NUMBER, minValue: 1 },
            { argumentType: ArgumentTypes.NUMBER, minValue: 1 },
        ]
    },
    'F.INV.RT': {
        method: 'finvrt',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER, minValue: 0, maxValue: 1 },
            { argumentType: ArgumentTypes.NUMBER, minValue: 1 },
            { argumentType: ArgumentTypes.NUMBER, minValue: 1 },
        ]
    },
    'WEIBULL.DIST': {
        method: 'weibulldist',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER, minValue: 0 },
            { argumentType: ArgumentTypes.NUMBER, greaterThan: 0 },
            { argumentType: ArgumentTypes.NUMBER, greaterThan: 0 },
            { argumentType: ArgumentTypes.BOOLEAN },
        ]
    },
    'POISSON.DIST': {
        method: 'poissondist',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER, minValue: 0 },
            { argumentType: ArgumentTypes.NUMBER, minValue: 0 },
            { argumentType: ArgumentTypes.BOOLEAN },
        ]
    },
    'HYPGEOM.DIST': {
        method: 'hypgeomdist',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER, minValue: 0 },
            { argumentType: ArgumentTypes.NUMBER, greaterThan: 0 },
            { argumentType: ArgumentTypes.NUMBER, greaterThan: 0 },
            { argumentType: ArgumentTypes.NUMBER, greaterThan: 0 },
            { argumentType: ArgumentTypes.BOOLEAN },
        ]
    },
    'T.DIST': {
        method: 'tdist',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER },
            { argumentType: ArgumentTypes.NUMBER, minValue: 1 },
            { argumentType: ArgumentTypes.BOOLEAN },
        ]
    },
    'T.DIST.2T': {
        method: 'tdist2t',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER, minValue: 0 },
            { argumentType: ArgumentTypes.NUMBER, minValue: 1 },
        ]
    },
    'T.DIST.RT': {
        method: 'tdistrt',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER },
            { argumentType: ArgumentTypes.NUMBER, minValue: 1 },
        ]
    },
    'TDIST': {
        method: 'tdistold',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER, minValue: 0 },
            { argumentType: ArgumentTypes.NUMBER, minValue: 1 },
            { argumentType: ArgumentTypes.INTEGER, minValue: 1, maxValue: 2 },
        ]
    },
    'T.INV': {
        method: 'tinv',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER, greaterThan: 0, lessThan: 1 },
            { argumentType: ArgumentTypes.NUMBER, minValue: 1 },
        ]
    },
    'T.INV.2T': {
        method: 'tinv2t',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER, greaterThan: 0, maxValue: 1 },
            { argumentType: ArgumentTypes.NUMBER, minValue: 1 },
        ]
    },
    'LOGNORM.DIST': {
        method: 'lognormdist',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER, greaterThan: 0 },
            { argumentType: ArgumentTypes.NUMBER },
            { argumentType: ArgumentTypes.NUMBER, greaterThan: 0 },
            { argumentType: ArgumentTypes.BOOLEAN },
        ]
    },
    'LOGNORM.INV': {
        method: 'lognorminv',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER, greaterThan: 0, lessThan: 1 },
            { argumentType: ArgumentTypes.NUMBER },
            { argumentType: ArgumentTypes.NUMBER, greaterThan: 0 },
        ]
    },
    'NORM.DIST': {
        method: 'normdist',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER },
            { argumentType: ArgumentTypes.NUMBER },
            { argumentType: ArgumentTypes.NUMBER, greaterThan: 0 },
            { argumentType: ArgumentTypes.BOOLEAN },
        ]
    },
    'NORM.INV': {
        method: 'norminv',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER, greaterThan: 0, lessThan: 1 },
            { argumentType: ArgumentTypes.NUMBER },
            { argumentType: ArgumentTypes.NUMBER, greaterThan: 0 },
        ]
    },
    'NORM.S.DIST': {
        method: 'normsdist',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER },
            { argumentType: ArgumentTypes.BOOLEAN },
        ]
    },
    'NORM.S.INV': {
        method: 'normsinv',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER, greaterThan: 0, lessThan: 1 },
        ]
    },
    'PHI': {
        method: 'phi',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ]
    },
    'NEGBINOM.DIST': {
        method: 'negbinomdist',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER, minValue: 0 },
            { argumentType: ArgumentTypes.NUMBER, minValue: 1 },
            { argumentType: ArgumentTypes.NUMBER, minValue: 0, maxValue: 1 },
            { argumentType: ArgumentTypes.BOOLEAN },
        ]
    },
    'CONFIDENCE.NORM': {
        method: 'confidencenorm',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER, greaterThan: 0, lessThan: 1 },
            { argumentType: ArgumentTypes.NUMBER, greaterThan: 0 },
            { argumentType: ArgumentTypes.NUMBER, minValue: 1 },
        ],
    },
    'CONFIDENCE.T': {
        method: 'confidencet',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER, greaterThan: 0, lessThan: 1 },
            { argumentType: ArgumentTypes.NUMBER, greaterThan: 0 },
            { argumentType: ArgumentTypes.NUMBER, minValue: 1 },
        ],
    },
    'STANDARDIZE': {
        method: 'standardize',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER },
            { argumentType: ArgumentTypes.NUMBER },
            { argumentType: ArgumentTypes.NUMBER, greaterThan: 0 },
        ],
    },
};
StatisticalPlugin.aliases = {
    NEGBINOMDIST: 'NEGBINOM.DIST',
    EXPONDIST: 'EXPON.DIST',
    BETADIST: 'BETA.DIST',
    NORMDIST: 'NORM.DIST',
    NORMINV: 'NORM.INV',
    NORMSDIST: 'NORM.S.DIST',
    NORMSINV: 'NORM.S.INV',
    LOGNORMDIST: 'LOGNORM.DIST',
    LOGINV: 'LOGNORM.INV',
    TINV: 'T.INV.2T',
    HYPGEOMDIST: 'HYPGEOM.DIST',
    POISSON: 'POISSON.DIST',
    WEIBULL: 'WEIBULL.DIST',
    FINV: 'F.INV.RT',
    FDIST: 'F.DIST.RT',
    CHIDIST: 'CHISQ.DIST.RT',
    CHIINV: 'CHISQ.INV.RT',
    GAMMADIST: 'GAMMA.DIST',
    'GAMMALN.PRECISE': 'GAMMALN',
    GAMMAINV: 'GAMMA.INV',
    BETAINV: 'BETA.INV',
    BINOMDIST: 'BINOM.DIST',
    CONFIDENCE: 'CONFIDENCE.NORM',
    CRITBINOM: 'BINOM.INV',
    WEIBULLDIST: 'WEIBULL.DIST',
    TINV2T: 'T.INV.2T',
    TDISTRT: 'T.DIST.RT',
    TDIST2T: 'T.DIST.2T',
    FINVRT: 'F.INV.RT',
    FDISTRT: 'F.DIST.RT',
    CHIDISTRT: 'CHISQ.DIST.RT',
    CHIINVRT: 'CHISQ.INV.RT',
    LOGNORMINV: 'LOGNORM.INV',
    POISSONDIST: 'POISSON.DIST',
};
