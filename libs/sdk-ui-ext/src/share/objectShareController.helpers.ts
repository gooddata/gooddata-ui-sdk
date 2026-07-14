// (C) 2026 GoodData Corporation

import {
    type IAvailableAccessGrantee,
    type IGranularAccessGrantee,
    type IObjectAccessList,
    type ObjRef,
    isGranularUserAccess,
    isGranularUserGroupAccess,
    objRefToString,
} from "@gooddata/sdk-model";

import type {
    IGranteeIdentityFacts,
    IObjectShareGrantee,
    ObjectSharePermissionLevel,
} from "./objectShareController.types.js";
import type { IObjectShareLabel } from "./types.js";

/** Stable row id shared by grantee rows and picker options: `user:<ref>` / `group:<ref>`. */
export function granteeId(kind: "user" | "group", ref: ObjRef): string {
    return `${kind}:${objRefToString(ref)}`;
}

/**
 * Real identity facts recovered from converter output that collapses missing
 * fields (`name ?? email ?? id`; grant emails also `email ?? id` — assignee
 * emails stay raw): a field equal to the raw id is absent, a "name" equal to
 * the email is the email fallback.
 */
export function userIdentityFacts(
    ref: ObjRef,
    name: string | undefined,
    email: string | undefined,
): IGranteeIdentityFacts {
    const id = objRefToString(ref);
    const realEmail = email && email !== id ? email : undefined;
    const realName = name && name !== id && name !== realEmail ? name : undefined;
    return { name: realName, email: realEmail };
}

/** Real group name recovered from the converter's `name ?? id` collapse: a name equal to the raw id is absent. */
export function groupNameFact(ref: ObjRef, name: string | undefined): string | undefined {
    const id = objRefToString(ref);
    return name && name !== id ? name : undefined;
}

/** Identity facts for a listing/picker assignee — {@link userIdentityFacts} for users, a name fact for groups. */
export function assigneeIdentityFacts(assignee: IAvailableAccessGrantee): IGranteeIdentityFacts {
    return assignee.type === "user"
        ? userIdentityFacts(assignee.ref, assignee.name, assignee.email)
        : { name: groupNameFact(assignee.ref, assignee.name) };
}

/** Display pair per the spec's fallback order: name + email → name + userID → email + userID → userID. */
export function userDisplayPair(
    facts: IGranteeIdentityFacts,
    userId: string,
): { name: string; email?: string } {
    if (facts.name) {
        return { name: facts.name, email: facts.email ?? userId };
    }
    if (facts.email) {
        return { name: facts.email, email: userId };
    }
    return { name: userId };
}

/** Row display pair — {@link userDisplayPair} for users; groups show name (or raw id), no subline. */
export function granteeDisplayPair(grantee: IObjectShareGrantee): { name: string; email?: string } {
    const id = objRefToString(grantee.granteeRef);
    if (grantee.kind !== "user") {
        return { name: grantee.name ?? id };
    }
    return userDisplayPair(grantee, id);
}

/** Case-insensitive match of an assignee against the picker query (name, or email for users). */
export function assigneeMatchesQuery(assignee: IAvailableAccessGrantee, query: string): boolean {
    if (!query) {
        return true;
    }
    const email = assignee.type === "user" ? (assignee.email ?? "") : "";
    return `${assignee.name} ${email}`.toLowerCase().includes(query);
}

/** Permission levels from strongest to weakest; the row shows the strongest it holds. */
const LEVELS_STRONGEST_FIRST = ["EDIT", "SHARE", "VIEW"] as const satisfies ObjectSharePermissionLevel[];

/** The row's directly-granted level — the strongest permission present, defaulting to VIEW. */
export function directLevel(permissions: readonly string[]): ObjectSharePermissionLevel {
    return LEVELS_STRONGEST_FIRST.find((level) => permissions.includes(level)) ?? "VIEW";
}

/**
 * The effective permission to surface as a warning, or undefined when the direct
 * grant already covers it. Set only when the grantee *inherits* SHARE (e.g. via a
 * group) but is directly granted just VIEW — i.e. the effective access is higher
 * than what the row's permission control shows.
 */
export function effectivePermissionAbove(
    direct: ObjectSharePermissionLevel,
    inheritedPermissions: readonly string[],
): ObjectSharePermissionLevel | undefined {
    // A direct EDIT already outranks any inherited SHARE — never warn in that case.
    return direct === "VIEW" && inheritedPermissions.includes("SHARE") ? "SHARE" : undefined;
}

/** The permission-derived fields shared by every grantee row, regardless of kind. */
function granteeAccess(permissions: readonly string[], inheritedPermissions: readonly string[]) {
    const level = directLevel(permissions);
    return {
        level,
        effectivePermission: effectivePermissionAbove(level, inheritedPermissions),
        inheritsShare: inheritedPermissions.includes("SHARE"),
    };
}

export function granteesFromAccessList(list: IObjectAccessList | undefined): IObjectShareGrantee[] {
    if (!list) {
        return [];
    }
    const out: IObjectShareGrantee[] = [];
    for (const g of list.grants) {
        if (isGranularUserAccess(g)) {
            out.push({
                id: granteeId("user", g.user.ref),
                kind: "user",
                granteeRef: g.user.ref,
                ...userIdentityFacts(g.user.ref, g.user.fullName, g.user.email),
                ...granteeAccess(g.permissions, g.inheritedPermissions),
            });
        } else if (isGranularUserGroupAccess(g)) {
            out.push({
                id: granteeId("group", g.userGroup.ref),
                kind: "group",
                granteeRef: g.userGroup.ref,
                name: groupNameFact(g.userGroup.ref, g.userGroup.name),
                ...granteeAccess(g.permissions, g.inheritedPermissions),
            });
        }
    }
    return out;
}

