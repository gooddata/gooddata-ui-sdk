// (C) 2022-2025 GoodData Corporation

import React from "react";

/**
 * Returns initial prop value, when component mounted.
 * Is changed only on full component re-mount, not on prop update.
 *
 * @internal
 */
export const useInitialProp = <T>(prop: T): T => {
    const [state] = React.useState<T>(prop);

    return state;
};
