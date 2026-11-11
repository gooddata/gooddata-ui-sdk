// (C) 2026 GoodData Corporation

import type { GeneralAccessValue } from "@gooddata/sdk-ui-kit";

import { levelsBelow, maxLevel } from "./objectShareController.helpers.js";
import type { IObjectShareGrantee, ObjectSharePermissionLevel } from "./objectShareController.types.js";

/**
 * Which confirm a row change waits on, by the access the grantee keeps afterwards. Lowering
 * your own level is always `selfRestrict`.
 *
 * @internal
 */
export type RowConfirmKind =
    | "loseAccess"
    | "inheritedStays"
    | "workspaceStays"
    | "selfLoseAccess"
    | "selfLoseEditAccess"
    | "selfRestrict";

/**
 * Picks the confirm for removing `grantee`. Undefined for the caller's own row when it is not
 * self-managed: a workspace manager keeps access through the role.
 *
 * @internal
 */
export function removeAccessConfirmKind(
    grantee: Pick<IObjectShareGrantee, "id" | "isSelf" | "level" | "inheritedLevel">,
    access: {
        selfManagedGranteeId: string | undefined;
        generalAccess: GeneralAccessValue;
        workspaceLevel: ObjectSharePermissionLevel;
    },
): RowConfirmKind | undefined {
    const workspaceKept = access.generalAccess === "WORKSPACE" ? access.workspaceLevel : undefined;
    if (access.selfManagedGranteeId === grantee.id) {
        const kept = maxLevel(grantee.inheritedLevel, workspaceKept);
        if (kept === undefined) {
            return grantee.level === "EDIT" ? "selfLoseEditAccess" : "selfLoseAccess";
        }
        if (levelsBelow(grantee.level).includes(kept)) {
            return "selfRestrict";
        }
    } else if (grantee.isSelf) {
        return undefined;
    }
    if (grantee.inheritedLevel !== undefined) {
        return "inheritedStays";
    }
    return workspaceKept === undefined ? "loseAccess" : "workspaceStays";
}