/** The permission set a grant carries at each level; a higher level always implies VIEW. */
const PERMISSIONS_BY_LEVEL = {
    none: [],
    VIEW: ["VIEW"],
    SHARE: ["SHARE", "VIEW"],
    EDIT: ["EDIT", "VIEW"],
} satisfies Record<ObjectSharePermissionLevel | "none", ObjectSharePermissionLevel[]>;

export function toGranularGrantee(
    kind: "user" | "group",
    granteeRef: ObjRef,
    level: ObjectSharePermissionLevel | "none",
): IGranularAccessGrantee {
    const permissions = PERMISSIONS_BY_LEVEL[level];
    return kind === "user"
        ? { type: "granularUser", granteeRef, permissions, inheritedPermissions: [] }
        : { type: "granularGroup", granteeRef, permissions, inheritedPermissions: [] };
}

/**
 * The principal a label-scope reconcile applies to: a named user/group, or the
 * implicit all-workspace-users rule (general access).
 */
export type LabelScopePrincipal =
    | { kind: "user" | "group"; granteeRef: ObjRef }
    | { allWorkspaceUsers: true };

export function granularGranteeFor(
    principal: LabelScopePrincipal,
    level: ObjectSharePermissionLevel | "none",
) {
    if ("allWorkspaceUsers" in principal) {
        const permissions = PERMISSIONS_BY_LEVEL[level];
        return { type: "allWorkspaceUsers", permissions, inheritedPermissions: [] } as IGranularAccessGrantee;
    }
    return toGranularGrantee(principal.kind, principal.granteeRef, level);
}

/**
 * Pure diff: the per-label writes needed to move `principal`'s label scope from
 * `current` to `desired`. The primary label is always kept in scope (never
 * revoked). `labels` is the permissionable set (404 forms already excluded), so
 * every returned write targets a label that can actually take a grant. No I/O —
 * the single source of truth for what add / remove / general-access / the labels
 * picker each write, so they can't drift apart.
 */
export function buildLabelMutations(
    principal: LabelScopePrincipal,
    desiredLabelIds: ReadonlySet<string>,
    currentLabelIds: ReadonlySet<string>,
    labels: IObjectShareLabel[],
): Array<{ ref: ObjRef; grantee: IGranularAccessGrantee }> {
    const writes: Array<{ ref: ObjRef; grantee: IGranularAccessGrantee }> = [];
    for (const label of labels) {
        const wanted = label.isPrimary || desiredLabelIds.has(label.id);
        const had = label.isPrimary || currentLabelIds.has(label.id);
        if (wanted === had) {
            continue;
        }
        writes.push({ ref: label.ref, grantee: granularGranteeFor(principal, wanted ? "VIEW" : "none") });
    }
    return writes;
}

/**
 * Multi-principal variant of {@link buildLabelMutations}: groups the per-label
 * writes so each label is one write carrying every principal that changes on it.
 * Keys on `label.id`, not the raw `ObjRef` — a Map keyed on ObjRef would key on
 * object identity and fail to merge equal-but-distinct refs.
 */
export function buildLabelMutationsForPrincipals(
    principals: LabelScopePrincipal[],
    desiredLabelIds: ReadonlySet<string>,
    currentLabelIds: ReadonlySet<string>,
    labels: IObjectShareLabel[],
): Array<{ id: string; ref: ObjRef; grantees: IGranularAccessGrantee[] }> {
    const byLabel = new Map<string, { id: string; ref: ObjRef; grantees: IGranularAccessGrantee[] }>();
    for (const label of labels) {
        for (const principal of principals) {
            const writes = buildLabelMutations(principal, desiredLabelIds, currentLabelIds, [label]);
            if (writes.length === 0) {
                continue;
            }
            const entry = byLabel.get(label.id) ?? { id: label.id, ref: label.ref, grantees: [] };
            entry.grantees.push(writes[0]!.grantee);
            byLabel.set(label.id, entry);
        }
    }
    return Array.from(byLabel.values());
}

/** Stable empty-labels default so the hook's default arg doesn't churn identities. */
export const NO_LABELS: IObjectShareLabel[] = [];

/** Shared empty id-set for "no labels in scope" diffs. */
export const EMPTY_IDS: ReadonlySet<string> = new Set<string>();

/**
 * Whether a fetched grant for `granteeId` exists with a non-empty permission set.
 * Inspects the raw grants rather than `granteesFromAccessList`, which normalizes
 * every listed user/group to a VIEW level even when its `permissions` are empty —
 * so a revoked-but-still-listed entry would otherwise read as granted, mis-scoping
 * a per-label checkbox to a label the grantee can't actually access.
 */
export function isGranteeGrantedIn(list: IObjectAccessList, id: string): boolean {
    return list.grants.some((g) => {
        if (isGranularUserAccess(g)) {
            return id === granteeId("user", g.user.ref) && g.permissions.length > 0;
        }
        if (isGranularUserGroupAccess(g)) {
            return id === granteeId("group", g.userGroup.ref) && g.permissions.length > 0;
        }
        return false;
    });
}
