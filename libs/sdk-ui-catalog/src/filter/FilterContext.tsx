// (C) 2025 GoodData Corporation

import React, { createContext, useContext, useMemo, useState } from "react";

import type { ObjectOrigin } from "@gooddata/sdk-model";

interface IFilterState {
    origin: ObjectOrigin;
}

interface IFilterActions {
    setOrigin: (origin: ObjectOrigin) => void;
}

const initialState: IFilterState = {
    origin: "ALL",
};

const initialActions: IFilterActions = {
    setOrigin: () => {},
};

const FilterStateContext = createContext<IFilterState>(initialState);
const FilterActionsContext = createContext<IFilterActions>(initialActions);

export function FilterProvider({ children }: React.PropsWithChildren) {
    const [origin, setOrigin] = useState<ObjectOrigin>(initialState.origin);

    const state = useMemo(() => ({ origin }), [origin]);
    const actions = useMemo(() => ({ setOrigin }), [setOrigin]);

    return (
        <FilterStateContext.Provider value={state}>
            <FilterActionsContext.Provider value={actions}>{children}</FilterActionsContext.Provider>
        </FilterStateContext.Provider>
    );
}

export function useFilterState() {
    return useContext(FilterStateContext);
}

export function useFilterActions() {
    return useContext(FilterActionsContext);
}
