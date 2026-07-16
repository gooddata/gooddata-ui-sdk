// (C) 2026 GoodData Corporation

import type { AccessGranteeDetail, IGranularRulesAccess } from "@gooddata/sdk-model";
import type { GeneralAccessValue } from "@gooddata/sdk-ui-kit";

/**
 * All `allWorkspaceUsers` rule grants. With workspace hierarchy the backend
 * returns one entry per granting workspace — this workspace's own grant carries
 * direct `permissions` while a parent's carries `inheritedPermissions`, in
 * unspecified order. Callers must aggregate across entries, never inspect just
 * the first.
 */
export function findAllWorkspaceUsersGrants(grants: AccessGranteeDetail[]): IGranularRulesAccess[] {
    return grants.filter((g): g is IGranularRulesAccess => g.type === "allWorkspaceUsers");
}

/**
 * Whether THIS workspace grants access to all workspace users — some rule entry
 * with non-empty direct `permissions`. Inherited (parent-workspace) rule access
 * is deliberately excluded: this value backs the mutable direct state; displays
 * compose it with {@link deriveInheritedWorkspaceLevel}.
 */
export function deriveGeneralAccess(grants: AccessGranteeDetail[]): GeneralAccessValue {
    return findAllWorkspaceUsersGrants(grants).some((rule) => rule.permissions.length > 0)
        ? "WORKSPACE"
        : "RESTRICTED";
}

/**
 * Workspace-wide permission level of this workspace's own rule grant. Defaults
 * to VIEW; promoted to SHARE only when some rule entry directly permits SHARE.
 * EDIT is intentionally not surfaced — the UI caps at VIEW/SHARE.
 */
export function deriveWorkspacePermissionLevel(grants: AccessGranteeDetail[]): "VIEW" | "SHARE" {
    return findAllWorkspaceUsersGrants(grants).some((rule) => rule.permissions.includes("SHARE"))
        ? "SHARE"
        : "VIEW";
}

/**
 * Strongest workspace-wide level inherited from parent workspaces, or undefined
 * when none is inherited. Inherited rule access grants every user of this
 * workspace access too (workspace membership cascades down the hierarchy), yet
 * cannot be revoked from here — consumers must surface it as workspace access
 * and disable the Restricted option.
 */
export function deriveInheritedWorkspaceLevel(grants: AccessGranteeDetail[]): "VIEW" | "SHARE" | undefined {
    const inherited = findAllWorkspaceUsersGrants(grants).flatMap((rule) => rule.inheritedPermissions);
    if (inherited.includes("SHARE")) {
        return "SHARE";
    }
    return inherited.length > 0 ? "VIEW" : undefined;
}

/**
 * The effective (displayed) workspace access: the direct state composed with
 * inherited rule access. Inherited access makes general access WORKSPACE even
 * when this workspace holds no rule of its own, and the level is the strongest
 * of the two.
 */
export function composeEffectiveWorkspaceAccess(
    direct: GeneralAccessValue,
    directLevel: "VIEW" | "SHARE",
    inheritedLevel: "VIEW" | "SHARE" | undefined,
): { generalAccess: GeneralAccessValue; workspaceLevel: "VIEW" | "SHARE" } {
    const generalAccess = direct === "WORKSPACE" || inheritedLevel ? "WORKSPACE" : "RESTRICTED";
    const workspaceLevel =
        inheritedLevel === "SHARE" || (direct === "WORKSPACE" && directLevel === "SHARE") ? "SHARE" : "VIEW";
    return { generalAccess, workspaceLevel };
}
