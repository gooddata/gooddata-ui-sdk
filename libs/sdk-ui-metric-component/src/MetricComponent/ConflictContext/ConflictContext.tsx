// (C) 2023-2026 GoodData Corporation

import { type ReactNode, createContext } from "react";

import { type ConflictChecker } from "./useConflictDetection.js";

/**
 * @internal
 */
export interface IConflictContext {
    checker: ConflictChecker;
    children?: ReactNode;
}

export const ConflictContext = createContext<IConflictContext>({
    checker: () => Promise.resolve([]),
});

/**
 * @internal
 */
export function ConflictContextProvider({ children, checker }: IConflictContext) {
    return <ConflictContext.Provider value={{ checker }}>{children}</ConflictContext.Provider>;
}
