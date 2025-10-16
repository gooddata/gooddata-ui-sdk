// (C) 2025 GoodData Corporation

import {
    Dispatch,
    ReactNode,
    SetStateAction,
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

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
    selectedAttributes: [],
    selectedUpdated: 0,
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

    const setState = useCallback((newState: SetStateAction<Partial<KdaState>>) => {
        setStateInternal((prev) => ({ ...prev, ...newState }));
    }, []);

    const providerValue = useMemo(() => {
        return { state, setState };
    }, [state, setState]);

    return <KdaStateContext.Provider value={providerValue}>{children}</KdaStateContext.Provider>;
}

export function useKdaState() {
    return useContext(KdaStateContext);
}
