// (C) 2022-2025 GoodData Corporation
import React from "react";

/**
 * @internal
 */
export const usePropState = <T>(prop: T) => {
    const [state, setState] = React.useState<T>(prop);

    React.useEffect(() => {
        setState(prop);
    }, [prop]);

    return [state, setState] as const;
};
