// (C) 2019-2020 GoodData Corporation

/**
 * @internal
 */
export declare type Subtract<T, K> = Pick<T, Exclude<keyof T, keyof K>>;
