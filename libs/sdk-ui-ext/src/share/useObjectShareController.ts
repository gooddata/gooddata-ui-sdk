// (C) 2026 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import type { IObjectPermissionsObject } from "@gooddata/sdk-backend-spi";
import { type GeneralAccessValue, type IUiPickedGrantee, useToastMessage } from "@gooddata/sdk-ui-kit";

import { objectShareMessages } from "./messages.js";
import {
    EMPTY_IDS,
    type LabelScopePrincipal,
    NO_LABELS,
    granularGranteeFor,
    toGranularGrantee,
} from "./objectShareController.helpers.js";
import {
    type IObjectShareController,
    type IObjectShareControllerActions,
    type IObjectShareControllerState,
    type IObjectShareGrantee,
    type ObjectSharePermissionLevel,
} from "./objectShareController.types.js";
import type { IObjectShareLabel } from "./types.js";
import { useAccessList } from "./useAccessList.js";
import { useLabelScope } from "./useLabelScope.js";

/**
 * Manages the share dialog state and backend I/O for a single shareable
 * object.
 *
 * The access list is fetched (and re-fetched after every save) via
 * `useCancelablePromise`; everything that reflects the backend — the grantee
 * rows, general-access value, summary — is derived from it on render, never
 * copied into local state. Local state is only the dialog's own transient UI:
 * the active subview, the add-grantee buffer, the pending general-access
 * confirm, and an in-flight save flag. Top-level open/close is the consumer's
 * concern (see {@link ObjectShareDialog}).
 *
 * Mutations follow a **commit-on-interaction** model: each access change is
 * sent immediately; the general-access toggle goes through a confirm step
 * because it is high-impact. There is no batched Save. The list is fetched
 * eagerly so `state.summary` also drives an inline access row while closed.
 *
 * @internal
 */
