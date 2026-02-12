// (C) 2019-2026 GoodData Corporation

import { useEffect, useMemo, useRef, useState } from "react";

import { type DebouncedFunc, debounce } from "lodash-es";

/**
 * The output of the useDebouncedState hook.
 * @internal
 */
export type UseDebouncedStateOutput<T> = [
    /**
     * The current value.
     */
    T,
    /**
     * A function to set the value.
     */
    (value: T) => void,
    /**
     * The debounced value.
     */
    T,
    /**
     * A function to set the value immediately.
     */
    (value: T) => void,
];

/**
 * A helper hook to provide not just state/setState pair but also a debounced version of the state.
 * @internal
 * @example
 * ```
 * const MyComponent = () => {
 *     const [value, setValue, debouncedValue] = useDebouncedState("", 300);
 *     return <div>
 *         <input value={value} onInput={e => setValue(e.currentTarget.value)} />
 *         <SearchResults searchTerm={debouncedValue} />
 *      </div>
 * }
 * ```
 */
export const useDebouncedState = <T>(initialValue: T, delay: number): UseDebouncedStateOutput<T> => {
    const [value, setValue] = useState(initialValue);
    const [debouncedValue, setDebouncedValue] = useState(initialValue);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timeout);
        };
    }, [value, delay]);

    const setImmediate = (value: T) => {
        setValue(value);
        setDebouncedValue(value);
    };

    return [value, setValue, debouncedValue, setImmediate];
};

/**
 * A hook that returns a stable debounced version of a callback function.
 *
 * @remarks
 * This hook solves the common React problem of debouncing callbacks that depend on
 * frequently changing state or props. Unlike naive implementations that recreate the
 * debounced function on every render (turning debounce into just a delay), this hook:
 *
 * 1. **Maintains a stable debounced function reference** - The returned function identity
 *    never changes, preventing unnecessary re-renders in consuming components.
 *
 * 2. **Always calls the latest callback** - Uses a ref to ensure the debounced function
 *    always invokes the most recent version of the callback, even if it was updated
 *    between the debounce trigger and execution.
 *
 * 3. **Properly preserves the debounce timer** - The internal timer is created only once,
 *    ensuring proper debounce behavior where rapid calls reset the timer correctly.
 *
 * This pattern is particularly useful when the callback needs access to current state/props
 * without passing them as arguments.
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *     const [value, setValue] = useState("");
 *
 *     // The debounced function always has access to the latest `value`
 *     const debouncedSearch = useDebounce(() => {
 *         sendSearchRequest(value);
 *     }, 300);
 *
 *     const onChange = (e) => {
 *         setValue(e.target.value);
 *         debouncedSearch();
 *     };
 *
 *     return <input value={value} onChange={onChange} />;
 * };
 * ```
 *
 * @example
 * ```tsx
 * // With arguments - useful when you need to pass event data
 * const MyComponent = () => {
 *     const debouncedResize = useDebounce((width: number, height: number) => {
 *         handleResize(width, height);
 *     }, 100);
 *
 *     useEffect(() => {
 *         const handler = () => debouncedResize(window.innerWidth, window.innerHeight);
 *         window.addEventListener("resize", handler);
 *         return () => window.removeEventListener("resize", handler);
 *     }, [debouncedResize]);
 * };
 * ```
 *
 * @param callback - The function to debounce. Can accept any arguments.
 * @param delay - The debounce delay in milliseconds.
 * @returns A stable debounced version of the callback with `cancel` and `flush` methods.
 *
 * @internal
 */
export function useDebounce<T extends (...args: Parameters<T>) => void>(
    callback: T,
    delay: number,
): DebouncedFunc<(...args: Parameters<T>) => void> {
    const ref = useRef(callback);

    useEffect(() => {
        ref.current = callback;
    }, [callback]);

    const debouncedCallback = useMemo(() => {
        return debounce((...args: Parameters<T>) => ref.current?.(...args), delay);
    }, [delay]);

    return debouncedCallback;
}
