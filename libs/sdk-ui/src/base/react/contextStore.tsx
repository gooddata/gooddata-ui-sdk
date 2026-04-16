// (C) 2025-2026 GoodData Corporation

import {
    type FC,
    type ReactNode,
    createContext,
    useCallback,
    useContext,
    useLayoutEffect,
    useRef,
    useSyncExternalStore,
} from "react";

import { pick } from "lodash-es";
import isEqual from "react-fast-compare";

type Subscriber<T> = (state: T, prevState: T) => void;

type Store<T> = {
    getState: () => T;
    setState: (setter: (prevState: T) => T) => void;
    /** Update state without notifying subscribers. */
    setStateSilent: (newState: T) => void;
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

    const setStateSilent: Store<T>["setStateSilent"] = (newState) => {
        state = newState;
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
        setStateSilent,
        subscribe,
    };
}

/**
 * @internal
 */
export type IContextStoreProvider<T> = FC<{ value: T; children: ReactNode }>;
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
    useContextStoreValues: <K extends readonly (keyof T)[]>(
        keys: K,
        equalityFn?: (a: Pick<T, K[number]>, b: Pick<T, K[number]>) => boolean,
    ) => Pick<T, K[number]>;
    useContextStoreValuesOptional: <K extends readonly (keyof T)[]>(
        keys: K,
        equalityFn?: (a: Pick<T, K[number]>, b: Pick<T, K[number]>) => boolean,
    ) => Pick<T, K[number]> | undefined;
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
    const Context = createContext<Store<T> | null>(null);

    function Provider({ value, children }: { value: T; children: ReactNode }) {
        const storeRef = useRef<Store<T> | null>(null);
        if (!storeRef.current) {
            storeRef.current = createStore<T>(value);
        }
        const store = storeRef.current;

        // Update state synchronously so children in this render pass see the new value
        // via getSnapshot(). This avoids a wasted render with stale data.
        // We use setStateSilent (no subscriber notification) to avoid triggering state
        // updates in other components during render.
        store.setStateSilent(value);

        // Notify subscribers synchronously after commit for any consumers that skipped
        // this render pass (e.g. memoized, or passed as children from a parent that didn't re-render).
        // useLayoutEffect fires before macrotasks (setTimeout), ensuring consumers see each
        // intermediate state update. For non-memoized consumers that already rendered in this pass,
        // useSyncExternalStore already has the latest value from getSnapshot(), so this is a no-op.
        useLayoutEffect(() => {
            store.setState(() => value);
        }, [store, value]);

        return <Context.Provider value={store}>{children}</Context.Provider>;
    }
    Provider.displayName = `ContextStoreProvider(${name})`;

    const useContextStoreOptional = <SelectorResult,>(
        selector: (state: T) => SelectorResult = (state) => state as unknown as SelectorResult,
        equalityFn: (a: SelectorResult, b: SelectorResult) => boolean = isEqual,
    ) => {
        const store = useContext(Context);

        // Keep selector/equalityFn in refs so subscribe & getSnapshot callbacks stay stable,
        // while still using the latest functions on each render.
        const selectorRef = useRef(selector);
        const equalityFnRef = useRef(equalityFn);
        const prevSnapshotRef = useRef<SelectorResult | undefined>(undefined);
        const isInitializedRef = useRef(false);

        selectorRef.current = selector;
        equalityFnRef.current = equalityFn;

        const subscribe = useCallback(
            (onStoreChange: () => void) => {
                if (!store) {
                    return () => {};
                }
                return store.subscribe(onStoreChange);
            },
            [store],
        );

        const getSnapshot = useCallback((): SelectorResult | undefined => {
            if (!store) {
                return undefined;
            }

            const nextSnapshot = selectorRef.current(store.getState());

            // Preserve referential identity when the value is deeply equal,
            // since useSyncExternalStore uses Object.is for comparison.
            if (
                isInitializedRef.current &&
                equalityFnRef.current(prevSnapshotRef.current as SelectorResult, nextSnapshot)
            ) {
                return prevSnapshotRef.current;
            }

            isInitializedRef.current = true;
            prevSnapshotRef.current = nextSnapshot;
            return nextSnapshot;
        }, [store]);

        return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    };

    const useContextStore = <SelectorResult,>(
        selector: (state: T) => SelectorResult = (state) => state as unknown as SelectorResult,
        equalityFn: (a: SelectorResult, b: SelectorResult) => boolean = isEqual,
    ) => {
        const store = useContext(Context);
        if (store === null) {
            throw new Error(`Context store '${name}' must be used within a Provider`);
        }

        return useContextStoreOptional(selector, equalityFn)!;
    };

    const useContextStoreValuesOptional: IContextStore<T>["useContextStoreValuesOptional"] = (
        keys,
        equalityFn = isEqual,
    ) => {
        return useContextStoreOptional(
            (state: T) => pick(state, keys) as Pick<T, (typeof keys)[number]>,
            equalityFn,
        );
    };

    const useContextStoreValues: IContextStore<T>["useContextStoreValues"] = (keys, equalityFn = isEqual) => {
        return useContextStore((state: T) => pick(state, keys) as Pick<T, (typeof keys)[number]>, equalityFn);
    };

    const createSelector: IContextStore<T>["createSelector"] = (selector) => selector;

    return Object.assign(Provider, {
        useContextStore,
        useContextStoreOptional,
        useContextStoreValues,
        useContextStoreValuesOptional,
        createSelector,
    });
};
