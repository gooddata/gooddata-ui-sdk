// (C) 2022-2025 GoodData Corporation

import { useRef } from "react";

/**
 * Automatically updates ref contents with the argument value
 *
 * @internal
 */
export const useAutoupdateRef = <T>(value: T) => {
    const ref = useRef<T>(value);
    ref.current = value;

    return ref;
};
