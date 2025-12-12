// (C) 2025 GoodData Corporation

import {
    type Dispatch,
    type ReactNode,
    type SetStateAction,
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

import { type KdaState } from "../internalTypes.js";

const defaultState: KdaState = {
    //main items
    definition: null,
    toValue: undefined,
    fromValue: undefined,
    definitionStatus: "pending",
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
