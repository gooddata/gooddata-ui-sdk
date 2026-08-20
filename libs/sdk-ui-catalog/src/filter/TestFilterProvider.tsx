// (C) 2026 GoodData Corporation

import { type PropsWithChildren, useMemo } from "react";

import { FilterStateContext, type IFilterState, defaultFilterState } from "./FilterContext.js";

type Props = PropsWithChildren<{
    state?: Partial<IFilterState>;
}>;

/**
 * Test-only FilterProvider holding a fixed filter state, so a test can exercise a hook that reads
 * the filters without driving the real reducer through its setters.
 *
 * The context value is memoized on `state`'s identity: the filter objects it hands out feed the
 * feed's query-options memo, so a fresh value per render would re-query forever. Swap `state` for a
 * new object to change the filters.
 * @internal
 */
export function TestFilterProvider({ children, state }: Props) {
    const value = useMemo<IFilterState>(() => ({ ...defaultFilterState, ...state }), [state]);

    return <FilterStateContext.Provider value={value}>{children}</FilterStateContext.Provider>;
}
