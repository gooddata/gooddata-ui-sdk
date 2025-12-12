// (C) 2025 GoodData Corporation

import { type Context, createContext, useContext } from "react";

/**
 * Creates a typed context with a custom hook that throws if used outside provider.
 *
 * @remarks
 * This factory reduces boilerplate for creating React contexts with the common pattern:
 * 1. Create context with undefined default
 * 2. Create a useHook that throws if context is undefined
 *
 * @example
 * ```typescript
 * interface IMyContext {
 *     value: string;
 * }
 *
 * const { Context: MyContext, useContextValue: useMyContext } = createGeoContext<IMyContext>("MyContext");
 *
 * // In provider component:
 * <MyContext.Provider value={{ value: "hello" }}>
 *     {children}
 * </MyContext.Provider>
 *
 * // In consumer:
 * const { value } = useMyContext(); // throws if not inside provider
 * ```
 *
 * @param name - Name for the context (used in error messages)
 * @returns Object with Context and useContextValue hook
 *
 * @internal
 */
export function createGeoContext<T>(name: string): {
    Context: Context<T | undefined>;
    useContextValue: () => T;
} {
    const Context = createContext<T | undefined>(undefined);
    Context.displayName = name;

    function useContextValue(): T {
        const value = useContext(Context);
        if (value === undefined) {
            throw new Error(`use${name} must be used within a ${name}Provider`);
        }
        return value;
    }

    return { Context, useContextValue };
}
