// (C) 2026 GoodData Corporation

import type { AccessGranteeDetail, IGranularRulesAccess } from "@gooddata/sdk-model";
import type { GeneralAccessValue } from "@gooddata/sdk-ui-kit";

/**
 * Find the `allWorkspaceUsers` rule grant if one exists. Its presence with
 * non-empty `permissions` is the single signal that distinguishes WORKSPACE
 * from RESTRICTED general access.
 */
export function findAllWorkspaceUsersGrant(grants: AccessGranteeDetail[]): IGranularRulesAccess | undefined {
    return grants.find((g): g is IGranularRulesAccess => g.type === "allWorkspaceUsers");
}

export function deriveGeneralAccess(grants: AccessGranteeDetail[]): GeneralAccessValue {
    const rule = findAllWorkspaceUsersGrant(grants);
    return rule && rule.permissions.length > 0 ? "WORKSPACE" : "RESTRICTED";
}

/**
 * Workspace-wide permission level when the rule grant exists. Defaults to
 * VIEW; promoted to SHARE only when the rule explicitly permits SHARE. EDIT
 * is intentionally not surfaced — the UI caps at VIEW/SHARE.
 */
export function deriveWorkspacePermissionLevel(grants: AccessGranteeDetail[]): "VIEW" | "SHARE" {
    const rule = findAllWorkspaceUsersGrant(grants);
    return rule?.permissions.includes("SHARE") ? "SHARE" : "VIEW";
}

/**
 * Count of named grantees (users + user groups). The `allWorkspaceUsers` rule
 * grant is excluded.
 */
