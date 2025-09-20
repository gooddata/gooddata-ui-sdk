// (C) 2025 GoodData Corporation

import { type PropsWithChildren, createContext, useContext, useMemo, useState } from "react";

import type { ObjectOrigin } from "@gooddata/sdk-model";

import type { ObjectType } from "../objectType/index.js";

interface IFilterState {
    types: ObjectType[];
    origin: ObjectOrigin;
    tags: string[];
}

interface IFilterActions {
    setTypes: (types: ObjectType[]) => void;
    setOrigin: (origin: ObjectOrigin) => void;
    setTags: (tags: string[]) => void;
}

const initialState: IFilterState = {
    types: [],
    origin: "ALL",
    tags: [],
};

const initialActions: IFilterActions = {
    setTypes: () => {},
    setOrigin: () => {},
    setTags: () => {},
};

const FilterStateContext = createContext<IFilterState>(initialState);
const FilterActionsContext = createContext<IFilterActions>(initialActions);

export function FilterProvider({ children }: PropsWithChildren) {
    const [types, setTypes] = useState<ObjectType[]>(initialState.types);
    const [origin, setOrigin] = useState<ObjectOrigin>(initialState.origin);
    const [tags, setTags] = useState<string[]>(initialState.tags);

    const state = useMemo(() => ({ types, origin, tags }), [types, origin, tags]);
    const actions = useMemo(() => ({ setTypes, setOrigin, setTags }), [setTypes, setOrigin, setTags]);

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
