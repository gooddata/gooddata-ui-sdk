// (C) 2022-2025 GoodData Corporation

import { useEffect, useRef } from "react";

/**
 * Automatically updates ref contents with the argument value
 *
 * @internal
 */
export const useAutoupdateRef = <T>(value: T) => {
    const ref = useRef<T>(value);

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref;
};
