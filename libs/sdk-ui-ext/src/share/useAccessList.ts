// (C) 2026 GoodData Corporation

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { IObjectPermissionsObject } from "@gooddata/sdk-backend-spi";
import {
    type IGranularAccessGrantee,
    type IObjectAccessList,
    type ObjRef,
    objRefToString,
} from "@gooddata/sdk-model";
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { type GeneralAccessValue, type IUiGranteeAsyncOptions, useToastMessage } from "@gooddata/sdk-ui-kit";

import { deriveGeneralAccess, deriveWorkspacePermissionLevel } from "./accessSummary.js";
import { objectShareMessages } from "./messages.js";
import {
    type IGranteeOverlayEntry,
    assigneeMatchesQuery,
    granteeId,
    granteesFromAccessList,
    mergeOverlay,
    reconcileOverlay,
} from "./objectShareController.helpers.js";
import type { IObjectShareControllerState, IObjectShareGrantee } from "./objectShareController.types.js";
import type { IObjectAccessSummary } from "./types.js";

/**
 * The owned access list + optimistic overlay for {@link useObjectShareController}.
 *
 * @internal
 */
export interface IAccessList {
    /** Stable serialized key of the current target's ref, or undefined when none. */
    targetKey: string | undefined;
    /** The owned list as it applies to the *current* target (undefined while a switch is pending). */
    currentAccessList: IObjectAccessList | undefined;
    /** Committed grantee rows overlaid with optimistic intent (add/level/remove). */
    grantees: IObjectShareGrantee[];
    /** Sorted, comma-joined committed grantee ids — a stable key for resolution effects. */
    granteeIdsKey: string;
    /** Optimistic-aware general access (workspace vs restricted). */
    generalAccess: GeneralAccessValue;
    /** Inline access summary (optimistic-aware), or undefined before the first load. */
    summary: IObjectAccessSummary | undefined;
    /** Top-level load status surfaced as the controller status. */
    status: IObjectShareControllerState["status"];
    /** Error from the initial/target-change load. */
    loadError: Error | undefined;

    /** Commit a grant change, toast on success, then background-refresh. False on failure. */
    commit: (mutate: IGranularAccessGrantee[], successMessage: { id: string }) => Promise<boolean>;
    /** Picker loader — available assignees minus already-granted, filtered by query. */
    loadOptions: (search: string) => Promise<IUiGranteeAsyncOptions>;
    /** Resolve a grantee id back to the picker's original ObjRef (preserves Uri vs Id ref). */
    refForId: (id: string) => ObjRef;

    setOverlay: React.Dispatch<React.SetStateAction<Record<string, IGranteeOverlayEntry>>>;
    setKnownNames: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    setOptimisticGeneralAccess: React.Dispatch<React.SetStateAction<GeneralAccessValue | undefined>>;
}

/**
 * Owns the backend access list and its optimistic overlay. The list is fetched
 * via `useCancelablePromise` then owned locally: mutations patch the overlay and
 * a background refresh reconciles it, so the grantee list never blanks between a
 * change and the server response. A target switch is handled by stamping the
 * fetched list with its target and reading through `currentAccessList`.
 *
 * @internal
 */
