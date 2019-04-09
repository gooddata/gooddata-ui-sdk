// (C) 2019 GoodData Corporation
export declare type Subtract<T, K> = Pick<T, Exclude<keyof T, keyof K>>;
