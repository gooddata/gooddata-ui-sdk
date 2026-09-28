// (C) 2026 GoodData Corporation

import { useCallback } from "react";

import type { IAnalyticalBackend, IObjectPermissionsObject } from "@gooddata/sdk-backend-spi";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { draftToPermissions } from "./objectShareController.helpers.js";
import type { IObjectShareDraft } from "./objectShareController.types.js";

/**
 * Writes a draft's access to an object that now exists.
 *
 * @remarks
 * One request, so it all lands or none does. True when it landed or asked for nothing,
 * false when it failed — nothing is shown to the user. For callers outside React; components
 * use {@link useApplyObjectPermissions}.
 *
 * @internal
 */
export async function applyObjectShareDraft(
    backend: IAnalyticalBackend,
    workspace: string,
    target: IObjectPermissionsObject,
    draft: IObjectShareDraft,
): Promise<boolean> {
    const permissions = draftToPermissions(draft);
    if (permissions.length === 0) {
        return true;
    }
    try {
        await backend.workspace(workspace).objectPermissions().manageObjectPermissions(target, permissions);
        return true;
    } catch {
        return false;
    }
}

/**
 * Writes a draft's access to an object that now exists, with the backend and workspace from context.
 *
 * @remarks
 * See {@link applyObjectShareDraft}.
 *
 * @internal
 */
export function useApplyObjectPermissions(): (
    target: IObjectPermissionsObject,
    draft: IObjectShareDraft,
) => Promise<boolean> {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    return useCallback(
        (target: IObjectPermissionsObject, draft: IObjectShareDraft) =>
            applyObjectShareDraft(backend, workspace, target, draft),
        [backend, workspace],
    );
}
