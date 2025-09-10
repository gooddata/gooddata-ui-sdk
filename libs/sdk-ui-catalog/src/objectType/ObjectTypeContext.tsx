// (C) 2025 GoodData Corporation

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import type { ObjectType } from "./types.js";

interface IObjectTypeState {
    counter: Record<ObjectType, number>;
}
interface IObjectTypeActions {
    setCounter: (counter: Record<ObjectType, number>) => void;
}

const initialState: IObjectTypeState = {
    counter: {
        measure: 0,
        fact: 0,
        attribute: 0,
        insight: 0,
        analyticalDashboard: 0,
    },
};
const initialActions: IObjectTypeActions = {
    setCounter: () => {},
};

export const ObjectTypeStateContext = createContext<IObjectTypeState>(initialState);
export const ObjectTypeActionsContext = createContext<IObjectTypeActions>(initialActions);

export function ObjectTypeProvider({ children }: React.PropsWithChildren) {
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

export function useObjectTypeCounterSync(items: { type: ObjectType }[]) {
    const { setCounter } = useObjectTypeActions();

    useEffect(() => {
        const counter = { ...initialState.counter };
        for (const item of items) {
            counter[item.type] = counter[item.type] + 1;
        }
        setCounter(counter);
    }, [items, setCounter]);
}
