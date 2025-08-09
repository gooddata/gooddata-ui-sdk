// (C) 2025 GoodData Corporation

import React from "react";
import isEqual from "react-fast-compare";

type Subscriber<T> = (state: T, prevState: T) => void;

type Store<T> = {
    getState: () => T;
    setState: (setter: (prevState: T) => T) => void;
    subscribe: (subscriber: Subscriber<T>) => () => void;
};

function createStore<T>(initialState: T): Store<T> {
    let state = initialState;
    const subscribers = new Set<Subscriber<T>>();

    const getState: Store<T>["getState"] = () => state;

    const setState: Store<T>["setState"] = (setter) => {
        const prevState = state;
        state = setter(prevState);

        subscribers.forEach((subscriber) => subscriber(state, prevState));
    };

    const subscribe = (subscriber: Subscriber<T>) => {
        subscribers.add(subscriber);
        return () => {
            subscribers.delete(subscriber);
        };
    };

    return {
        getState,
        setState,
        subscribe,
    };
}

/**
 * @internal
 */
export type IContextStoreProvider<T> = React.FC<{ value: T; children: React.ReactNode }>;
/**
 * @internal
 */
export type IContextStoreSelector<T, SelectorResult> = (state: T) => SelectorResult;
/**
 * @internal
 */
export type IUseContextStore<T, IsOptional = false> = <SelectorResult>(
    selector?: IContextStoreSelector<T, SelectorResult>,
    equalityFn?: (a: SelectorResult, b: SelectorResult) => boolean,
) => IsOptional extends false ? SelectorResult : SelectorResult | undefined;

/**
 * @internal
 */
export type IContextStore<T> = IContextStoreProvider<T> & {
    useContextStore: IUseContextStore<T>;
    useContextStoreOptional: IUseContextStore<T, true>;
    createSelector: <SelectorResult>(
        selector: IContextStoreSelector<T, SelectorResult>,
    ) => IContextStoreSelector<T, SelectorResult>;
};

/**
 * Creates a context store.
 * This allows components inside the context to select slices of the store and only rerender when the slice changes.
 *
 * Provides a Provider and a slice selector hook.
 *
 * @internal
 */
export const createContextStore = <T,>(name: string): IContextStore<T> => {
    const Context = React.createContext<Store<T> | null>(null);

    const Provider = ({ value, children }: { value: T; children: React.ReactNode }) => {
        const [store] = React.useState(() => createStore<T>(value));

        React.useEffect(() => {
            store.setState(() => value);
        }, [store, value]);

        return <Context.Provider value={store}>{children}</Context.Provider>;
    };
    Provider.displayName = `ContextStoreProvider(${name})`;

    const useContextStoreOptional = <SelectorResult,>(
        selector: (state: T) => SelectorResult = (state) => state as unknown as SelectorResult,
        equalityFn: (a: SelectorResult, b: SelectorResult) => boolean = isEqual,
    ) => {
        const store = React.useContext(Context);

        const [selectedState, setSelectedState] = React.useState<SelectorResult | undefined>(() =>
            store ? selector(store.getState()) : undefined,
        );

        React.useEffect(() => {
            if (!store) {
                return undefined;
            }

            return store.subscribe((newState, prevState) => {
                const newSelectedState = selector(newState);
                const prevSelectedState = selector(prevState);

                if (!equalityFn(newSelectedState, prevSelectedState)) {
                    setSelectedState(() => newSelectedState);
                }
            });
        }, [selector, equalityFn, store]);

        return selectedState;
    };

    const useContextStore = <SelectorResult,>(
        selector: (state: T) => SelectorResult = (state) => state as unknown as SelectorResult,
        equalityFn: (a: SelectorResult, b: SelectorResult) => boolean = isEqual,
    ) => {
        const store = React.useContext(Context);
        if (store === null) {
            throw new Error(`Context store '${name}' must be used within a Provider`);
        }

        return useContextStoreOptional(selector, equalityFn)!;
    };

    const createSelector: IContextStore<T>["createSelector"] = (selector) => selector;

    return Object.assign(Provider, {
        useContextStore,
        useContextStoreOptional,
        createSelector,
    });
};
