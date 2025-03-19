// (C) 2024 GoodData Corporation

/**
 * Fixes rounding errors in floating point numbers.
 */
export const fixNumber = (num: number) => Number(num.toPrecision(15));
