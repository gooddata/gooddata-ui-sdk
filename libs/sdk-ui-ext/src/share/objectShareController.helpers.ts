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

/** The stronger of two levels; undefined only when both are. */
export function maxLevel(
    a: ObjectSharePermissionLevel | undefined,
    b: ObjectSharePermissionLevel | undefined,
): ObjectSharePermissionLevel | undefined {
    if (a === undefined) {
        return b;
    }
    if (b === undefined) {
        return a;
    }
    return LEVEL_RANK[a] >= LEVEL_RANK[b] ? a : b;
}

/**
 * The inherited permission to surface as a warning, or undefined when the direct
 * grant already covers it. Set when the grantee *inherits* a level (via a group or
 * a parent workspace) that the direct grant does not reach — including the
 * inherited-only case (`direct` undefined), where the whole displayed level comes
 * from inheritance.
 */
export function effectivePermissionAbove(
    direct: ObjectSharePermissionLevel | undefined,
    inheritedLevel: ObjectSharePermissionLevel | undefined,
): ObjectSharePermissionLevel | undefined {
    if (!inheritedLevel) {
        return undefined;
    }
    return direct === undefined || LEVEL_RANK[inheritedLevel] > LEVEL_RANK[direct]
        ? inheritedLevel
        : undefined;
}

/**
 * The permission-derived fields of a grantee row, given the raw direct and
 * inherited permission sets.
 *
 * The displayed `level` is the EFFECTIVE one — the stronger of the direct grant and
 * anything inherited (from a group, or from a parent workspace in a hierarchy) —
 * so a grantee who only inherits EDIT reads as "Can edit & share" rather than
 * falling back to VIEW. `directLevel` keeps what THIS workspace grants (undefined
 * when the access is inherited-only): it is what writes re-grade and what decides
 * whether there is anything here to remove.
 */
function granteeAccess(permissions: readonly string[], inheritedPermissions: readonly string[]) {
    const direct = strongestLevel(permissions);
    const inheritedLevel = strongestLevel(inheritedPermissions);
    // A listed grantee with NEITHER set is a revoked-but-still-listed entry. VIEW is the
    // historical placeholder for its level, and it counts as the DIRECT one: leaving
    // `directLevel` undefined would classify the row as inherited-only, disabling Remove
    // and claiming inherited access that does not exist.
    const directLevel = direct ?? (inheritedLevel === undefined ? "VIEW" : undefined);
    return {
        level: maxLevel(directLevel, inheritedLevel) ?? "VIEW",
        directLevel,
        effectivePermission: effectivePermissionAbove(direct, inheritedLevel),
        inheritedLevel,
    };
}

/**
 * Whether picking `level` for this grantee would change the level they EFFECTIVELY hold.
 *
 * The permission menu shows the effective level, so a pick is only meaningful if it moves
 * that: under an inherited EDIT, picking SHARE or VIEW cannot lower anything, it would just
 * rewrite the grant made here where nobody can see it. Conversely a direct EDIT under an
 * inherited SHARE CAN be lowered to VIEW, because the effective level then drops to SHARE.
 *
 * The single source of this rule. Everything that reacts to a pick must agree: the
 * controller refuses a pick that changes nothing, so any confirm staged for one would ask
 * the user to approve a change that then silently does not happen.
 *
 * @internal
 */
export function changesEffectiveLevel(
    grantee: Pick<IObjectShareGrantee, "level" | "inheritedLevel">,
    level: ObjectSharePermissionLevel,
): boolean {
    return maxLevel(level, grantee.inheritedLevel) !== grantee.level;
}

/**
 * Union of two disabled-level sets, or undefined when both are empty — the shape the
 * permission menus take (undefined means "nothing disabled").
 *
 * @internal
 */
export function mergeDisabledLevels(
    a: ObjectSharePermissionLevel[] | undefined,
    b: ObjectSharePermissionLevel[] | undefined,
): ObjectSharePermissionLevel[] | undefined {
    const merged = [...new Set([...(a ?? []), ...(b ?? [])])];
    return merged.length > 0 ? merged : undefined;
}

