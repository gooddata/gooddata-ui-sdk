// (C) 2025 GoodData Corporation

import { type PropsWithChildren, createContext, useCallback, useContext, useMemo, useState } from "react";

import type { ObjectOrigin } from "@gooddata/sdk-model";

import type { ObjectType } from "../objectType/index.js";

interface IFilterState {
    types: ObjectType[];
    origin: ObjectOrigin;
    createdBy: string[];
    tags: string[];
}

interface IFilterActions {
    setTypes: (types: ObjectType[]) => void;
    setOrigin: (origin: ObjectOrigin) => void;
    setCreatedBy: (createdBy: string[]) => void;
    setTags: (tags: string[]) => void;
    toggleTag: (tag: string) => void;
}

const initialState: IFilterState = {
    types: [],
    origin: "ALL",
    createdBy: [],
    tags: [],
};

const initialActions: IFilterActions = {
    setTypes: () => {},
    setOrigin: () => {},
    setCreatedBy: () => {},
    setTags: () => {},
    toggleTag: () => {},
};

const FilterStateContext = createContext<IFilterState>(initialState);
const FilterActionsContext = createContext<IFilterActions>(initialActions);

export function FilterProvider({ children }: PropsWithChildren) {
    const [types, setTypes] = useState<ObjectType[]>(initialState.types);
    const [origin, setOrigin] = useState<ObjectOrigin>(initialState.origin);
    const [tags, setTags] = useState<string[]>(initialState.tags);
    const [createdBy, setCreatedBy] = useState<string[]>(initialState.createdBy);

    const toggleTag = useCallback((tag: string) => {
        setTags((tags) =>
            tags.includes(tag) ? tags.filter((currentTag) => currentTag !== tag) : [...tags, tag],
        );
    }, []);

    const state = useMemo(() => ({ types, origin, createdBy, tags }), [types, origin, createdBy, tags]);
    const actions = useMemo(
        () => ({ setTypes, setOrigin, setCreatedBy, setTags, toggleTag }),
        [setTypes, setOrigin, setCreatedBy, setTags, toggleTag],
    );

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
