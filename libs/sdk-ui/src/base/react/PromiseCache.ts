// (C) 2007-2020 GoodData Corporation
import { ICancelablePromise, makeCancelable } from "./CancelablePromise.js";
import values from "lodash/values.js";

/**
 * Simple promise cache, that allows promise canceling
 * After reset() call, it cancels pending promises
 * @internal
 */
export class PromiseCache<TParams, TResult, TError = any> {
    private promises: {
        [key: string]: ICancelablePromise<TResult>;
    } = {};
    private params: {
        [key: string]: TParams;
    } = {};
    private results: {
        [key: string]: TResult;
    } = {};
    private errors: {
        [key: string]: TError;
    } = {};

    constructor(
        private readonly handler: (params: TParams) => Promise<TResult>,
        private readonly getCacheKey: (params: TParams) => string = JSON.stringify,
    ) {}

    public getResult = (params: TParams): TResult | undefined => {
        const cacheKey = this.getCacheKey(params);
        return this.results[cacheKey];
    };

    public getError = (params: TParams): TError | undefined => {
        const cacheKey = this.getCacheKey(params);
        return this.errors[cacheKey];
    };

    public getPromise = (params: TParams): Promise<TResult> | undefined => {
        const cacheKey = this.getCacheKey(params);
        const cachedPromise = this.promises[cacheKey];
        if (cachedPromise) {
            return cachedPromise.promise;
        }
    };

    public reset = (): void => {
        values(this.params).forEach(this.cancel);
        this.params = {};
        this.promises = {};
        this.results = {};
        this.errors = {};
    };

    public cancel = (params: TParams): void => {
        const cacheKey = this.getCacheKey(params);
        const cancelablePromise = this.promises[cacheKey];
        if (cancelablePromise) {
            cancelablePromise.cancel();
        }
    };

    public load = (params: TParams): Promise<TResult> => {
        const cacheKey = this.getCacheKey(params);
        const cachedPromise = this.promises[cacheKey];
        if (cachedPromise) {
            return cachedPromise.promise;
        }
        const cancelablePromise = makeCancelable(this.handler(params));
        cancelablePromise.promise
            .then((result) => (this.results[cacheKey] = result))
            .catch((error) => (this.errors[cacheKey] = error));

        this.promises[cacheKey] = cancelablePromise;
        return cancelablePromise.promise;
    };
}
