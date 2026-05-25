// (C) 2026 GoodData Corporation

import { createContext, useContext } from "react";

/**
 * Main context shared across all automation dialogs.
 * Shape grows incrementally as dep-cruiser migration reveals what
 * data is shared across all automation dialogs.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IAutomationsContextValue {}

const AutomationsContext = createContext<IAutomationsContextValue | undefined>(undefined);

export const AutomationsContextProvider = AutomationsContext.Provider;

export function useAutomationsContext(): IAutomationsContextValue {
    const ctx = useContext(AutomationsContext);
    if (!ctx) {
        throw new Error("useAutomationsContext must be used within AutomationsContextProvider");
    }
    return ctx;
}
