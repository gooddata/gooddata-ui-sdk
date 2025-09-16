// (C) 2025 GoodData Corporation

import { type PropsWithChildren, createContext, useContext, useMemo, useState } from "react";

import type { ISemanticSearchResultItem } from "@gooddata/sdk-model";

import type { AsyncStatus } from "../async/index.js";

export interface ISearchState {
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
    setSearchStatus: (status: ISearchState["searchStatus"]) => void;
    setSearchItems: (results: ISearchState["searchItems"]) => void;
}

const SearchStateContext = createContext<ISearchState | null>(null);
const SearchActionsContext = createContext<ISearchActions | null>(null);

export function SearchProvider({ children }: PropsWithChildren) {
    const [searchStatus, setSearchStatus] = useState<ISearchState["searchStatus"]>("idle");
    const [searchItems, setSearchItems] = useState<ISearchState["searchItems"]>([]);

    const state = useMemo(
        () => ({
            searchStatus,
            searchItems,
        }),
        [searchStatus, searchItems],
    );
    const actions = useMemo(
        () => ({
            setSearchStatus,
            setSearchItems,
        }),
        [setSearchItems, setSearchStatus],
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
