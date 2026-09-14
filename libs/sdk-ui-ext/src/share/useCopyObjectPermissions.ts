// (C) 2026 GoodData Corporation

import { useCallback } from "react";

import type { IObjectPermissionsObject } from "@gooddata/sdk-backend-spi";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { accessListToPermissions } from "./objectShareController.helpers.js";

/**
 * Reproduces one object's own access on another.
 *
 * @remarks
 * Inherited grants are left out; they follow the grantee. False when the access could
 * not be read or written.
 *
 * @internal
 */
export function useCopyObjectPermissions(): (
    from: IObjectPermissionsObject,
    to: IObjectPermissionsObject,
) => Promise<boolean> {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    return useCallback(
        async (from: IObjectPermissionsObject, to: IObjectPermissionsObject): Promise<boolean> => {
            const service = backend.workspace(workspace).objectPermissions();
            try {
                const permissions = accessListToPermissions(await service.getAccessList(from));
                if (permissions.length > 0) {
                    await service.manageObjectPermissions(to, permissions);
                }
                return true;
            } catch {
                return false;
            }
        },
        [backend, workspace],
    );
}
