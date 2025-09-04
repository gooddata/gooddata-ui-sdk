// (C) 2025 GoodData Corporation

import React, { useMemo } from "react";

import type { IUser, IWorkspacePermissions } from "@gooddata/sdk-model";

import { PermissionsProvider } from "./PermissionsContext.js";
import type { PermissionsState } from "./types.js";

type Props = React.PropsWithChildren<{
    status?: PermissionsState["status"];
    result?: Partial<PermissionsState["result"]>;
    error?: PermissionsState["error"];
}>;

const defaultPermissionsStatus = "success";
const defaultPermissionsResult = {
    permissions: { canCreateVisualization: true } as IWorkspacePermissions,
    user: { login: "test" } as IUser,
};
const defaultPermissionsError = undefined;

/**
 * Test-only PermissionsProvider
 * @internal
 */
export function TestPermissionsProvider({
    children,
    status = defaultPermissionsStatus,
    result = defaultPermissionsResult,
    error = defaultPermissionsError,
}: Props) {
    const permissionsState = useMemo(
        () => ({ status, result, error }) as PermissionsState,
        [status, result, error],
    );
    return <PermissionsProvider permissionsState={permissionsState}>{children}</PermissionsProvider>;
}
