// (C) 2026 GoodData Corporation

import { useCallback } from "react";

import type { IObjectPermissionsObject } from "@gooddata/sdk-backend-spi";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { draftToPermissions } from "./objectShareController.helpers.js";
import type { IObjectShareDraft } from "./objectShareController.types.js";

/**
 * Writes a draft's access to an object that now exists.
 *
 * @remarks
 * One request, so it all lands or none does. True when it landed or asked for nothing,
 * false when it failed — nothing is shown to the user.
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
        async (target: IObjectPermissionsObject, draft: IObjectShareDraft): Promise<boolean> => {
            const permissions = draftToPermissions(draft);
            if (permissions.length === 0) {
                return true;
            }
            try {
                await backend
                    .workspace(workspace)
                    .objectPermissions()
                    .manageObjectPermissions(target, permissions);
                return true;
            } catch {
                return false;
            }
        },
        [backend, workspace],
    );
}
