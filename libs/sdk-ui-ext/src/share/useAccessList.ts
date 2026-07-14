// (C) 2026 GoodData Corporation

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { IObjectPermissionsObject } from "@gooddata/sdk-backend-spi";
import {
    type IAvailableAccessGrantee,
    type IGranularAccessGrantee,
    type IUser,
    type ObjRef,
    idRef,
    objRefToString,
} from "@gooddata/sdk-model";
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { type GeneralAccessValue, type IUiGranteeAsyncOptions, useToastMessage } from "@gooddata/sdk-ui-kit";

import { isPermissionsNotAvailable } from "./accessErrors.js";
import { deriveGeneralAccess, deriveWorkspacePermissionLevel } from "./accessSummary.js";
import { objectShareMessages } from "./messages.js";
import {
    assigneeIdentityFacts,
    assigneeMatchesQuery,
    granteeId,
    granteesFromAccessList,
    userDisplayPair,
    userIdentityFacts,
} from "./objectShareController.helpers.js";
import type {
    IGranteeIdentityFacts,
    IObjectShareControllerState,
    IObjectShareGrantee,
} from "./objectShareController.types.js";
import type { IObjectAccessSummary } from "./types.js";

/**
 * The owned access list for {@link useObjectShareController}.
 *
 * @internal
 */
export interface IAccessList {
    /** Stable serialized key of the current target's ref, or undefined when none. */
    targetKey: string | undefined;
    /** True once the current target's list has been fetched and seeded into local state. */
    hasList: boolean;
    /** Local grantee rows — seeded from the fetch, then authoritative; mutations write through. */
    grantees: IObjectShareGrantee[];
    /** Workspace vs restricted general access — local state; mutations write through. */
    generalAccess: GeneralAccessValue;
    /** Workspace-rule permission level (VIEW/SHARE) — local state; mutations write through. */
    workspaceLevel: "VIEW" | "SHARE";
    /** Inline access summary, or undefined before the first load. */
    summary: IObjectAccessSummary | undefined;
    /** Top-level load status surfaced as the controller status. */
    status: IObjectShareControllerState["status"];
    /** Error from the initial/target-change load. */
    loadError: Error | undefined;
    /**
     * Whether the current target's load was denied because the caller can't manage
     * its permissions (manage-gated endpoint returns 404). Derived from the live
     * fetch, not the persisted `loadError`, so it can't lag a target switch and
     * flag a new target with the previous one's 404.
     */
    accessUnavailable: boolean;

    /** Write a grant change to the backend and toast. False on failure; no refetch. */
    commit: (mutate: IGranularAccessGrantee[], successMessage: { id: string }) => Promise<boolean>;
    /**
     * Picker loader — available assignees filtered by query. By default excludes
     * already-granted grantees (add-grantee picker); pass `includeGranted` to keep
     * them (transfer-ownership picker, which may promote an existing viewer).
     */
    loadOptions: (search: string, includeGranted?: boolean) => Promise<IUiGranteeAsyncOptions>;
    /**
     * The current user's ref, resolved on demand (and cached). Used by the
     * transfer-ownership flow to write the current user's own grant change. The
     * add-grantee *picker* excludes the current user, but `getAccessList` does
     * not, so a self grant can still appear as a row. Always an idRef in the
     * access list's id space, so it is comparable to grantee refs. Rejects if
     * the profile can't be read.
     */
    getCurrentUserRef: () => Promise<ObjRef>;
    /**
     * Whether the signed-in user owns the object (holds a direct EDIT grant) — the
     * gate for the owner-only transfer-ownership action. Resolved eagerly so the
     * affordance is correct at render time; false until the current user resolves.
     * Detects direct grants only: ownership held via a user group is not recognized
     * (the row model drops inherited EDIT, and whether the access list surfaces a
     * self row for group-only members is an open API question). Affordance-only by
     * design — the transfer actions are never blocked on it, the backend decides.
     */
    canTransferOwnership: boolean;
    /** Resolve a grantee id back to the picker's original ObjRef (preserves Uri vs Id ref). */
    refForId: (id: string) => ObjRef;

