// (C) 2019-2025 GoodData Corporation

import { useState, useEffect } from "react";

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
