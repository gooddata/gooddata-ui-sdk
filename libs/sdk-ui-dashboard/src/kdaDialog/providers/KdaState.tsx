// (C) 2025-2026 GoodData Corporation

import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { IKdaState } from "../internalTypes.js";

const defaultState: IKdaState = {
    //main items
    definition: null,
    toValue: undefined,
    fromValue: undefined,
    definitionStatus: "pending",
    isMinimized: true,
    items: [],
    itemsStatus: "pending",
    itemsError: undefined,
    //states
    attributesDropdownOpen: false,
    addFilterDropdownOpen: false,
    //selected
    selectedTrend: ["up", "down"],
    selectedItem: "summary",
    selectedStatus: "pending",
    selectedError: undefined,
    //root data
    attributeFilters: [],
    //attributes data
    selectedAttributes: [],
    selectedUpdated: 0,
    relevantAttributes: [],
    relevantStatus: "pending",
    includeTags: undefined,
    excludeTags: undefined,
};

type KdaStateContextType = {
    state: IKdaState;
    setState: (newState: Partial<IKdaState>) => void;
};

const KdaStateContext = createContext<KdaStateContextType>({
    state: defaultState,
    setState: () => undefined,
});

export function KdaStateProvider({ children, value }: { children: ReactNode; value?: Partial<IKdaState> }) {
    const [state, setStateInternal] = useState<IKdaState>({ ...defaultState, ...value });

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
