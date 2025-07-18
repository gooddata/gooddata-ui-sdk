// (C) 2022-2025 GoodData Corporation
import { useState, useEffect } from "react";

/**
 * Used when there is an internal state that has the initial value provided by a prop.
 *
 * @internal
 */
export const usePropState = <T>(prop: T) => {
    const [state, setState] = useState<T>(prop);

    useEffect(() => {
        setState(prop);
    }, [prop]);

    return [state, setState] as const;
};