export function useObjectShareController(
    target: IObjectPermissionsObject | undefined,
    onSaved?: () => void,
    labels: IObjectShareLabel[] = NO_LABELS,
    labelsError = false,
    labelsLoading = false,
): IObjectShareController {
    const toast = useToastMessage();

    // UI-local buffers — never backend data.
    const [subview, setSubview] = useState<"main" | "addGrantee">("main");
    const [pendingGrantees, setPendingGrantees] = useState<IUiPickedGrantee[]>([]);
    const [pendingGeneralAccess, setPendingGeneralAccess] = useState<GeneralAccessValue | undefined>(
        undefined,
    );

    // The backend access list + optimistic overlay (rows, general access, summary,
    // the commit/picker primitives) live in their own hook.
    const {
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
    } = useAccessList(target, onSaved);

    // Per-label scope resolution + the single label-write path live in their own hook.
    const {
        effectiveLabels,
        labelsResolved,
        selectedLabelIdsByGrantee,
        setSelectedLabelIdsByGrantee,
        optimisticScopeRef,
        reconcileLabelScope,
    } = useLabelScope(
        target,
        targetKey,
        labels,
        currentAccessList,
        granteeIdsKey,
        labelsError,
        labelsLoading,
    );

    // Drop the transient UI buffers when the permission target changes. The detail
    // view is reused across objects and closes the dialog by toggling `isOpen`
    // alone, so without this a staged add-grantee subview or general-access confirm
    // would survive navigation and reappear on (and apply to) the next object.
    // Reset during render — React's "adjust state on prop change" idiom — rather
    // than in an effect, so the stale buffers never reach a commit.
    const [lastTargetKey, setLastTargetKey] = useState(targetKey);
    if (lastTargetKey !== targetKey) {
        setLastTargetKey(targetKey);
        setSubview("main");
        setPendingGrantees([]);
        setPendingGeneralAccess(undefined);
    }

    const reset = useCallback(() => {
        setSubview("main");
        setPendingGrantees([]);
        setPendingGeneralAccess(undefined);
    }, []);

    const openAddGrantee = useCallback(() => {
        setSubview("addGrantee");
        setPendingGrantees([]);
    }, []);

    const closeAddGrantee = useCallback(() => {
        setSubview("main");
        setPendingGrantees([]);
    }, []);

    const confirmAddGrantees = useCallback(async (): Promise<void> => {
        if (pendingGrantees.length === 0) {
            return;
        }
        // Optimistically insert the picked grantees as pending rows, carrying the
        // picker's display name so the new row never renders a raw id.
        const added = pendingGrantees.map((g) => ({
            id: g.id,
            grantee: {
                id: g.id,
                kind: g.kind,
                granteeRef: refForId(g.id),
                name: g.name,
                level: g.permissionLevel,
            } satisfies IObjectShareGrantee,
        }));
        const mutations = pendingGrantees.map((g) =>
            toGranularGrantee(g.kind, refForId(g.id), g.permissionLevel),
        );
        setOverlay((prev) => {
            const next = { ...prev };
            for (const { id, grantee } of added) {
                next[id] = { op: "set", grantee, pending: true };
            }
            return next;
        });
        // Cache the picked names so the rows keep them after the overlay reconciles.
        setKnownNames((prev) => {
            const next = { ...prev };
            for (const { id, grantee } of added) {
                next[id] = grantee.name;
            }
            return next;
        });
        // Leave the add subview at once so the new rows show in the main list.
        closeAddGrantee();

        const ok = await commit(mutations, objectShareMessages.toastGranteeAdded);
        if (!ok) {
            // Roll back the failed adds; refresh() already reconciled on success.
            setOverlay((prev) => {
                const next = { ...prev };
                for (const { id } of added) {
                    delete next[id];
                }
                return next;
            });
            return;
        }

        // Default each new grantee to ALL labels (the picker's Add is gated until
        // labels have loaded, so the set is known here). Reflect the full scope
        // optimistically and hold it through read-after-write lag; if any label
        // write fails, surface it and drop that grantee's optimistic scope rather
        // than claim access that didn't persist.
        const allLabelIds = effectiveLabels.map((l) => l.id);
        const allLabelIdSet = new Set(allLabelIds);
        for (const g of pendingGrantees) {
            optimisticScopeRef.current.add(g.id);
        }
        setSelectedLabelIdsByGrantee((prev) => {
            const next = { ...prev };
            for (const g of pendingGrantees) {
                next[g.id] = allLabelIds;
            }
            return next;
        });
        const scoped = await Promise.all(
            pendingGrantees.map((g) =>
                reconcileLabelScope({ kind: g.kind, granteeRef: refForId(g.id) }, allLabelIdSet, EMPTY_IDS),
            ),
        );
        const failed = pendingGrantees.filter((_, i) => !scoped[i]);
        if (failed.length > 0) {
            toast.addWarning(objectShareMessages.toastLabelScopePartial);
            // Some non-primary label writes didn't persist. Don't drop the entry —
            // a missing entry means "all selected", which would falsely show full
            // access. Pin the failed grantees to the primary label only (the one
            // that's always granted with the object), reflecting what actually stuck.
            const primaryIds = effectiveLabels.filter((l) => l.isPrimary).map((l) => l.id);
            setSelectedLabelIdsByGrantee((prev) => {
                const next = { ...prev };
                for (const g of failed) {
                    next[g.id] = primaryIds;
                }
                return next;
            });
        }
    }, [
        pendingGrantees,
        commit,
        closeAddGrantee,
        effectiveLabels,
        reconcileLabelScope,
        refForId,
        toast,
        setOverlay,
        setKnownNames,
        setSelectedLabelIdsByGrantee,
        optimisticScopeRef,
    ]);

    const changePermissionLevel = useCallback(
        async (granteeId: string, level: ObjectSharePermissionLevel): Promise<void> => {
            const grantee = grantees.find((g) => g.id === granteeId);
            if (!grantee || grantee.level === level || grantee.pending) {
                return;
            }
            const previousLevel = grantee.level;
            // Show the new level immediately; keep it through the backend's
            // read-after-write lag (reconcileOverlay clears it once confirmed).
            setOverlay((prev) => ({
                ...prev,
                [granteeId]: { op: "set", grantee: { ...grantee, level }, pending: true },
            }));
            const ok = await commit(
                [toGranularGrantee(grantee.kind, grantee.granteeRef, level)],
                objectShareMessages.toastAccessUpdated,
            );
            if (!ok) {
                // Revert to the prior level on failure.
                setOverlay((prev) => ({
                    ...prev,
                    [granteeId]: { op: "set", grantee: { ...grantee, level: previousLevel }, pending: false },
                }));
            }
        },
        [grantees, commit, setOverlay],
    );

    const removeGrantee = useCallback(
        async (granteeId: string): Promise<void> => {
            const grantee = grantees.find((g) => g.id === granteeId);
            if (!grantee || grantee.pending) {
                return;
            }
            // Mark the row removed but keep it visible (muted) until the write lands.
            setOverlay((prev) => ({ ...prev, [granteeId]: { op: "remove", pending: true } }));
            // Revoke the grantee's per-label grants too — they are independent
            // access-list entries, so the object revoke alone would leave them
            // behind. Reconcile to an empty scope (current = all permissionable).
            const allCurrent = new Set(effectiveLabels.map((l) => l.id));
            const principal = { kind: grantee.kind, granteeRef: grantee.granteeRef };
            const labelsRevoked = await reconcileLabelScope(principal, EMPTY_IDS, allCurrent);
            const ok = await commit(
                [toGranularGrantee(grantee.kind, grantee.granteeRef, "none")],
                objectShareMessages.toastAccessUpdated,
            );
            if (!ok) {
                // Restore the row on failure — and re-grant the labels we just
                // revoked, so a failed object revoke doesn't strip label access
                // while the grantee row stays.
                if (labelsRevoked) {
                    await reconcileLabelScope(principal, allCurrent, EMPTY_IDS);
                }
                setOverlay((prev) => {
                    const { [granteeId]: _omit, ...rest } = prev;
                    return rest;
                });
            } else if (!labelsRevoked) {
                // Object access is gone but some per-label grants couldn't be
                // revoked — warn so the leftover scope isn't mistaken for success.
                toast.addWarning(objectShareMessages.toastLabelScopePartial);
            }
        },
        [grantees, commit, effectiveLabels, reconcileLabelScope, toast, setOverlay],
    );

    const changeGranteeLabels = useCallback(
        async (granteeId: string, requested: string[]): Promise<void> => {
            const grantee = grantees.find((g) => g.id === granteeId);
            if (!grantee || !target) {
                return;
            }
            // Primary label is always in scope; never let it be dropped.
            const primaryIds = effectiveLabels.filter((l) => l.isPrimary).map((l) => l.id);
            const nextScope = Array.from(new Set([...requested, ...primaryIds]));
            const currentScope = selectedLabelIdsByGrantee[granteeId] ?? effectiveLabels.map((l) => l.id);
            const desired = new Set(nextScope);
            const current = new Set(currentScope);

            // Optimistic: reflect the new scope immediately and hold it through lag.
            const previousScope = currentScope;
            optimisticScopeRef.current.add(granteeId);
            setSelectedLabelIdsByGrantee((prev) => ({ ...prev, [granteeId]: nextScope }));

            const ok = await reconcileLabelScope(
                { kind: grantee.kind, granteeRef: grantee.granteeRef },
                desired,
                current,
            );
            if (ok) {
                toast.addSuccess(objectShareMessages.toastAccessUpdated);
                onSaved?.();
                // Keep the optimistic scope as the source of truth — re-resolving now
                // would clobber it with the backend's read-after-write-stale value
                // (same lag the grantee overlay handles).
            } else {
                toast.addError(objectShareMessages.toastError);
                setSelectedLabelIdsByGrantee((prev) => ({ ...prev, [granteeId]: previousScope }));
            }
        },
        [
            grantees,
            target,
            effectiveLabels,
            selectedLabelIdsByGrantee,
            reconcileLabelScope,
            toast,
            onSaved,
            setSelectedLabelIdsByGrantee,
            optimisticScopeRef,
        ],
    );

    const requestGeneralAccessChange = useCallback(
        (next: GeneralAccessValue) => {
            if (next !== generalAccess) {
                setPendingGeneralAccess(next);
            }
        },
        [generalAccess],
    );

    const confirmGeneralAccessChange = useCallback(async (): Promise<void> => {
        const next = pendingGeneralAccess;
        if (!next || next === generalAccess) {
            setPendingGeneralAccess(undefined);
            return;
        }
        const previous = generalAccess;
        // Apply optimistically and close the confirm at once — the radio + summary
        // reflect `next` immediately; the write commits in the background.
        setOptimisticGeneralAccess(next);
        setPendingGeneralAccess(undefined);

        const principal: LabelScopePrincipal = { allWorkspaceUsers: true };
        const allIds = new Set(effectiveLabels.map((l) => l.id));
        // The workspace rule must cover every label too, or the workspace would
        // hold object access while non-primary labels stay ungranted. Mirror it
        // first (WORKSPACE → all labels, RESTRICTED → none), then write the object.
        const [desired, current] = next === "WORKSPACE" ? [allIds, EMPTY_IDS] : [EMPTY_IDS, allIds];
        const mirrored = await reconcileLabelScope(principal, desired, current);
        if (!mirrored) {
            // The label mirror failed: don't write the object grant on top of a
            // half-applied label scope. Undo whatever mirrored, revert the
            // optimistic override and surface the error.
            await reconcileLabelScope(principal, current, desired);
            setOptimisticGeneralAccess((value) => (value === next ? previous : value));
            toast.addError(objectShareMessages.toastError);
            return;
        }

        const ok = await commit(
            [granularGranteeFor(principal, next === "WORKSPACE" ? "VIEW" : "none")],
            objectShareMessages.toastGeneralAccessUpdated,
        );
        if (!ok) {
            // Object write failed: undo the label mirror too, so labels and object
            // don't drift, and revert the optimistic override.
            await reconcileLabelScope(principal, current, desired);
            setOptimisticGeneralAccess((value) => (value === next ? previous : value));
        }
    }, [
        pendingGeneralAccess,
        generalAccess,
        commit,
        effectiveLabels,
        reconcileLabelScope,
        toast,
        setOptimisticGeneralAccess,
    ]);

    const actions = useMemo<IObjectShareControllerActions>(
        () => ({
            reset,
            openAddGrantee,
            closeAddGrantee,
            setPendingGrantees,
            loadOptions,
            confirmAddGrantees,
            changePermissionLevel,
            removeGrantee,
            changeGranteeLabels,
            requestGeneralAccessChange,
            cancelGeneralAccessChange: () => setPendingGeneralAccess(undefined),
            confirmGeneralAccessChange,
        }),
        [
            reset,
            openAddGrantee,
            closeAddGrantee,
            loadOptions,
            confirmAddGrantees,
            changePermissionLevel,
            removeGrantee,
            changeGranteeLabels,
            requestGeneralAccessChange,
            confirmGeneralAccessChange,
        ],
    );

    const state = useMemo<IObjectShareControllerState>(
        () => ({
            subview,
            status,
            error: loadError,
            summary,
            grantees,
            generalAccess,
            labels: effectiveLabels,
            labelsResolved,
            selectedLabelIdsByGrantee,
            pendingGeneralAccess,
            pendingGrantees,
        }),
        [
            subview,
            status,
            loadError,
            summary,
            grantees,
            generalAccess,
            effectiveLabels,
            labelsResolved,
            selectedLabelIdsByGrantee,
            pendingGeneralAccess,
            pendingGrantees,
        ],
    );

    return useMemo(() => ({ state, actions }), [state, actions]);
}
