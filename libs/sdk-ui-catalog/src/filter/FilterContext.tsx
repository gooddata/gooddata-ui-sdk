// (C) 2025 GoodData Corporation

import React, { createContext, useContext, useMemo, useState } from "react";

import type { ObjectOrigin } from "@gooddata/sdk-model";

import type { ObjectType } from "../objectType/index.js";

interface IFilterState {
    types: ObjectType[];
    origin: ObjectOrigin;
}

interface IFilterActions {
    setTypes: (types: ObjectType[]) => void;
    setOrigin: (origin: ObjectOrigin) => void;
}

const initialState: IFilterState = {
    types: [],
    origin: "ALL",
};

const initialActions: IFilterActions = {
    setTypes: () => {},
    setOrigin: () => {},
};

const FilterStateContext = createContext<IFilterState>(initialState);
const FilterActionsContext = createContext<IFilterActions>(initialActions);

export function FilterProvider({ children }: React.PropsWithChildren) {
    const [types, setTypes] = useState<ObjectType[]>(initialState.types);
    const [origin, setOrigin] = useState<ObjectOrigin>(initialState.origin);

    const state = useMemo(() => ({ types, origin }), [types, origin]);
    const actions = useMemo(() => ({ setTypes, setOrigin }), [setTypes, setOrigin]);

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
