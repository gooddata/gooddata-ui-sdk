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
import type { GeneralAccessValue } from "@gooddata/sdk-ui-kit";

import type {
    IGranteeIdentityFacts,
    IObjectShareGrantee,
    ISelfIdentity,
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

/** Display pair, falling back: name + email → name + userID → email + userID → userID. */
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

/**
 * Deterministic display order for grantee rows — the backend returns them
 * unsorted (and in an order that shuffles across reloads). Own row first, then
 * groups, then users; within each, case-insensitive by display name with the
 * grantee id as a stable tiebreaker so equal names don't reshuffle. Returns a
 * new array; the input is not mutated.
 */
export function sortGrantees(grantees: readonly IObjectShareGrantee[]): IObjectShareGrantee[] {
    const rank = (g: IObjectShareGrantee) => (g.isSelf ? 0 : g.kind === "group" ? 1 : 2);
    return grantees.slice().sort((a, b) => {
        const byRank = rank(a) - rank(b);
        if (byRank !== 0) {
            return byRank;
        }
        const byName = granteeDisplayPair(a).name.localeCompare(granteeDisplayPair(b).name, undefined, {
            sensitivity: "base",
        });
        return byName === 0 ? a.id.localeCompare(b.id) : byName;
    });
}

/**
 * Deterministic display order for an attribute's labels — the backend returns
 * display forms in an order that isn't guaranteed stable. Primary (key) label
 * first, then the rest case-insensitive by title with the label id as a stable
 * tiebreaker. Shared by the detail-page labels popup and the share dialog's
 * label-access checklist so the two never disagree. Returns a new array; the
 * input is not mutated.
 *
 * @internal
 */
export function sortShareableLabels(labels: readonly IObjectShareLabel[]): IObjectShareLabel[] {
    return labels.slice().sort((a, b) => {
        if (a.isPrimary !== b.isPrimary) {
            return a.isPrimary ? -1 : 1;
        }
        const byTitle = a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
        return byTitle === 0 ? a.id.localeCompare(b.id) : byTitle;
    });
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

const LEVEL_RANK: Record<ObjectSharePermissionLevel, number> = { VIEW: 0, SHARE: 1, EDIT: 2 };

/** The strongest permission level present, or undefined when none. */
export function strongestLevel(permissions: readonly string[]): ObjectSharePermissionLevel | undefined {
    return LEVELS_STRONGEST_FIRST.find((level) => permissions.includes(level));
}

/** The row's directly-granted level — the strongest permission present, defaulting to VIEW. */
export function directLevel(permissions: readonly string[]): ObjectSharePermissionLevel {
    return strongestLevel(permissions) ?? "VIEW";
}

/**
 * Levels strictly above the given one, e.g. for disabling levels the caller can't
 * grant. An undefined bound means "unknown" — nothing is above it, so no level is
 * disabled.
 */
export function levelsAbove(level: ObjectSharePermissionLevel | undefined): ObjectSharePermissionLevel[] {
    return level === undefined ? [] : LEVELS_STRONGEST_FIRST.filter((l) => LEVEL_RANK[l] > LEVEL_RANK[level]);
}

/** Levels strictly below the given one, e.g. for disabling levels an inherited grant already exceeds. */
export function levelsBelow(level: ObjectSharePermissionLevel): ObjectSharePermissionLevel[] {
    return LEVELS_STRONGEST_FIRST.filter((l) => LEVEL_RANK[l] < LEVEL_RANK[level]);
}

/**
 * The effective permission to surface as a warning, or undefined when the direct
 * grant already covers it. Set only when the grantee *inherits* a level (e.g. via
 * a group) above the directly-granted one — i.e. the effective access is higher
 * than what the row's permission control shows.
 */
export function effectivePermissionAbove(
    direct: ObjectSharePermissionLevel,
    inheritedLevel: ObjectSharePermissionLevel | undefined,
): ObjectSharePermissionLevel | undefined {
    return inheritedLevel && LEVEL_RANK[inheritedLevel] > LEVEL_RANK[direct] ? inheritedLevel : undefined;
}

/** The permission-derived fields shared by every grantee row, regardless of kind. */
function granteeAccess(permissions: readonly string[], inheritedPermissions: readonly string[]) {
    const level = directLevel(permissions);
    const inheritedLevel = strongestLevel(inheritedPermissions);
    return {
        level,
        effectivePermission: effectivePermissionAbove(level, inheritedLevel),
        inheritedLevel,
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

/**
 * A transient edit overlaid on a fetched grantee row (keyed by grantee id in
 * {@link mergeGrantees}). The pending-guard keeps at most one edit in flight per id.
 * A pending edit that superseded an already-COMMITTED entry (an added row, an
 * earlier level change) carries it as `settled`, because the fetched base no longer
 * holds that row's last-settled state: failure restores `settled`, success drops it.
 * With no `settled`, failure deletes the entry, reverting to the fetched row.
 *
 * @internal
 */
export type GranteeEdit =
    | { kind: "level"; level: ObjectSharePermissionLevel; pending: boolean; settled?: GranteeEdit }
    | { kind: "added"; grantee: IObjectShareGrantee; pending: boolean; settled?: GranteeEdit }
    | { kind: "removed"; pending: boolean; settled?: GranteeEdit };

/**
 * Transient edit of the all-workspace-users rule (general access + its level),
 * overlaid on the fetched rule state in the hook. Same lifecycle and `settled`
 * semantics as {@link GranteeEdit}, one edit in flight at a time.
 *
 * @internal
 */
export interface IRuleEdit {
    generalAccess: GeneralAccessValue;
    level: ObjectSharePermissionLevel;
    pending: boolean;
    /** The committed rule edit this pending one superseded; restored on failure. */
    settled?: IRuleEdit;
}

/**
 * Pure composition of the fetched base with the transient overlay — the hook's
 * `grantees` derive from this with no effect and no mirrored state. Marks the
 * caller's own row via `selfId`, backfilling its facts from `selfIdentity` (the
 * self row is absent from the grant list by design). Input arrays are not mutated.
 *
 * @internal
 */
export function mergeGrantees(
    base: readonly IObjectShareGrantee[],
    edits: Readonly<Record<string, GranteeEdit>>,
    selfId: string | undefined,
    selfIdentity: ISelfIdentity | undefined,
): IObjectShareGrantee[] {
    const markSelf = (g: IObjectShareGrantee): IObjectShareGrantee => {
        const isSelf = g.id === selfId;
        return isSelf && selfIdentity
            ? { ...g, isSelf, name: g.name ?? selfIdentity.name, email: g.email ?? selfIdentity.email }
            : { ...g, isSelf };
    };
    // The row an id last COMMITTED to: an added `settled` is that row outright (the
    // base may hold a stale pre-removal version of the same id), a level `settled`
    // overlays the base row, otherwise the base row itself (undefined for an
    // overlay-born id with no history).
    const committedRow = (
        g: IObjectShareGrantee | undefined,
        settled: GranteeEdit | undefined,
    ): IObjectShareGrantee | undefined => {
        if (settled?.kind === "added") {
            return settled.grantee;
        }
        if (g && settled?.kind === "level") {
            return {
                ...g,
                level: settled.level,
                effectivePermission: effectivePermissionAbove(settled.level, g.inheritedLevel),
            };
        }
        return g;
    };
    // One renderer per id: for each id, exactly one of the branches below emits at
    // most one row — every base id resolves here, and the loop after handles only
    // ids born in the overlay. Growing this case-by-case instead bred duplicate-row
    // bugs whenever an edit history (re-add, re-remove) crossed the base boundary.
    const renderEntry = (
        g: IObjectShareGrantee | undefined,
        edit: GranteeEdit | undefined,
    ): IObjectShareGrantee | undefined => {
        if (!edit) {
            return g;
        }
        if (edit.kind === "removed") {
            // Visible (muted, at its last committed state) only while the revoke is
            // in flight; a settled removal renders nothing — its entry persists to
            // keep the base row hidden.
            const committed = edit.pending ? committedRow(g, edit.settled) : undefined;
            return committed ? { ...committed, pending: "removing" } : undefined;
        }
        if (edit.kind === "level") {
            return g
                ? {
                      ...g,
                      level: edit.level,
                      effectivePermission: effectivePermissionAbove(edit.level, g.inheritedLevel),
                      pending: edit.pending ? "saving" : undefined,
                  }
                : undefined;
        }
        return { ...edit.grantee, pending: edit.pending ? "saving" : undefined };
    };

    const out: IObjectShareGrantee[] = [];
    const baseIds = new Set(base.map((g) => g.id));
    for (const g of base) {
        const row = renderEntry(g, edits[g.id]);
        if (row) {
            out.push(markSelf(row));
        }
    }
    for (const [id, edit] of Object.entries(edits)) {
        if (baseIds.has(id)) {
            continue;
        }
        const row = renderEntry(undefined, edit);
        if (row) {
            out.push(markSelf(row));
        }
    }
    return out;
}

/** Permission set per level; a higher level always implies VIEW. */
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
