// (C) 2025 GoodData Corporation

import React, { useMemo } from "react";

import type { IWorkspacePermissions } from "@gooddata/sdk-model";

import { PermissionsProvider } from "./PermissionsContext.js";
import type { PermissionsState } from "./types.js";

type Props = React.PropsWithChildren<{
    status?: PermissionsState["status"];
    result?: Partial<PermissionsState["result"]>;
    error?: PermissionsState["error"];
}>;

const defaultPermissionsStatus = "success";
const defaultPermissionsResult = { canCreateVisualization: true } as IWorkspacePermissions;
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
