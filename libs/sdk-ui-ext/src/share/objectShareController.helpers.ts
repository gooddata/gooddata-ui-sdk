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

import type { IObjectShareGrantee, ObjectSharePermissionLevel } from "./objectShareController.types.js";
import type { IObjectShareLabel } from "./types.js";

/** Stable row id shared by grantee rows and picker options: `user:<ref>` / `group:<ref>`. */
export function granteeId(kind: "user" | "group", ref: ObjRef): string {
    return `${kind}:${objRefToString(ref)}`;
}

/** Case-insensitive match of an assignee against the picker query (name, or email for users). */
export function assigneeMatchesQuery(assignee: IAvailableAccessGrantee, query: string): boolean {
    if (!query) {
        return true;
    }
    const email = assignee.type === "user" ? (assignee.email ?? "") : "";
    return `${assignee.name} ${email}`.toLowerCase().includes(query);
}

/** The row's directly-granted level. SHARE outranks VIEW. */
export function directLevel(permissions: readonly string[]): ObjectSharePermissionLevel {
    return permissions.includes("SHARE") ? "SHARE" : "VIEW";
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
    return direct !== "SHARE" && inheritedPermissions.includes("SHARE") ? "SHARE" : undefined;
}

export function granteesFromAccessList(list: IObjectAccessList | undefined): IObjectShareGrantee[] {
    if (!list) {
        return [];
    }
    const out: IObjectShareGrantee[] = [];
    for (const g of list.grants) {
        if (isGranularUserAccess(g)) {
            const level = directLevel(g.permissions);
            out.push({
                id: granteeId("user", g.user.ref),
                kind: "user",
                granteeRef: g.user.ref,
                name: g.user.fullName ?? g.user.email ?? g.user.login,
                email: g.user.email,
                level,
                effectivePermission: effectivePermissionAbove(level, g.inheritedPermissions),
            });
        } else if (isGranularUserGroupAccess(g)) {
            const level = directLevel(g.permissions);
            out.push({
                id: granteeId("group", g.userGroup.ref),
                kind: "group",
                granteeRef: g.userGroup.ref,
                name: g.userGroup.name ?? objRefToString(g.userGroup.ref),
                level,
                effectivePermission: effectivePermissionAbove(level, g.inheritedPermissions),
            });
        }
    }
    return out;
}

/**
 * Optimistic overlay entry for a single grantee id. `"set"` carries the intended
 * row (a fresh add or a level change); `"remove"` marks a removal. `pending` is
 * true while the backend write is in flight.
 */
export type IGranteeOverlayEntry =
    | { op: "set"; grantee: IObjectShareGrantee; pending: boolean }
    | { op: "remove"; pending: boolean };

/**
 * Merge the committed rows with the optimistic overlay: `set` replaces/inserts a
 * row (annotated pending), `remove` drops it. Entries with no committed effect
 * still apply so the UI reflects the user's intent during read-after-write lag.
 */
export function mergeOverlay(
    committed: IObjectShareGrantee[],
    overlay: Record<string, IGranteeOverlayEntry>,
): IObjectShareGrantee[] {
    const byId = new Map(committed.map((g) => [g.id, g]));
    for (const [id, entry] of Object.entries(overlay)) {
        if (entry.op === "remove") {
            byId.delete(id);
        } else {
            byId.set(id, { ...entry.grantee, pending: entry.pending ? "saving" : undefined });
        }
    }
    return [...byId.values()];
}

/**
 * Drop overlay entries the freshly-fetched list now confirms: a `set` whose
 * committed level matches the intended level, or a `remove` whose grantee is
 * gone. Unconfirmed entries are kept (server still lagging) but lose `pending`
 * so the row shows the intended value without a spinner.
 */
export function reconcileOverlay(
    committed: IObjectShareGrantee[],
    overlay: Record<string, IGranteeOverlayEntry>,
): Record<string, IGranteeOverlayEntry> {
    const byId = new Map(committed.map((g) => [g.id, g]));
    const next: Record<string, IGranteeOverlayEntry> = {};
    for (const [id, entry] of Object.entries(overlay)) {
        if (entry.op === "remove") {
            if (byId.has(id)) {
                next[id] = { op: "remove", pending: false };
            }
        } else if (byId.get(id)?.level !== entry.grantee.level) {
            next[id] = { op: "set", grantee: entry.grantee, pending: false };
        }
    }
    return next;
}

export function toGranularGrantee(
    kind: "user" | "group",
    granteeRef: ObjRef,
    level: ObjectSharePermissionLevel | "none",
): IGranularAccessGrantee {
    const permissions: ObjectSharePermissionLevel[] =
        level === "none" ? [] : level === "SHARE" ? ["SHARE", "VIEW"] : ["VIEW"];
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
        const permissions: ObjectSharePermissionLevel[] = level === "none" ? [] : ["VIEW"];
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
