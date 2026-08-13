// (C) 2026 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import type { IObjectPermissionsObject } from "@gooddata/sdk-backend-spi";
import {
    type IGranularAccessGrantee,
    type IUser,
    idRef,
    objRefToString,
    serializeObjRef,
} from "@gooddata/sdk-model";
import {
    type GoodDataSdkError,
    convertError,
    useBackendStrict,
    useCancelablePromise,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";
import { type GeneralAccessValue, type IUiGranteeAsyncOptions, useToastMessage } from "@gooddata/sdk-ui-kit";

import {
    composeEffectiveWorkspaceAccess,
    deriveGeneralAccess,
    deriveInheritedWorkspaceLevel,
    deriveWorkspacePermissionLevel,
} from "./accessSummary.js";
import { objectShareMessages } from "./messages.js";
import {
    type GranteeEdit,
    type IRuleEdit,
    assigneeIdentityFacts,
    assigneeMatchesQuery,
    granteeId,
    granteesFromAccessList,
    mergeGrantees,
    userDisplayPair,
    userIdentityFacts,
    withDirectLevel,
} from "./objectShareController.helpers.js";
import type {
    IObjectShareControllerState,
    IObjectShareGrantee,
    ISelfIdentity,
    ObjectSharePermissionLevel,
} from "./objectShareController.types.js";
import type { IObjectAccessSummary } from "./types.js";

/**
 * The owned access list for {@link useObjectShareController}.
 *
 * @internal
 */
export interface IAccessList {
    /** True once the target's list has been fetched. */
    hasList: boolean;
    /** Display rows: the fetched list composed with the local edit overlay. */
    grantees: IObjectShareGrantee[];
    /**
     * Whether the fetched list held no grant for the SIGNED-IN user — they reached
     * this manage-gated list without a grant of their own (grant-independent access:
     * admin/manager rights, or a workspace rule reported separately). Derived from
     * the immutable seed, never the live overlay: a caller whose own grant was the
     * way in must not read as grant-independent after locally removing it.
     */
    seededWithoutSelfGrant: boolean;
    /** Signed-in user's identity facts + login id, once the profile resolves. */
    selfIdentity: ISelfIdentity | undefined;
    /**
     * Whether the profile resolved. Until then a sole grantee row can't be told apart
     * from the caller's own grant, so its `isSelf` is only an unresolved default.
     */
    selfIdentityResolved: boolean;
    /** Direct general access (excludes inherited rule access). */
    generalAccess: GeneralAccessValue;
    /** Workspace-rule permission level — the rule overlay if edited, else fetched. */
    workspaceLevel: ObjectSharePermissionLevel;
    /**
     * Strongest workspace level inherited from parent workspaces. Cannot be changed
     * from here, so effective general access is WORKSPACE whenever it's set.
     */
    workspaceInheritedLevel: ObjectSharePermissionLevel | undefined;
    /** True while a workspace-rule re-grade is committing (the rule overlay is pending). */
    workspaceLevelSaving: boolean;
    /** Access summary of the displayed state, or undefined before the first load. */
    summary: IObjectAccessSummary | undefined;
    /** Load status surfaced as the controller status. */
    status: IObjectShareControllerState["status"];
    /** Typed SDK error from the load, or undefined. */
    loadError: GoodDataSdkError | undefined;

    /** Write a grant change to the backend and toast. False on failure; no refetch. */
    commit: (mutate: IGranularAccessGrantee[], successMessage: { id: string }) => Promise<boolean>;
    /** Picker loader — available assignees filtered by query, excluding already-granted ones. */
    loadOptions: (search: string) => Promise<IUiGranteeAsyncOptions>;

    /**
     * Overlay a freshly picked grantee as a pending added row. Applied synchronously,
     * before the write. Re-adding a removed base row supersedes the committed removal
     * (carried as `settled`, restored if the add fails).
     */
    applyGranteeAdd: (grantee: IObjectShareGrantee) => void;
    /**
     * Overlay a pending level change. A row born in the overlay (added since the
     * fetch) stays an `added` entry with the new level — base doesn't hold it, so a
     * plain level entry would drop the row from the merged view.
     */
    applyGranteeLevel: (id: string, level: ObjectSharePermissionLevel) => void;
    /**
     * Lock a row for a write that leaves its access unchanged (a label-scope edit):
     * adds the pending marker only. Use this rather than re-applying the displayed
     * level, which would persist the EFFECTIVE level as the row's direct grant.
     */
    applyGranteeLock: (id: string) => void;
    /** Overlay a pending removal; the row renders muted until the write settles. */
    applyGranteeRemove: (id: string) => void;
    /** Commit the pending edit for `id` after a successful write. */
    settleGranteeEdit: (id: string) => void;
    /**
     * Revert the pending edit for `id` after a failed write: restore the committed
     * entry it superseded, or drop the entry (back to the fetched row) if none.
     */
    failGranteeEdit: (id: string) => void;

    /** Overlay the all-workspace-users rule edit (pending while a re-grade commits). */
    applyRuleEdit: (edit: Omit<IRuleEdit, "settled">) => void;
    /** Commit the pending rule edit after a successful write. */
    settleRuleEdit: () => void;
    /** Revert the rule edit after a failed write: the superseded committed edit, or the fetch. */
    failRuleEdit: () => void;
}

/**
 * Owns the backend access list for ONE dialog session: the hook is mounted while
 * the dialog is open, for a single target that must not change while mounted
 * (remount for a new target — see {@link ObjectShareDialog}). Unmounting discards
 * every transient: the edit overlay, the profile, in-flight finalizers.
 *
 * The flow is one-directional: the list is fetched once, and the displayed state
 * is *derived* from that fetch composed with a small local edit overlay
 * ({@link mergeGrantees}). There is no mirrored state and no post-write refetch —
 * a mutation writes its overlay entry (so the row updates immediately), commits to
 * the backend, then settles the entry on success or reverts it on failure — to the
 * committed entry it superseded (kept as `settled` on the pending edit), or to the
 * fetched row when there was none. The grantee list therefore never blanks and
 * never fights read-after-write lag.
 *
 * @internal
 */
export function useAccessList(target: IObjectPermissionsObject | undefined): IAccessList {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const toast = useToastMessage();

    // The only local state: the transient edit overlay. Everything else is derived.
    const [granteeEdits, setGranteeEdits] = useState<Record<string, GranteeEdit>>({});
    const [ruleEdit, setRuleEditState] = useState<IRuleEdit | undefined>(undefined);

    // Serialized so an inline idRef(...) — a new object each render — doesn't refetch forever.
    const fetchKey = target ? `${workspace}:${target.kind}:${serializeObjRef(target.ref)}` : undefined;

    const {
        result: fetchedList,
        status: fetchStatus,
        error: fetchError,
    } = useCancelablePromise(
        {
            promise: target
                ? () => backend.workspace(workspace).objectPermissions().getAccessList(target)
                : undefined,
        },
        // fetchKey already encodes workspace, kind and ref.
        [backend, fetchKey],
    );

    const hasList = fetchStatus === "success" && !!fetchedList;

    const base = useMemo<IObjectShareGrantee[]>(
        () => (hasList ? granteesFromAccessList(fetchedList) : []),
        [hasList, fetchedList],
    );

    // The profile identifies the caller's own row (self-managed classification, the
    // admin empty-state row). The session exists only while the dialog is open, so
    // fetch it once per session; the client caches it across sessions.
    const { result: currentUser, status: currentUserStatus } = useCancelablePromise<IUser>(
        {
            promise: () => backend.currentUser().getUser(),
            onError: () => {},
        },
        [backend],
    );
    // Success only: while pending or after a swallowed failure a sole row can't be told
    // apart from the caller's own grant, so it must not be treated as safe to mutate.
    const selfIdentityResolved = currentUserStatus === "success";

    const selfId = currentUser ? granteeId("user", idRef(currentUser.login)) : undefined;

    // Derived from the immutable SEED (see the interface doc): a caller whose own
    // grant was the way in must not read as grant-independent after removing it.
    const seededWithoutSelfGrant = hasList && selfIdentityResolved && !base.some((g) => g.id === selfId);

    // De-collapsed like every listing fact — on tiger the user id is often the email.
    const selfIdentity = useMemo<ISelfIdentity | undefined>(
        () =>
            currentUser
                ? {
                      ...userIdentityFacts(idRef(currentUser.login), currentUser.fullName, currentUser.email),
                      id: currentUser.login,
                  }
                : undefined,
        [currentUser],
    );

    const grantees = useMemo<IObjectShareGrantee[]>(
        () => mergeGrantees(base, granteeEdits, selfId, selfIdentity),
        [base, granteeEdits, selfId, selfIdentity],
    );

    const generalAccess: GeneralAccessValue =
        ruleEdit?.generalAccess ?? deriveGeneralAccess(fetchedList?.grants ?? []);
    const workspaceLevel = ruleEdit?.level ?? deriveWorkspacePermissionLevel(fetchedList?.grants ?? []);
    const workspaceLevelSaving = ruleEdit?.pending ?? false;
    const workspaceInheritedLevel = useMemo(
        () => deriveInheritedWorkspaceLevel(fetchedList?.grants ?? []),
        [fetchedList],
    );

    // Keyed on plain values so the summary's identity changes exactly when its
    // content does — consumers (the dialog's onSummaryChange) rely on that.
    const granteeCount = grantees.filter((g) => g.pending !== "removing").length;
    const summary = useMemo<IObjectAccessSummary | undefined>(() => {
        if (!hasList) {
            return undefined;
        }
        // Effective access: an inherited rule counts as WORKSPACE even without a local rule.
        return {
            ...composeEffectiveWorkspaceAccess(generalAccess, workspaceLevel, workspaceInheritedLevel),
            granteeCount,
        };
    }, [hasList, generalAccess, workspaceLevel, workspaceInheritedLevel, granteeCount]);

    // "success" waits for `hasList` so consumers never see success with nothing to show.
    const deriveStatus = (): IObjectShareControllerState["status"] => {
        if (!target) {
            return "idle";
        }
        if (fetchStatus === "error") {
            return "error";
        }
        return hasList ? "success" : "loading";
    };
    const status = deriveStatus();

    // Typed SDK error, the house pattern (see InsightView) — not a hand-rolled Error.
    const loadError = useMemo<GoodDataSdkError | undefined>(
        () => (fetchStatus === "error" ? convertError(fetchError) : undefined),
        [fetchStatus, fetchError],
    );

    // The caller owns the optimistic overlay write and its rollback; there is no refetch.
    const commit = useCallback(
        async (mutate: IGranularAccessGrantee[], successMessage: { id: string }): Promise<boolean> => {
            if (!target) {
                return false;
            }
            try {
                await backend
                    .workspace(workspace)
                    .objectPermissions()
                    .manageObjectPermissions(target, mutate);
                toast.addSuccess(successMessage);
                return true;
            } catch {
                toast.addError(objectShareMessages.toastError);
                return false;
            }
        },
        [backend, workspace, target, toast],
    );

    // Ids the picker excludes as already-granted — INCLUDING rows whose removal is
    // still in flight: offering those would let a re-add overlap the pending revoke
    // on one id, and the settle/fail finalizers act on the id's current overlay
    // entry, not the write that started them. A settled removal drops out of the
    // merged view, so the id becomes offerable exactly when the revoke has landed.
    const excludedIds = useMemo(() => new Set(grantees.map((g) => g.id)), [grantees]);

    // Each option carries its backend `ref` so the add flow grants against the exact ref.
    const loadOptions = useCallback(
        async (search: string): Promise<IUiGranteeAsyncOptions> => {
            if (!target) {
                return { groups: [], users: [] };
            }
            const assignees = await backend
                .workspace(workspace)
                .objectPermissions()
                .getAvailableAssignees(target);
            const query = search.trim().toLowerCase();

            const users: IUiGranteeAsyncOptions["users"] = [];
            const groups: IUiGranteeAsyncOptions["groups"] = [];
            for (const assignee of assignees) {
                const kind = assignee.type === "user" ? "user" : "group";
                const id = granteeId(kind, assignee.ref);
                if (excludedIds.has(id) || !assigneeMatchesQuery(assignee, query)) {
                    continue;
                }
                if (assignee.type === "user") {
                    users.push({
                        id,
                        ref: assignee.ref,
                        kind: "user",
                        // Same name → email → id fallback the grantee rows use.
                        ...userDisplayPair(assigneeIdentityFacts(assignee), objRefToString(assignee.ref)),
                    });
                } else {
                    groups.push({ id, ref: assignee.ref, kind: "group", name: assignee.name });
                }
            }
            return { users, groups };
        },
        [backend, workspace, target, excludedIds],
    );

    const applyGranteeAdd = useCallback((grantee: IObjectShareGrantee) => {
        setGranteeEdits((prev) => {
            const current = prev[grantee.id];
            // Re-adding a removed base row supersedes the committed removal — carry
            // it, so a failed add restores the removal instead of dropping the entry
            // and resurrecting the base row at its pre-removal level.
            const settled = current ? { ...current, settled: undefined } : undefined;
            return { ...prev, [grantee.id]: { kind: "added", grantee, pending: true, settled } };
        });
    }, []);

    const applyGranteeLevel = useCallback((id: string, level: ObjectSharePermissionLevel) => {
        setGranteeEdits((prev) => {
            const current = prev[id];
            // Keep one level of history: the committed entry this edit supersedes.
            const settled = current ? { ...current, settled: undefined } : undefined;
            if (current?.kind === "added") {
                // Overlay-born row: stay an `added` entry, or the merge would drop it.
                const grantee = withDirectLevel(current.grantee, level);
                return { ...prev, [id]: { kind: "added", grantee, pending: true, settled } };
            }
            return { ...prev, [id]: { kind: "level", level, pending: true, settled } };
        });
    }, []);

    // Lock a row for a write that does NOT change its access (a label-scope edit). The
    // lock WRAPS whatever the row committed rather than modifying it: reusing the
    // existing entry and flipping `pending` would re-arm it, and `pending` means
    // something different per kind — a settled removal would read as a revoke in flight
    // and render the row as removing at its pre-removal level. Both settling and failing
    // unwrap back to the entry underneath, because a label write changes neither.
    const applyGranteeLock = useCallback((id: string) => {
        setGranteeEdits((prev) => {
            const current = prev[id];
            const settled = current ? { ...current, settled: undefined } : undefined;
            return { ...prev, [id]: { kind: "locked", pending: true, settled } };
        });
    }, []);

    const applyGranteeRemove = useCallback((id: string) => {
        setGranteeEdits((prev) => {
            const current = prev[id];
            const settled = current ? { ...current, settled: undefined } : undefined;
            return { ...prev, [id]: { kind: "removed", pending: true, settled } };
        });
    }, []);

    const settleGranteeEdit = useCallback((id: string) => {
        setGranteeEdits((prev) => {
            const current = prev[id];
            if (!current) {
                return prev;
            }
            // A lock is a wrapper over the row's committed state, so settling it unwraps —
            // same as failing. Keeping a settled `locked` entry would discard the entry it
            // wrapped and drop the row back to its fetched state.
            if (current.kind === "locked") {
                if (!current.settled) {
                    const { [id]: _omit, ...rest } = prev;
                    return rest;
                }
                return { ...prev, [id]: current.settled };
            }
            // A settled removal always keeps its entry: for a base row (including a
            // removed re-added one) it is what keeps the row hidden; for an
            // overlay-born row it renders nothing and is harmless.
            return { ...prev, [id]: { ...current, pending: false, settled: undefined } };
        });
    }, []);

    const failGranteeEdit = useCallback((id: string) => {
        setGranteeEdits((prev) => {
            const current = prev[id];
            if (!current) {
                return prev;
            }
            if (current.settled) {
                return { ...prev, [id]: current.settled };
            }
            const { [id]: _omit, ...rest } = prev;
            return rest;
        });
    }, []);

    const applyRuleEdit = useCallback((edit: Omit<IRuleEdit, "settled">) => {
        setRuleEditState((current) => ({
            ...edit,
            settled: current ? { ...current, settled: undefined } : undefined,
        }));
    }, []);

    const settleRuleEdit = useCallback(() => {
        setRuleEditState((current) =>
            current ? { ...current, pending: false, settled: undefined } : current,
        );
    }, []);

    const failRuleEdit = useCallback(() => {
        setRuleEditState((current) => current?.settled);
    }, []);

    return {
        hasList,
        grantees,
        seededWithoutSelfGrant,
        selfIdentity,
        selfIdentityResolved,
        generalAccess,
        workspaceLevel,
        workspaceInheritedLevel,
        workspaceLevelSaving,
        summary,
        status,
        loadError,
        commit,
        loadOptions,
        applyGranteeAdd,
        applyGranteeLevel,
        applyGranteeLock,
        applyGranteeRemove,
        settleGranteeEdit,
        failGranteeEdit,
        applyRuleEdit,
        settleRuleEdit,
        failRuleEdit,
    };
}
