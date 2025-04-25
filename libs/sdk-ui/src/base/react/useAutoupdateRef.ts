// (C) 2022-2025 GoodData Corporation
import React from "react";

/**
 * Automatically updates ref contents with the argument value
 *
 * @internal
 */
export const useAutoupdateRef = <T>(value: T) => {
    const ref = React.useRef<T>(value);

    React.useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref;
};
