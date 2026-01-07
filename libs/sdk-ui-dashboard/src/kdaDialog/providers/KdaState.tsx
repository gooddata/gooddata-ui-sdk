// (C) 2025-2026 GoodData Corporation

import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { KdaState } from "../internalTypes.js";

const defaultState: KdaState = {
    //main items
    definition: null,
    toValue: undefined,
    fromValue: undefined,
    definitionStatus: "pending",
    isMinimized: true,
    items: [],
    itemsStatus: "pending",
    //states
    attributesDropdownOpen: false,
    addFilterDropdownOpen: false,
    //selected
    selectedTrend: ["up", "down"],
    selectedItem: "summary",
    selectedStatus: "pending",
    //root data
    attributeFilters: [],
    //attributes data
    selectedAttributes: [],
    selectedUpdated: 0,
    relevantAttributes: [],
    relevantStatus: "pending",
};

type KdaStateContextType = {
    state: KdaState;
    setState: (newState: Partial<KdaState>) => void;
};

const KdaStateContext = createContext<KdaStateContextType>({
    state: defaultState,
    setState: () => undefined,
});

export function KdaStateProvider({ children, value }: { children: ReactNode; value?: Partial<KdaState> }) {
    const [state, setStateInternal] = useState<KdaState>({ ...defaultState, ...value });

    useEffect(() => {
        setStateInternal({ ...defaultState, ...value });
    }, [value]);

    const setState: KdaStateContextType["setState"] = useCallback((newState) => {
        setStateInternal((prevState) => ({ ...prevState, ...newState }));
    }, []);

    const providerValue = useMemo(() => {
        return { state, setState };
    }, [state, setState]);

    return <KdaStateContext.Provider value={providerValue}>{children}</KdaStateContext.Provider>;
}

export function useKdaState() {
    return useContext(KdaStateContext);
}
