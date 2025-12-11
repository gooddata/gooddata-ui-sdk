// (C) 2025 GoodData Corporation

import { type PropsWithChildren, createContext, useContext } from "react";

import type { IUiComboboxState } from "./types.js";

const StateContext = createContext<IUiComboboxState | null>(null);

type Props = PropsWithChildren<{
    state: IUiComboboxState;
}>;

export function UiComboboxContextProvider({ state, children }: Props) {
    return <StateContext.Provider value={state}>{children}</StateContext.Provider>;
}

/** @internal */
export function useComboboxState(): IUiComboboxState {
    const state = useContext(StateContext);
    if (!state) {
        throw new Error("`useComboboxState` must be used within `UiCombobox`");
    }
    return state;
}
