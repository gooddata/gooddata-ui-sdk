// (C) 2025-2026 GoodData Corporation

import { type PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from "react";

import { ObjectTypes } from "./constants.js";
import type { ObjectType } from "./types.js";

interface IObjectTypeState {
    counter: Record<ObjectType, number>;
}
interface IObjectTypeActions {
    setCounter: (counter: Record<ObjectType, number>) => void;
}

const initialState: IObjectTypeState = {
    counter: {
        [ObjectTypes.METRIC]: 0,
        [ObjectTypes.FACT]: 0,
        [ObjectTypes.ATTRIBUTE]: 0,
        [ObjectTypes.DATASET]: 0,
        [ObjectTypes.VISUALIZATION]: 0,
        [ObjectTypes.DASHBOARD]: 0,
    },
};
const initialActions: IObjectTypeActions = {
    setCounter: () => {},
};

export const ObjectTypeStateContext = createContext<IObjectTypeState>(initialState);
export const ObjectTypeActionsContext = createContext<IObjectTypeActions>(initialActions);

export function ObjectTypeProvider({ children }: PropsWithChildren) {
    const [counter, setCounter] = useState<Record<ObjectType, number>>(initialState.counter);

    const state = useMemo(() => ({ counter }), [counter]);
    const actions = useMemo(() => ({ setCounter }), [setCounter]);

    return (
        <ObjectTypeStateContext.Provider value={state}>
            <ObjectTypeActionsContext.Provider value={actions}>{children}</ObjectTypeActionsContext.Provider>
        </ObjectTypeStateContext.Provider>
    );
}

export function useObjectTypeState(): IObjectTypeState {
    return useContext(ObjectTypeStateContext);
}

export function useObjectTypeActions(): IObjectTypeActions {
    return useContext(ObjectTypeActionsContext);
}

export function useObjectTypeCounterSync(counter: Record<ObjectType, number>) {
    const { setCounter } = useObjectTypeActions();

    useEffect(() => setCounter(counter), [counter, setCounter]);
}