    /** Write through a local grantee-row change (insert / level / remove); rolled back by the caller. */
    setGrantees: React.Dispatch<React.SetStateAction<IObjectShareGrantee[]>>;
    /** Write through a local general-access change; rolled back by the caller. */
    setGeneralAccess: React.Dispatch<React.SetStateAction<GeneralAccessValue>>;
    /**
     * Write through the local workspace-rule permission level. A general-access write
     * always grants workspace VIEW, so the caller sets this to keep the summary from
     * showing a stale SHARE inherited from the initial fetch.
     */
    setWorkspaceLevel: React.Dispatch<React.SetStateAction<"VIEW" | "SHARE">>;
}

/**
 * Owns the backend access list. It is fetched once (per target) then seeded into
 * local state, which is authoritative while the dialog/summary is mounted:
 * mutations write through to it directly and roll back the one changed entry on
 * failure. There is no post-write refetch, so the grantee list never blanks and
 * never fights the backend's read-after-write lag. A target switch re-seeds from
 * the new fetch; the seed is gated on a per-target stamp so a late fetch for a
 * previous target can't clobber the current one.
 *
 * Effective (inherited) permissions and display names come from that single
 * fetch: inherited access doesn't change as a result of editing a direct grant,
 * so the badge stays correct for the session without re-reading.
 *
 * @internal
 */