/**
 * Whether revoking this grantee's direct grant would change the level they EFFECTIVELY
 * hold. False when inheritance alone already covers the displayed level: the revoke still
 * removes the local grant, but restricts nothing the grantee can do — so no
 * "Restrict your access?" confirm may be staged for it ({@link changesEffectiveLevel}'s
 * rule, applied to removal).
 *
 * @internal
 */
export function removalChangesEffectiveLevel(
    grantee: Pick<IObjectShareGrantee, "level" | "inheritedLevel">,
): boolean {
    return grantee.inheritedLevel !== grantee.level;
}

/**
 * The row fields to apply when THIS workspace's direct grant moves to `direct`:
 * the displayed level recomposes against whatever is inherited, so a re-grade below
 * an inherited level cannot make the row understate the grantee's real access.
 *
 * @internal
 */
export function withDirectLevel(
    grantee: IObjectShareGrantee,
    direct: ObjectSharePermissionLevel,
): IObjectShareGrantee {
    return {
        ...grantee,
        level: maxLevel(direct, grantee.inheritedLevel) ?? direct,
        directLevel: direct,
        effectivePermission: effectivePermissionAbove(direct, grantee.inheritedLevel),
    };
}

/**
 * The row a grantee falls back to once their direct grant is revoked but inherited
 * access remains — the row survives the removal as inherited-only rather than
 * disappearing and reappearing on the next load.
 *
 * @internal
 */
export function withoutDirectGrant(
    grantee: IObjectShareGrantee,
    inheritedLevel: ObjectSharePermissionLevel,
): IObjectShareGrantee {
    return {
        ...grantee,
        level: inheritedLevel,
        directLevel: undefined,
        effectivePermission: inheritedLevel,
        pending: undefined,
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
    | { kind: "removed"; pending: boolean; settled?: GranteeEdit }
    /**
     * Pending marker only — the row renders exactly as it stands. For a write that
     * locks the row without changing its access (a label-scope edit), so nothing has
     * to invent a level: reusing the `level` overlay would record the DISPLAYED level
     * as the direct grant, and that level is the effective one.
     */
    | { kind: "locked"; pending: boolean; settled?: GranteeEdit };

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
            return withDirectLevel(g, settled.level);
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
            // in flight.
            const committed = edit.pending ? committedRow(g, edit.settled) : undefined;
            if (committed) {
                return { ...committed, pending: "removing" };
            }
            // A settled removal revokes only what THIS workspace granted. When the
            // grantee still inherits access (a group, a parent workspace), the row
            // survives as inherited-only — dropping it would claim the removal took
            // away access it cannot reach. With nothing inherited the row is gone and
            // the entry persists to keep the base row hidden.
            return g?.inheritedLevel ? withoutDirectGrant(g, g.inheritedLevel) : undefined;
        }
        if (edit.kind === "locked") {
            // Access unchanged: render whatever the row had COMMITTED and add the saving
            // marker. Rendering the fetched row instead would undo the committed state
            // for the duration of the write — a removal survivor would reappear with the
            // direct grant it just lost.
            const committed = edit.settled ? renderEntry(g, { ...edit.settled, pending: false }) : g;
            return committed ? { ...committed, pending: edit.pending ? "saving" : undefined } : undefined;
        }
        if (edit.kind === "level") {
            return g
                ? { ...withDirectLevel(g, edit.level), pending: edit.pending ? "saving" : undefined }
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
 *
 * `level` is the permission a label GRANT carries, so a label mirrors the level
 * held on the object rather than always landing on VIEW. Defaults to VIEW when
 * omitted; irrelevant for revokes, which write an empty permission set.
 */
export type LabelScopePrincipal = (
    | { kind: "user" | "group"; granteeRef: ObjRef }
    | { allWorkspaceUsers: true }
) & { level?: ObjectSharePermissionLevel };

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
        writes.push({
            ref: label.ref,
            grantee: granularGranteeFor(principal, wanted ? (principal.level ?? "VIEW") : "none"),
        });
    }
    return writes;
}

