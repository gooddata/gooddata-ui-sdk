// (C) 2007-2020 GoodData Corporation
import { useEffect, useState, useRef } from "react";
import { PromiseCache } from "./PromiseCache.js";

/**
 * @internal
 */

interface IUsePromiseCacheState<TResult, TError> {
    isLoading: boolean;
    results: TResult[];
    errors: TError[];
}

const initialState: IUsePromiseCacheState<any, any> = {
    isLoading: false,
    results: [],
    errors: [],
};

/**
 * Hook for promise caching
 * It caches promises by params passed to provided factory function
 * It returns only new results
 * @internal
 */
export function usePromiseCache<TParams, TResult, TError>(
    promiseFactory: (params: TParams) => Promise<TResult>,
    fetchParams: TParams[],
    fetchDeps: React.DependencyList,
    resetDeps: React.DependencyList,
    getCacheKey?: (params: TParams) => string,
): IUsePromiseCacheState<TResult, TError> {
    const promiseCacheRef = useRef<PromiseCache<TParams, TResult, TError>>(
        new PromiseCache(promiseFactory, getCacheKey),
    );
    const [state, setState] = useState<IUsePromiseCacheState<TResult, TError>>(initialState);

    const setInitialState = () => setState(initialState);
    const setResults = (results: TResult[]) => setState((state) => ({ ...state, results }));
    const setErrors = (errors: TError[]) => setState((state) => ({ ...state, errors }));
    const setLoading = (isLoading: boolean) => setState((state) => ({ ...state, isLoading }));

    useEffect(() => {
        return () => {
            promiseCacheRef.current.reset();
            setInitialState();
        };
    }, resetDeps);

    useEffect(() => {
        const newParams = fetchParams.filter((params) => !promiseCacheRef.current.getResult(params));
        const newPromises = newParams.map(promiseCacheRef.current.load);

        if (newPromises.length === 0) {
            return;
        }

        // Because promises have their own lifecycle independent on react lifecycle,
        // we need to check if promise cache was not reset before their resolution
        // and our results are still relevant.
        // We do this by storing current promise cache in effect closure
        // so when promises are resolved, we have still access to it
        const usedPromiseCache = promiseCacheRef.current;
        setLoading(true);
        Promise.all(newPromises)
            .then((results) => {
                setLoading(false);
                if (usedPromiseCache === promiseCacheRef.current) {
                    setResults(results);
                }
            })
            .catch((errors) => {
                setLoading(false);
                if (usedPromiseCache === promiseCacheRef.current) {
                    setErrors(errors);
                }
            });
    }, fetchDeps);

    return state;
}
