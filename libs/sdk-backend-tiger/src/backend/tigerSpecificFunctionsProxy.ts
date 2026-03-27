// (C) 2026 GoodData Corporation

import { type TigerSpecificFunctions } from "./tigerSpecificFunctions.js";

/**
 * Result of creating a tiger-specific functions proxy.
 * Separates the consumer API (`functions`) from the owner API
 * (`updateImplementation`).
 *
 * @internal
 * @deprecated Tiger-specific functions are legacy and will be removed.
 */
export interface ITigerSpecificFunctionsProxyResult {
    /**
     * The proxied functions object. Every method defined on
     * {@link TigerSpecificFunctions} is always callable on this object — if
     * the underlying implementation is not (yet) set, the method logs a
     * warning and returns `undefined`.
     *
     * Pass this to consumers; do not expose `updateImplementation`.
     */
    readonly functions: TigerSpecificFunctions;

    /**
     * Replace the underlying implementation. Typically called from the
     * `onTigerSpecificFunctionsReady` callback. Safe to call multiple times
     * (e.g., when `withAuthentication` re-triggers the callback with a newly
     * authenticated backend).
     */
    updateImplementation(impl: TigerSpecificFunctions): void;
}

/**
 * Creates a proxy that dynamically delegates every method call to the
 * underlying {@link TigerSpecificFunctions} implementation.
 *
 * @internal
 * @deprecated Tiger-specific functions are legacy and will be removed.
 */
export function createTigerSpecificFunctionsProxy(
    initialImplementation?: TigerSpecificFunctions,
): ITigerSpecificFunctionsProxyResult {
    let impl: TigerSpecificFunctions = initialImplementation ?? {};

    // Cache stubs by property name so that repeated access returns the same
    // function reference (important for React dep-arrays / shallow comparison).
    // Stubs are never cleared — they delegate to `impl` dynamically at call
    // time, so the cache only grows monotonically with the set of accessed
    // property names. This is intentional: clearing would break reference
    // stability for React consumers.
    const stubCache = new Map<string, (...args: unknown[]) => unknown>();

    // Returns a cached delegating stub that looks up the current impl at call
    // time. Shared between the `get` and `getOwnPropertyDescriptor` traps so
    // that even spread copies (`{ ...proxy }`) stay dynamically bound.
    const getOrCreateStub = (prop: string): ((...args: unknown[]) => unknown) => {
        let stub = stubCache.get(prop);
        if (stub) {
            return stub;
        }

        stub = (...args: unknown[]): unknown => {
            const fn = impl[prop as keyof TigerSpecificFunctions];
            if (typeof fn === "function") {
                return (fn as (...a: unknown[]) => unknown)(...args);
            }
            console.warn(
                `Trying to call the ${prop} tiger specific function, but no implementation ` +
                    `of it is available. Please make sure you are running on a tiger-compatible backend.`,
            );
            return undefined;
        };

        stubCache.set(prop, stub);
        return stub;
    };

    const functions: TigerSpecificFunctions = new Proxy({} as TigerSpecificFunctions, {
        get(_target, prop: string | symbol): unknown {
            if (typeof prop === "symbol") {
                return undefined;
            }

            return getOrCreateStub(prop);
        },

        // Support spreading ({ ...proxy }) by exposing the implementation's keys.
        // Without these traps, spreading a Proxy yields an empty object because
        // the target has no own keys.
        ownKeys(): string[] {
            return Object.keys(impl);
        },
        getOwnPropertyDescriptor(_target, prop: string | symbol): PropertyDescriptor | undefined {
            if (typeof prop === "string" && prop in impl) {
                return {
                    configurable: true,
                    enumerable: true,
                    writable: true,
                    value: getOrCreateStub(prop),
                };
            }
            return undefined;
        },
    });

    return {
        functions,
        updateImplementation(newImpl: TigerSpecificFunctions): void {
            impl = newImpl;
        },
    };
}
