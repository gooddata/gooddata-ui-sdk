// (C) 2007-2020 GoodData Corporation
import values from "lodash/values";
import { ICancelablePromise, makeCancelable } from "./CancelablePromise";

/**
 * Simple promise cache
 * After reset() call, it does not dispatch .then() on pending promises
 * @internal
 */
export class PromiseCache<P, T, E = any> {
    private cache: {
        [key: string]: ICancelablePromise<T>;
    } = {};
    private results: {
        [key: string]: T;
    } = {};
    private errors: {
        [key: string]: E;
    };

    constructor(
        private readonly handler: (params: P) => Promise<T>,
        private readonly getCacheKey: (params: P) => string = JSON.stringify,
    ) {}

    public reset = () => {
        values(this.cache).forEach(cancelablePromise => cancelablePromise.cancel());
        this.cache = {};
        this.results = {};
        this.errors = {};
    };

    public getResult = (params: P): T | undefined => {
        const cacheKey = this.getCacheKey(params);
        return this.results[cacheKey];
    };

    public getError = (params: P): E | undefined => {
        const cacheKey = this.getCacheKey(params);
        return this.errors[cacheKey];
    };

    public load = (params: P): Promise<T> => {
        const cacheKey = this.getCacheKey(params);
        const cachedPromise = this.cache[cacheKey];
        if (cachedPromise) {
            return cachedPromise.promise;
        }

        const cancelablePromise = makeCancelable(this.handler(params));
        cancelablePromise.promise
            .then(result => (this.results[cacheKey] = result))
            .catch(error => (this.errors[error] = error));

        this.cache[cacheKey] = cancelablePromise;

        return cancelablePromise.promise;
    };
}