export function useAccessList(
    target: IObjectPermissionsObject | undefined,
    onSaved: (() => void) | undefined,
    dialogOpen: boolean,
): IAccessList {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const toast = useToastMessage();

    // Authoritative local state, seeded from the fetch below.
    const [grantees, setGrantees] = useState<IObjectShareGrantee[]>([]);
    const [generalAccess, setGeneralAccess] = useState<GeneralAccessValue>("RESTRICTED");
    const [workspaceLevel, setWorkspaceLevel] = useState<"VIEW" | "SHARE">("VIEW");
    // The target the local state was seeded for; undefined until the first seed.
    // Reading state as belonging to the current target hinges on this matching
    // `targetKey` — a target switch makes the old state stale until the re-seed.
    const [seededTarget, setSeededTarget] = useState<string | undefined>(undefined);
    const [loadError, setLoadError] = useState<Error | undefined>(undefined);
    // Assignee identities from the listing (picker + on-open resolve), keyed by
    // grantee id: de-collapsed facts + the original ObjRef (the serialized id
    // loses Uri-vs-Id). The signed-in user is absent from the listing; their
    // facts derive from the profile instead.
    const [knownAssignees, setKnownAssignees] = useState<
        Record<string, { facts: IGranteeIdentityFacts; ref: ObjRef }>
    >({});
    // Memoized current-user fetch — the profile doesn't change while mounted,
    // so resolve it at most once and share the promise across callers.
    const currentUserCache = useRef<Promise<IUser> | undefined>(undefined);

    const targetKey = target ? objRefToString(target.ref) : undefined;

    // Written from both the picker (loadOptions) and the on-open resolve. Must not
    // depend on the cache it writes, or it would re-trigger loadOptions' fetch.
    const cacheAssignees = useCallback((assignees: IAvailableAccessGrantee[]) => {
        setKnownAssignees((prev) => {
            const next = { ...prev };
            for (const assignee of assignees) {
                next[granteeId(assignee.type === "user" ? "user" : "group", assignee.ref)] = {
                    facts: assigneeIdentityFacts(assignee),
                    ref: assignee.ref,
                };
            }
            return next;
        });
    }, []);

    // Initial (and target-change) load. Seeds local state once per target; thereafter
    // local state is authoritative and mutations write through it.
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
        // Key on the serialized ref, not the ObjRef object — an inline idRef(...) is a
        // new instance each render and would otherwise refetch forever.
        [backend, workspace, target?.kind, targetKey],
    );

    // Local state belongs to the current target only once its list has been seeded
    // AND no fetch is in flight for it. Requiring `fetchStatus === "success"` (not
    // just a matching `seededTarget`) matters when the same object is reopened after
    // navigating away: the deps change re-runs `useCancelablePromise`, which resets to
    // `loading` while it refetches. Without this, the still-matching previous
    // `seededTarget` would keep `hasList` true and surface the prior session's
    // grantees as `success` (mutations enabled) until the new list lands.
    const hasList = seededTarget === targetKey && targetKey !== undefined && fetchStatus === "success";

    useEffect(() => {
        if (fetchStatus === "success" && fetchedList) {
            // The cancelable promise is keyed on targetKey, so this list is for it.
            setGrantees(granteesFromAccessList(fetchedList));
            setGeneralAccess(deriveGeneralAccess(fetchedList.grants));
            setWorkspaceLevel(deriveWorkspacePermissionLevel(fetchedList.grants));
            setSeededTarget(targetKey);
            setLoadError(undefined);
        } else if (fetchStatus === "error") {
            setLoadError(fetchError instanceof Error ? fetchError : new Error(String(fetchError)));
        } else if (fetchStatus === "loading") {
            // A (re)fetch is in flight — including when the same object is reopened
            // after navigating away. Drop the seed stamp so the previous session's
            // list isn't surfaced as the current one until the fresh fetch is seeded.
            setSeededTarget(undefined);
        }
    }, [fetchStatus, fetchedList, fetchError, targetKey]);

    const getCurrentUser = useCallback((): Promise<IUser> => {
        if (!currentUserCache.current) {
            currentUserCache.current = backend
                .currentUser()
                .getUser()
                .catch((error) => {
                    // Don't cache a rejected promise, or a transient profile-read
                    // failure would make every later transfer fail immediately.
                    currentUserCache.current = undefined;
                    throw error;
                });
        }
        return currentUserCache.current;
    }, [backend]);

    // Resolve the current user only while the dialog is open — keeps the summary-only
    // path free of a profile request (the transfer gate and self-row facts it feeds
    // aren't shown there).
    const { result: currentUser } = useCancelablePromise<IUser>(
        {
            promise: dialogOpen && targetKey ? () => getCurrentUser() : undefined,
            onError: () => {},
        },
        // Key on target presence, not identity — the resolved user is
        // target-independent, so a target switch must not reset it.
        [getCurrentUser, targetKey !== undefined, dialogOpen],
    );

    const selfId = currentUser ? granteeId("user", idRef(currentUser.login)) : undefined;

    // Rows with identity facts backfilled from the assignee cache — or, for the
    // signed-in user's own row (absent from the listing by design), from the
    // profile. Empty until the current target's list is seeded; a derivation, so
    // it re-applies as the caches grow.
    const namedGrantees = useMemo<IObjectShareGrantee[]>(() => {
        if (!hasList) {
            return [];
        }
        // De-collapsed like every listing fact — on tiger the user id is often the email.
        const selfFacts = currentUser
            ? userIdentityFacts(idRef(currentUser.login), currentUser.fullName, currentUser.email)
            : undefined;
        return grantees.map((g) => {
            const known = knownAssignees[g.id]?.facts ?? (g.id === selfId ? selfFacts : undefined);
            return known ? { ...g, name: g.name ?? known.name, email: g.email ?? known.email } : g;
        });
    }, [hasList, grantees, knownAssignees, currentUser, selfId]);

    // Resolve identity facts on dialog open — grants often carry only raw ids
    // (the post-reload state). Unconditional: no missing-facts gate to keep in
    // sync with the cache, and summary-only consumers never fetch. Keyed on the
    // serialized targetKey so an inline-ref consumer re-rendering mid-fetch
    // doesn't cancel it.
    useCancelablePromise<IAvailableAccessGrantee[]>(
        {
            promise:
                target && dialogOpen
                    ? () => backend.workspace(workspace).objectPermissions().getAvailableAssignees(target)
                    : undefined,
            onSuccess: cacheAssignees,
            // Best-effort backfill: on error the raw id stays (pre-fix behavior, no
            // regression) and the picker can still resolve it on demand. No toast.
            onError: () => {},
        },
        [backend, workspace, targetKey, dialogOpen],
    );

    // Stable sorted key of the currently-granted ids — drives the picker's
    // "exclude already-granted" filter. Keyed on ids only (not names), so the
    // picker's own name-cache writes can't change loadOptions' identity and
    // re-trigger its fetch.
    const excludedIdsKey = useMemo(
        () =>
            grantees
                .filter((g) => g.pending !== "removing")
                .map((g) => g.id)
                .sort()
                .join(","),
        [grantees],
    );

    const summary = useMemo<IObjectAccessSummary | undefined>(() => {
        if (!hasList) {
            return undefined;
        }
        return {
            generalAccess,
            workspaceLevel: generalAccess === "WORKSPACE" ? workspaceLevel : "VIEW",
            granteeCount: namedGrantees.filter((g) => g.pending !== "removing").length,
        };
    }, [hasList, generalAccess, workspaceLevel, namedGrantees]);

    // "success" only once the *current* target's list has been seeded. After a
    // target switch the previous seed is stale (seededTarget !== targetKey), so
    // gating on hasList keeps the status at "loading" until the new list lands —
    // never "success" with no list, which would let the dialog enable mutations
    // and the catalog row hide both summary and skeleton.
    const status: IObjectShareControllerState["status"] = target
        ? fetchStatus === "error"
            ? "error"
            : hasList
              ? "success"
              : "loading"
        : "idle";

    // Derived from the live fetch (status + error travel together), not the
    // persisted loadError — so a target switch can't briefly flag the new target
    // with the previous target's 404 before the load effect updates loadError.
    const accessUnavailable = fetchStatus === "error" && isPermissionsNotAvailable(fetchError);

    // Write a single grant change to the backend, then toast. The caller applies
    // the optimistic local write-through and rolls it back on failure; there is no
    // refetch — local state stays authoritative.
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
                onSaved?.();
                return true;
            } catch {
                toast.addError(objectShareMessages.toastError);
                return false;
            }
        },
        [backend, workspace, target, toast, onSaved],
    );

    // Picker loader — fetches available assignees on demand, filters by the typed
    // query, and by default excludes anything already granted. Depends only on the
    // granted set (grantees), so its identity changes only when that set actually
    // changes. It must NOT write state that feeds its own deps.
    //
    // `includeGranted` keeps already-granted grantees in the result. The
    // transfer-ownership picker needs this: promoting an existing viewer to owner
    // is a primary case, and the add-grantee exclusion would otherwise hide them.
    const loadOptions = useCallback(
        async (search: string, includeGranted = false): Promise<IUiGranteeAsyncOptions> => {
            if (!target) {
                return { groups: [], users: [] };
            }
            const assignees = await backend
                .workspace(workspace)
                .objectPermissions()
                .getAvailableAssignees(target);
            const query = search.trim().toLowerCase();
            const withIds = assignees.map((a) => ({
                assignee: a,
                id: granteeId(a.type === "user" ? "user" : "group", a.ref),
            }));
            // Remember every assignee's real name + ref so granted rows can show them
            // even when the access-list grant later returns only a raw id. Safe here:
            // the caches aren't dependencies of loadOptions, so this won't re-trigger it.
            cacheAssignees(assignees);
            const excluded = new Set(includeGranted || !excludedIdsKey ? [] : excludedIdsKey.split(","));
            const selectable = withIds
                .filter(({ id }) => !excluded.has(id)) // hide anyone already granted
                .filter(({ assignee }) => assigneeMatchesQuery(assignee, query));

            return {
                users: selectable
                    .filter(({ assignee }) => assignee.type === "user")
                    .map(({ assignee, id }) => ({
                        id,
                        kind: "user" as const,
                        // Same fallback pairs as the grantee rows.
                        ...userDisplayPair(assigneeIdentityFacts(assignee), objRefToString(assignee.ref)),
                    })),
                groups: selectable
                    .filter(({ assignee }) => assignee.type !== "user")
                    .map(({ assignee, id }) => ({ id, kind: "group" as const, name: assignee.name })),
            };
        },
        [backend, workspace, target, excludedIdsKey, cacheAssignees],
    );

    // Reuse the picker's original ref (preserves UriRef vs IdentifierRef);
    // fall back to the serialized id only if it wasn't cached.
    const refForId = useCallback(
        (id: string): ObjRef => knownAssignees[id]?.ref ?? { identifier: id.split(":", 2)[1]! },
        [knownAssignees],
    );

    const getCurrentUserRef = useCallback(
        // Not `user.ref`: the profile resolves it as a uriRef while access-list
        // grantee refs are idRefs keyed by user id (= profile login), and
        // areObjRefsEqual never matches mixed shapes — self-row matching and
        // the self grant write need the permission API's id space.
        (): Promise<ObjRef> => getCurrentUser().then((user) => idRef(user.login)),
        [getCurrentUser],
    );

    const canTransferOwnership =
        selfId !== undefined && namedGrantees.some((g) => g.id === selfId && g.level === "EDIT");

    return {
        targetKey,
        hasList,
        grantees: namedGrantees,
        generalAccess,
        workspaceLevel,
        summary,
        status,
        loadError,
        accessUnavailable,
        commit,
        loadOptions,
        refForId,
        getCurrentUserRef,
        canTransferOwnership,
        setGrantees,
        setGeneralAccess,
        setWorkspaceLevel,
    };
}
