// (C) 2025 GoodData Corporation

import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useMemo, useState } from "react";

import { KdaState } from "../internalTypes.js";

const defaultState: KdaState = {
    //main items
    definition: null,
    definitionStatus: "pending",
    items: [],
    itemsStatus: "pending",
    //selected
    selectedTrend: "up",
    selectedItem: "summary",
    selectedStatus: "pending",
    //root data
    attributeFilters: [],
    //summary data
    combinations: 0,
    selectedAttributes: [],
};

const KdaStateContext = createContext<{
    state: KdaState;
    setState: Dispatch<SetStateAction<Partial<KdaState>>>;
}>({
    state: defaultState,
    setState: () => {},
});

export function KdaStateProvider({ children, value }: { children: ReactNode; value?: Partial<KdaState> }) {
    const [state, setStateInternal] = useState<KdaState>({
        ...defaultState,
        ...value,
    });
    const providerValue = useMemo(() => {
        const setState = (newState: SetStateAction<Partial<KdaState>>) => {
            setStateInternal((prev) => ({ ...prev, ...newState }));
        };

        return { state, setState };
    }, [state]);

    return <KdaStateContext.Provider value={providerValue}>{children}</KdaStateContext.Provider>;
}

export function useKdaState() {
    return useContext(KdaStateContext);
}
