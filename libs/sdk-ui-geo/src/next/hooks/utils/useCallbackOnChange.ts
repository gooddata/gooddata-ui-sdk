// (C) 2025 GoodData Corporation

import { useEffect, useRef } from "react";

/**
 * Hook that calls a callback when a value changes.
 *
 * @remarks
 * This utility hook is useful for notification patterns where you need to
 * call a callback only when a value changes, not on every render.
 *
 * @param value - The value to track for changes
 * @param callback - The callback to invoke when value changes
 * @param shouldTrigger - Optional predicate to gate callback invocation (default: true)
 *
 * @example
 * ```typescript
 * // Notify host when loading state changes
 * useCallbackOnChange(isLoading, (loading) => onLoadingChanged?.({ isLoading: loading }));
 *
 * // Only notify when error is truthy
 * useCallbackOnChange(error, (err) => onError?.(err), Boolean(error));
 * ```
 *
 * @internal
 */
export function useCallbackOnChange<T>(
    value: T,
    callback: ((value: T) => void) | undefined,
    shouldTrigger: boolean = true,
): void {
    const prevValueRef = useRef<T | undefined>(undefined);

    useEffect(() => {
        if (!shouldTrigger) {
            return;
        }

        if (prevValueRef.current !== value) {
            prevValueRef.current = value;
            callback?.(value);
        }
    }, [value, callback, shouldTrigger]);
}
