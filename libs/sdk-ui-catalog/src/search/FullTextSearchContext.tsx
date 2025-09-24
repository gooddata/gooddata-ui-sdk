// (C) 2025 GoodData Corporation

import { type PropsWithChildren, createContext, useContext, useMemo, useState } from "react";

export interface IFullTextSearchState {
    searchTerm: string;
}

export interface IFullTextSearchActions {
    setSearchTerm: (searchTerm: string) => void;
}

const initialState: IFullTextSearchState = {
    searchTerm: "",
};

const initialActions: IFullTextSearchActions = {
    setSearchTerm: () => {},
};

const FullTextSearchStateContext = createContext<IFullTextSearchState>(initialState);
const FullTextSearchActionsContext = createContext<IFullTextSearchActions>(initialActions);

export function FullTextSearchProvider({ children }: PropsWithChildren) {
    const [searchTerm, setSearchTerm] = useState<IFullTextSearchState["searchTerm"]>(initialState.searchTerm);

    const state = useMemo(() => ({ searchTerm }), [searchTerm]);
    const actions = useMemo(() => ({ setSearchTerm }), [setSearchTerm]);

    return (
        <FullTextSearchStateContext.Provider value={state}>
            <FullTextSearchActionsContext.Provider value={actions}>
                {children}
            </FullTextSearchActionsContext.Provider>
        </FullTextSearchStateContext.Provider>
    );
}

export function useFullTextSearchState(): IFullTextSearchState {
    return useContext(FullTextSearchStateContext);
}

export function useFullTextSearchActions(): IFullTextSearchActions {
    return useContext(FullTextSearchActionsContext);
}
