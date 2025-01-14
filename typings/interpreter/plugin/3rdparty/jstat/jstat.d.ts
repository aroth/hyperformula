/**
 * @license
 Copyright (c) 2013 jStat

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */
export declare function erf(x: number): number;
export declare function erfc(x: number): number;
export declare const exponential: {
    pdf: (x: number, rate: number) => number;
    cdf: (x: number, rate: number) => number;
};
export declare function gammafn(x: number): number;
export declare const gamma: {
    pdf: (x: number, shape: number, scale: number) => number;
    cdf: (x: number, shape: number, scale: number) => number;
    inv: (p: number, shape: number, scale: number) => number;
};
export declare function gammaln(x: number): number;
export declare const normal: {
    pdf: (x: number, mean: number, std: number) => number;
    cdf: (x: number, mean: number, std: number) => number;
    inv: (p: number, mean: number, std: number) => number;
};
export declare const beta: {
    pdf: (x: number, alpha: number, beta: number) => number;
    cdf: (x: number, alpha: number, beta: number) => number | false;
    inv: (x: number, alpha: number, beta: number) => number;
};
export declare const binomial: {
    pdf: (k: number, n: number, p: number) => number;
    cdf: (x: number, n: number, p: number) => number;
};
export declare function factorialln(n: number): number;
export declare function factorial(n: number): number;
export declare const chisquare: {
    pdf: (x: number, dof: number) => number;
    cdf: (x: number, dof: number) => number;
    inv: (p: number, dof: number) => number;
};
export declare const centralF: {
    pdf: (x: number, df1: number, df2: number) => number;
    cdf: (x: number, df1: number, df2: number) => number;
    inv: (x: number, df1: number, df2: number) => number;
};
export declare const weibull: {
    pdf: (x: number, scale: number, shape: number) => number;
    cdf: (x: number, scale: number, shape: number) => number;
};
export declare const poisson: {
    pdf: (k: number, l: number) => number;
    cdf: (x: number, l: number) => number;
};
export declare const hypgeom: {
    pdf: (k: number, N: number, m: number, n: number) => number;
    cdf: (x: number, N: number, m: number, n: number) => number;
};
export declare const studentt: {
    pdf: (x: number, dof: number) => number;
    cdf: (x: number, dof: number) => number;
    inv: (p: number, dof: number) => number;
};
export declare const lognormal: {
    pdf: (x: number, mu: number, sigma: number) => number;
    cdf: (x: number, mu: number, sigma: number) => number;
    inv: (p: number, mu: number, sigma: number) => number;
};
export declare const negbin: {
    pdf: (k: number, r: number, p: number) => number | false;
    cdf: (x: number, r: number, p: number) => number;
};
export declare function mean(arr: number[]): number;
export declare function sumsqerr(arr: number[]): number;
export declare function variance(arr: number[], flag: any): number;
export declare function stdev(arr: number[], flag: any): number;
export declare function normalci(): any[];
export declare function tci(): any[];
export declare function geomean(arr: number[]): number;
export declare function covariance(arr1: number[], arr2: number[]): number;
export declare function corrcoeff(arr1: number[], arr2: number[]): number;
