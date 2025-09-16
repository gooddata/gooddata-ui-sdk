// (C) 2025 GoodData Corporation

import { type PropsWithChildren, createContext, useContext } from "react";

import type { PermissionsState } from "./types.js";

const PermissionsContext = createContext<PermissionsState | undefined>(undefined);

type Props = PropsWithChildren<{
    permissionsState: PermissionsState;
}>;

export function PermissionsProvider({ children, permissionsState }: Props) {
    return <PermissionsContext.Provider value={permissionsState}>{children}</PermissionsContext.Provider>;
}

export function usePermissionsState(): PermissionsState {
    const permissions = useContext(PermissionsContext);
    if (!permissions) {
        throw new Error("PermissionsContext not found");
    }
    return permissions;
}