export function useAccessList(
    target: IObjectPermissionsObject | undefined,
    onSaved: (() => void) | undefined,
): IAccessList {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const toast = useToastMessage();

    const [accessList, setAccessList] = useState<IObjectAccessList | undefined>(undefined);
    const [accessListTarget, setAccessListTarget] = useState<string | undefined>(undefined);
    const [loadStatus, setLoadStatus] = useState<"idle" | "loading" | "error">(target ? "loading" : "idle");
    const [loadError, setLoadError] = useState<Error | undefined>(undefined);
    // Optimistic overlay keyed by grantee id. Each entry holds the *intended* row
    // (add/level-change) or a removal, plus a pending flag while the write is in
    // flight. The backend has read-after-write lag, so we show the intended state
    // and clear an entry only once a refresh confirms it (or the write fails).
    const [overlay, setOverlay] = useState<Record<string, IGranteeOverlayEntry>>({});
    // Display names learned from the picker; keep a human name on a row after the
    // optimistic overlay reconciles away (the grant often returns only a raw id).
    const [knownNames, setKnownNames] = useState<Record<string, string>>({});
    // Original ObjRef per grantee id, learned from the picker (the access-list id
    // is a serialized `kind:identifier`, which loses Uri-vs-Id). Reused for writes.
    const [knownRefs, setKnownRefs] = useState<Record<string, ObjRef>>({});
    // Optimistic general-access override — held from confirm until the fetched list
    // reflects it, so the radio + summary update instantly.
    const [optimisticGeneralAccess, setOptimisticGeneralAccess] = useState<GeneralAccessValue | undefined>(
        undefined,
    );

    const targetKey = target ? objRefToString(target.ref) : undefined;
    // The owned list as it applies to the *current* target. A target switch makes
    // the previous fetch's list stale until the new one lands; gating on the stamp
    // means everything derived ignores it immediately — no reset effect.
    const currentAccessList = accessListTarget === targetKey ? accessList : undefined;

    // Always-current target key, read inside async callbacks that captured an older
    // one. A background refresh started for the previous target can resolve after a
    // switch; without this it would stamp the list back to the stale target, leaving
    // the new target's `currentAccessList` undefined (and, with the load-gated
    // status, stuck "loading" since its own fetch already settled).
    const targetKeyRef = useRef(targetKey);
    targetKeyRef.current = targetKey;

    // Initial (and target-change) load. Feeds setAccessList once; thereafter we own it.
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

    useEffect(() => {
        if (fetchStatus === "success" && fetchedList) {
            // The cancelable promise is keyed on targetKey, so this list is for it.
            setAccessList(fetchedList);
            setAccessListTarget(targetKey);
            setLoadStatus("idle");
            setLoadError(undefined);
            setOverlay({}); // a target-change load is authoritative; drop stale overlay
            setOptimisticGeneralAccess(undefined);
        } else if (fetchStatus === "error") {
            setLoadStatus("error");
            setLoadError(fetchError instanceof Error ? fetchError : new Error(String(fetchError)));
        } else if (fetchStatus === "loading") {
            setLoadStatus("loading");
        }
    }, [fetchStatus, fetchedList, fetchError, targetKey]);

    // Background refresh — pulls server truth without nulling the current list,
    // then reconciles the overlay (clears entries the server now confirms).
    const refresh = useCallback(async (): Promise<void> => {
        if (!target) {
            return;
        }
        try {
            const fresh = await backend.workspace(workspace).objectPermissions().getAccessList(target);
            // The target may have changed while this refresh was in flight. Stamping
            // a stale target's list now would clobber the new target's stamp and
            // strand it loading, so drop the result if we've since switched away.
            if (targetKeyRef.current !== targetKey) {
                return;
            }
            setAccessList(fresh);
            setAccessListTarget(targetKey);
            setOverlay((prev) => reconcileOverlay(granteesFromAccessList(fresh), prev));
            // Drop the optimistic general-access override once the server confirms it.
            const freshGeneralAccess = deriveGeneralAccess(fresh.grants);
            setOptimisticGeneralAccess((prev) => (prev === freshGeneralAccess ? undefined : prev));
        } catch {
            // The refresh failed, but the mutation that triggered it already
            // succeeded. The overlay can't be reconciled against fresh data now, so
            // settle it optimistically: keep each entry's intended state (a `set`
            // value stays, a `remove` keeps hiding the row) but clear its `pending`
            // flag. Otherwise rows would spin on "saving"/"removing" forever even
            // though the change persisted and a success toast was shown.
            setOverlay((prev) => {
                let changed = false;
                const next: Record<string, IGranteeOverlayEntry> = {};
                for (const [id, entry] of Object.entries(prev)) {
                    if (entry.pending) {
                        changed = true;
                        next[id] = { ...entry, pending: false };
                    } else {
                        next[id] = entry;
                    }
                }
                return changed ? next : prev;
            });
        }
    }, [backend, workspace, target, targetKey]);

    // Committed rows overlaid with optimistic intent; backfill a human name from
    // the picker cache where the grant only carried a raw id.
    const grantees = useMemo<IObjectShareGrantee[]>(() => {
        if (!currentAccessList) {
            return [];
        }
        const committed = granteesFromAccessList(currentAccessList).map((g) => {
            const known = knownNames[g.id];
            return known && g.name === objRefToString(g.granteeRef) ? { ...g, name: known } : g;
        });
        return mergeOverlay(committed, overlay);
    }, [currentAccessList, overlay, knownNames]);

    const granteeIdsKey = granteesFromAccessList(currentAccessList)
        .map((g) => g.id)
        .sort()
        .join(",");

    const committedGeneralAccess = useMemo<GeneralAccessValue>(
        () => (currentAccessList ? deriveGeneralAccess(currentAccessList.grants) : "RESTRICTED"),
        [currentAccessList],
    );
    const generalAccess = optimisticGeneralAccess ?? committedGeneralAccess;

    const summary = useMemo<IObjectAccessSummary | undefined>(() => {
        if (!currentAccessList) {
            return undefined;
        }
        return {
            generalAccess,
            // While the optimistic override is active we just wrote the workspace
            // rule as VIEW, so report VIEW rather than the stale fetched grant
            // (which can still read SHARE through read-after-write lag).
            workspaceLevel: optimisticGeneralAccess
                ? "VIEW"
                : deriveWorkspacePermissionLevel(currentAccessList.grants),
            granteeCount: grantees.length,
        };
    }, [currentAccessList, generalAccess, optimisticGeneralAccess, grantees]);

    // "success" only once the *current* target's list has actually landed. After a
    // target switch the stamp clears `currentAccessList` immediately, but
    // `loadStatus` still reads "idle" from the previous target's completed load
    // until the effect re-runs — so gating on loadStatus alone would briefly report
    // "success" with no list, letting the dialog enable mutations and the catalog
    // row hide both summary and skeleton. Treat "no list for this target yet" as
    // loading.
    const status: IObjectShareControllerState["status"] = target
        ? loadStatus === "error"
            ? "error"
            : loadStatus === "loading" || !currentAccessList
              ? "loading"
              : "success"
        : "idle";

    // Commit a single grant change against the backend, then reconcile via refresh.
    // Optimistic state is applied by the caller; on failure the caller's rollback
    // runs and a toast is shown.
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
                await refresh();
                return true;
            } catch {
                toast.addError(objectShareMessages.toastError);
                return false;
            }
        },
        [backend, workspace, target, toast, onSaved, refresh],
    );

    // Picker loader — fetches available assignees on demand, filters by the typed
    // query, excludes anything already granted. Depends only on the grant sources
    // (accessList, overlay), so its identity changes only when the granted set
    // actually changes. It must NOT write state that feeds its own deps.
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
            const withIds = assignees.map((a) => ({
                assignee: a,
                id: granteeId(a.type === "user" ? "user" : "group", a.ref),
            }));
            // Remember every assignee's real name + ref so granted rows can show them
            // even when the access-list grant later returns only a raw id. Safe here:
            // neither is a dependency of loadOptions, so this won't re-trigger it.
            setKnownNames((prev) => {
                const next = { ...prev };
                for (const { assignee, id } of withIds) {
                    next[id] = assignee.name;
                }
                return next;
            });
            setKnownRefs((prev) => {
                const next = { ...prev };
                for (const { assignee, id } of withIds) {
                    next[id] = assignee.ref;
                }
                return next;
            });
            const excluded = new Set(
                mergeOverlay(granteesFromAccessList(currentAccessList), overlay).map((g) => g.id),
            );
            const selectable = withIds
                .filter(({ id }) => !excluded.has(id)) // hide anyone already granted
                .filter(({ assignee }) => assigneeMatchesQuery(assignee, query));

            return {
                users: selectable
                    .filter(({ assignee }) => assignee.type === "user")
                    .map(({ assignee, id }) => ({
                        id,
                        kind: "user" as const,
                        name: assignee.name,
                        email: assignee.type === "user" ? assignee.email : undefined,
                    })),
                groups: selectable
                    .filter(({ assignee }) => assignee.type !== "user")
                    .map(({ assignee, id }) => ({ id, kind: "group" as const, name: assignee.name })),
            };
        },
        [backend, workspace, target, currentAccessList, overlay],
    );

    // Reuse the picker's original ref (preserves UriRef vs IdentifierRef);
    // fall back to the serialized id only if it wasn't cached.
    const refForId = useCallback(
        (id: string): ObjRef => knownRefs[id] ?? { identifier: id.split(":", 2)[1]! },
        [knownRefs],
    );

    return {
        targetKey,
        currentAccessList,
        grantees,
        granteeIdsKey,
        generalAccess,
        summary,
        status,
        loadError,
        commit,
        loadOptions,
        refForId,
        setOverlay,
        setKnownNames,
        setOptimisticGeneralAccess,
    };
}
