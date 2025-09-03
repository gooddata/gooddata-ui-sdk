// (C) 2025 GoodData Corporation

import React, { createContext, useContext, useMemo, useState } from "react";

import type { ObjectType } from "./types.js";

export interface IObjectTypeState {
    types: ObjectType[];
}
export interface IObjectTypeActions {
    setTypes: (types: ObjectType[]) => void;
}

const initialState: IObjectTypeState = {
    types: [],
};
const initialActions: IObjectTypeActions = {
    setTypes: () => {},
};

const ObjectTypeStateContext = createContext<IObjectTypeState>(initialState);
const ObjectTypeActionsContext = createContext<IObjectTypeActions>(initialActions);

export function ObjectTypeProvider({ children }: React.PropsWithChildren) {
    const [types, setTypes] = useState<ObjectType[]>(initialState.types);

    const state = useMemo(() => ({ types }), [types]);
    const actions = useMemo(() => ({ setTypes }), [setTypes]);

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
