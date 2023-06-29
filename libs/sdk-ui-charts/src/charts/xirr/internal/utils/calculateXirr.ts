// (C) 2019-2020 GoodData Corporation
import sumBy from "lodash/sumBy.js";
import differenceInDays from "date-fns/differenceInDays/index.js";

type NumericFunction = (x: number) => number;

export interface IXirrInput {
    amount: number;
    when: Date;
}

const newtonRaphson = (fun: NumericFunction, derivative: NumericFunction, guess: number): number => {
    const precision = 4;
    const errorLimit = Math.pow(10, -1 * precision);
    const iterationLimit = 100;

    let previousValue = 0;
    let iteration = 0;
    let result = guess;

    do {
        previousValue = result;
        result = previousValue - fun(result) / derivative(result);
        if (++iteration >= iterationLimit) {
            return NaN;
        }
    } while (Math.abs(result - previousValue) > errorLimit);

    return result;
};

/**
 * Calculates the XIRR value for the (amount, when) pairs.
 * @see https://en.wikipedia.org/wiki/Internal_rate_of_return#Exact_dates_of_cash_flows for mathematical background.
 */
export const calculateXirr = (transactions: IXirrInput[], guess = 0.1): number => {
    // convert any date to a fractional year difference to allow non-uniform cash-flow distribution (the X in XIRR)
    const startDate = transactions[0].when;
    const data = transactions.map((t) => ({
        C_n: t.amount,
        t_n: differenceInDays(t.when, startDate) / 365,
    }));

    /*
        NPV is defined as

              N
             ====
             \        C_n
        NPV = \    ----------
              /           t_n
             /     (1 + r)
             ====
             n = 0

        where n is a period and C_n is a cash-flow for the corresponding period.

        IRR is defined as a real solution for r in NPV = 0
    */
    const npv: NumericFunction = (r) => sumBy(data, ({ t_n, C_n }) => C_n / Math.pow(1 + r, t_n));

    /*
        We use Newton Raphson method to find the real root of NPV = 0, so we need its derivative:

                N
               ====
      dNPV     \        C_n . t_n
      ---- = -  \    ----------------
       dn       /           (t_n + 1)
               /     (1 + r)
               ====
               n = 0
     */
    const npvDerivative: NumericFunction = (r) =>
        -1 * sumBy(data, ({ t_n, C_n }) => (t_n * C_n) / Math.pow(1 + r, t_n + 1));

    return newtonRaphson(npv, npvDerivative, guess);
};
