// (C) 2025 GoodData Corporation

import { type PropsWithChildren, createContext, useCallback, useContext, useMemo, useState } from "react";

import type { ObjectOrigin } from "@gooddata/sdk-model";

import type { ObjectType } from "../objectType/index.js";

interface IFilterState {
    types: ObjectType[];
    origin: ObjectOrigin;
    createdBy: string[];
    tags: string[];
    qualityIds: string[];
    isHidden?: boolean;
}

interface IFilterActions {
    setTypes: (types: ObjectType[]) => void;
    setOrigin: (origin: ObjectOrigin) => void;
    setCreatedBy: (createdBy: string[]) => void;
    setTags: (tags: string[]) => void;
    toggleTag: (tag: string) => void;
    setQualityIds: (qualityIds: string[]) => void;
    setIsHidden: (isHidden?: boolean) => void;
}

const initialState: IFilterState = {
    types: [],
    origin: "ALL",
    createdBy: [],
    tags: [],
    qualityIds: [],
    isHidden: undefined,
};

const initialActions: IFilterActions = {
    setTypes: () => {},
    setOrigin: () => {},
    setCreatedBy: () => {},
    setTags: () => {},
    toggleTag: () => {},
    setQualityIds: () => {},
    setIsHidden: () => {},
};

const FilterStateContext = createContext<IFilterState>(initialState);
const FilterActionsContext = createContext<IFilterActions>(initialActions);

export function FilterProvider({ children }: PropsWithChildren) {
    const [types, setTypes] = useState<ObjectType[]>(initialState.types);
    const [origin, setOrigin] = useState<ObjectOrigin>(initialState.origin);
    const [tags, setTags] = useState<string[]>(initialState.tags);
    const [createdBy, setCreatedBy] = useState<string[]>(initialState.createdBy);
    const [qualityIds, setQualityIds] = useState<string[]>(initialState.qualityIds);
    const [isHidden, setIsHidden] = useState<boolean | undefined>(initialState.isHidden);

    const toggleTag = useCallback((tag: string) => {
        setTags((tags) =>
            tags.includes(tag) ? tags.filter((currentTag) => currentTag !== tag) : [...tags, tag],
        );
    }, []);

    const state = useMemo(
        () => ({ types, origin, createdBy, tags, qualityIds, isHidden }),
        [types, origin, createdBy, tags, qualityIds, isHidden],
    );
    const actions = useMemo(
        () => ({ setTypes, setOrigin, setCreatedBy, setTags, toggleTag, setQualityIds, setIsHidden }),
        [setTypes, setOrigin, setCreatedBy, setTags, toggleTag, setQualityIds, setIsHidden],
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
