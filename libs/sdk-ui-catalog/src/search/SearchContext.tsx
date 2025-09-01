// (C) 2025 GoodData Corporation

import React, { createContext, useContext, useMemo, useState } from "react";

import type { ISemanticSearchResultItem } from "@gooddata/sdk-model";

import type { AsyncStatus } from "../async/index.js";

export interface ISearchState {
    /**
     * Whether the user is actively searching or not.
     */
    isSearching: boolean;
    /**
     * The status of the search.
     */
    searchStatus: AsyncStatus;
    /**
     * The items found by the search.
     */
    searchItems: ISemanticSearchResultItem[];
}

export interface ISearchActions {
    setIsSearching: (isSearching: boolean) => void;
    setSearchStatus: (status: ISearchState["searchStatus"]) => void;
    setSearchItems: (results: ISearchState["searchItems"]) => void;
}

const SearchStateContext = createContext<ISearchState | null>(null);
const SearchActionsContext = createContext<ISearchActions | null>(null);

export function SearchProvider({ children }: React.PropsWithChildren) {
    const [isSearching, setIsSearching] = useState(false);
    const [searchStatus, setSearchStatus] = useState<ISearchState["searchStatus"]>("idle");
    const [searchItems, setSearchItems] = useState<ISearchState["searchItems"]>([]);

    const state = useMemo(
        () => ({
            isSearching,
            searchStatus,
            searchItems,
        }),
        [isSearching, searchStatus, searchItems],
    );
    const actions = useMemo(
        () => ({
            setIsSearching,
            setSearchStatus,
            setSearchItems,
        }),
        [setSearchItems, setIsSearching, setSearchStatus],
    );

    return (
        <SearchStateContext.Provider value={state}>
            <SearchActionsContext.Provider value={actions}>{children}</SearchActionsContext.Provider>
        </SearchStateContext.Provider>
    );
}

export function useSearchState(): ISearchState {
    const context = useContext(SearchStateContext);
    if (!context) {
        throw new Error("useSearchState must be used within a SearchProvider");
    }
    return context;
}

export function useSearchActions(): ISearchActions {
    const context = useContext(SearchActionsContext);
    if (!context) {
        throw new Error("useSearchActions must be used within a SearchProvider");
    }
    return context;
}