/**
 * Pure: the per-label writes that re-grade `principal`'s EXISTING label scope to
 * `principal.level`. Unlike {@link buildLabelMutations} this is not a set diff —
 * the scope is unchanged and every in-scope label is rewritten — so it is what a
 * permission-level change on the object needs to keep its labels in step. `labels` is
 * the permissionable set, so every write targets a label that can take a grant.
 *
 * The primary label is deliberately EXCLUDED. Its access is implicit — {@link
 * buildLabelMutations} never grants or revokes it — so a grant written here would be
 * one nothing can take away: a later removal diffs the primary as unchanged and leaves
 * the grantee holding the primary label after their object access is gone.
 */
export function buildLabelRegrades(
    principals: LabelScopePrincipal[],
    scopeLabelIds: ReadonlySet<string>,
    labels: IObjectShareLabel[],
): Array<{ id: string; ref: ObjRef; grantees: IGranularAccessGrantee[] }> {
    const writes: Array<{ id: string; ref: ObjRef; grantees: IGranularAccessGrantee[] }> = [];
    for (const label of labels) {
        if (label.isPrimary || !scopeLabelIds.has(label.id)) {
            continue;
        }
        writes.push({
            id: label.id,
            ref: label.ref,
            grantees: principals.map((p) => granularGranteeFor(p, p.level ?? "VIEW")),
        });
    }
    return writes;
}

/**
 * One principal's label-scope move. Held per principal because grantees added in
 * a single step each pick their own scope, so one desired set can't stand for the
 * whole batch.
 *
 * @internal
 */
export interface ILabelScopeChange {
    principal: LabelScopePrincipal;
    desiredLabelIds: ReadonlySet<string>;
    currentLabelIds: ReadonlySet<string>;
}

/**
 * Multi-principal variant of {@link buildLabelMutations}, each principal moving its
 * own scope: groups the per-label writes so each label is one write carrying every
 * principal that changes on it. Keys on `label.id`, not the raw `ObjRef` — a Map
 * keyed on ObjRef would key on object identity and fail to merge
 * equal-but-distinct refs.
 */
export function buildLabelMutationsForScopes(
    changes: readonly ILabelScopeChange[],
    labels: IObjectShareLabel[],
): Array<{ id: string; ref: ObjRef; grantees: IGranularAccessGrantee[] }> {
    const byLabel = new Map<string, { id: string; ref: ObjRef; grantees: IGranularAccessGrantee[] }>();
    for (const label of labels) {
        for (const change of changes) {
            const writes = buildLabelMutations(
                change.principal,
                change.desiredLabelIds,
                change.currentLabelIds,
                [label],
            );
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
 * Where `granteeId`'s access to this object comes from, or `undefined` when they hold it
 * at all. The two flags are INDEPENDENT: a grantee can hold a grant made here *and*
 * inherit one from a group or a parent workspace, and both facts matter — `direct` says
 * there is something here to revoke, `inherited` says access survives revoking it.
 * Collapsing them to a single winner is what made a dual-granted label read as
 * inaccessible once its local grant was revoked.
 *
 * Inspects the raw grants rather than `granteesFromAccessList`, which normalizes every
 * listed user/group to a VIEW level even when it carries no permissions — so a
 * revoked-but-still-listed entry would otherwise read as granted, mis-scoping a per-label
 * checkbox to a label the grantee can't actually access.
 */
export function granteeGrantIn(
    list: IObjectAccessList,
    id: string,
): { direct: boolean; inherited: boolean } | undefined {
    const sourceOf = (permissions: readonly string[], inherited: readonly string[]) =>
        permissions.length > 0 || inherited.length > 0
            ? { direct: permissions.length > 0, inherited: inherited.length > 0 }
            : undefined;
    for (const g of list.grants) {
        if (isGranularUserAccess(g) && id === granteeId("user", g.user.ref)) {
            return sourceOf(g.permissions, g.inheritedPermissions);
        }
        if (isGranularUserGroupAccess(g) && id === granteeId("group", g.userGroup.ref)) {
            return sourceOf(g.permissions, g.inheritedPermissions);
        }
    }
    return undefined;
}
