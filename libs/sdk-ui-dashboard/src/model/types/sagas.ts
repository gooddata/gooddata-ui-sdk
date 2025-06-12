// (C) 2021 GoodData Corporation

/*
 * These type defs are useful for typing saga call results.
 */

export type PromiseReturnType<T> = T extends Promise<infer U> ? U : any;
export type PromiseFnReturnType<T extends (...args: any) => any> = PromiseReturnType<ReturnType<T>>;
