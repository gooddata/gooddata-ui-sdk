// (C) 2026 GoodData Corporation

import type {
    AccessGranteeDetail,
    IGranularRulesAccess,
    IObjectAccessList,
    ObjRef,
} from "@gooddata/sdk-model";
import type { GeneralAccessValue } from "@gooddata/sdk-ui-kit";

import {
    directLevel,
    granteeId,
    granteesFromAccessList,
    strongestLevel,
} from "./objectShareController.helpers.js";
import type { IObjectShareDraft, ObjectSharePermissionLevel } from "./objectShareController.types.js";
import type { IObjectAccessSummary } from "./types.js";

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
 * Workspace-wide permission level of this workspace's own rule grant — the
 * strongest level any rule entry directly permits, defaulting to VIEW.
 */
export function deriveWorkspacePermissionLevel(grants: AccessGranteeDetail[]): ObjectSharePermissionLevel {
    return directLevel(findAllWorkspaceUsersGrants(grants).flatMap((rule) => rule.permissions));
}

/**
 * Strongest workspace-wide level inherited from parent workspaces, or undefined
 * when none is inherited. Inherited rule access grants every user of this
 * workspace access too (workspace membership cascades down the hierarchy), yet
 * cannot be revoked from here — consumers must surface it as workspace access
 * and disable the Restricted option.
 */
export function deriveInheritedWorkspaceLevel(
    grants: AccessGranteeDetail[],
): ObjectSharePermissionLevel | undefined {
    return strongestLevel(findAllWorkspaceUsersGrants(grants).flatMap((rule) => rule.inheritedPermissions));
}

/**
 * The effective (displayed) workspace access: the direct state composed with
 * inherited rule access. Inherited access makes general access WORKSPACE even
 * when this workspace holds no rule of its own, and the level is the strongest
 * of the two.
 */
export function composeEffectiveWorkspaceAccess(
    direct: GeneralAccessValue,
    directLevelValue: ObjectSharePermissionLevel,
    inheritedLevel: ObjectSharePermissionLevel | undefined,
): { generalAccess: GeneralAccessValue; workspaceLevel: ObjectSharePermissionLevel } {
    const generalAccess = direct === "WORKSPACE" || inheritedLevel ? "WORKSPACE" : "RESTRICTED";
    const workspaceLevel = directLevel([
        ...(direct === "WORKSPACE" ? [directLevelValue] : []),
        ...(inheritedLevel ? [inheritedLevel] : []),
    ]);
    return { generalAccess, workspaceLevel };
}

/**
 * The access summary of a fetched access list — effective workspace access plus the
 * explicit grantee count. The single derivation shared by an inline access row (a
 * consumer's own page-level fetch) and {@link ObjectShareDialog}'s `onSummaryChange`,
 * so the two can never disagree on what a list means.
 *
 * @internal
 */
export function accessListToSummary(list: IObjectAccessList, self?: ObjRef): IObjectAccessSummary {
    const inheritedLevel = deriveInheritedWorkspaceLevel(list.grants);
    const grantees = granteesFromAccessList(list);
    const selfId = self ? granteeId("user", self) : undefined;
    return {
        ...composeEffectiveWorkspaceAccess(
            deriveGeneralAccess(list.grants),
            deriveWorkspacePermissionLevel(list.grants),
            inheritedLevel,
        ),
        granteeCount: grantees.length,
        selfIsGrantee: selfId !== undefined && grantees.some((g) => g.id === selfId),
    };
}

/**
 * How an object's access reads: nobody, named grantees, or the whole workspace.
 *
 * @internal
 */
export type ObjectShareLevel = "PRIVATE" | "SHARED" | "WORKSPACE";

/**
 * The access level to display for a summary.
 *
 * @remarks
 * The caller's own grant does not count: the creator is granted access when the object is
 * made, so counting it would read an object only they can see as SHARED. The summary must
 * therefore come from `accessListToSummary` WITH a caller ref, or a sole own grant reads
 * SHARED.
 *
 * @internal
 */
export function summaryToShareLevel(summary: IObjectAccessSummary): ObjectShareLevel {
    if (summary.generalAccess === "WORKSPACE") {
        return "WORKSPACE";
    }
    const others = summary.granteeCount - (summary.selfIsGrantee ? 1 : 0);
    return others > 0 ? "SHARED" : "PRIVATE";
}

/**
 * The same summary for a draft, so it reads like a fetched list. Untouched general access
 * falls back to `initialGeneralAccess`.
 *
 * @internal
 */
export function draftToSummary(
    draft: IObjectShareDraft,
    initialGeneralAccess: GeneralAccessValue,
): IObjectAccessSummary {
    const { ruleEdit } = draft;
    const generalAccess = ruleEdit?.generalAccess ?? initialGeneralAccess;
    const granteeCount = Object.values(draft.granteeEdits).filter((edit) => edit.kind === "added").length;
    return {
        generalAccess,
        workspaceLevel: ruleEdit?.level ?? "VIEW",
        granteeCount,
        // The caller's own grant is made on save, so no draft edit can hold it.
        selfIsGrantee: false,
    };
}
