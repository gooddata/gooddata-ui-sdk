// (C) 2021-2025 GoodData Corporation
import { useEffect, useRef } from "react";

/**
 * Hook for storing the previous value of a variable.
 * This is useful as a replacement for the componentWillReceiveProps lifecycle method.
 * See: https://reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state
 * @internal
 */
export const usePrevious = <T>(value: T): T => {
    const previousValueRef = useRef<T>(value);

    useEffect(() => {
        previousValueRef.current = value;
    }, [value]);

    return previousValueRef.current;
};
