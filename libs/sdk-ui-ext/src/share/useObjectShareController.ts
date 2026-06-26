// (C) 2026 GoodData Corporation

import { useCallback, useMemo, useRef, useState } from "react";

import type { IObjectPermissionsObject } from "@gooddata/sdk-backend-spi";
import type { IGranularAccessGrantee } from "@gooddata/sdk-model";
import { type GeneralAccessValue, type IUiPickedGrantee, useToastMessage } from "@gooddata/sdk-ui-kit";

import { objectShareMessages } from "./messages.js";
import {
    EMPTY_IDS,
    type LabelScopePrincipal,
    NO_LABELS,
    effectivePermissionAbove,
    granularGranteeFor,
    toGranularGrantee,
} from "./objectShareController.helpers.js";
import {
    type IObjectShareController,
    type IObjectShareControllerActions,
    type IObjectShareControllerState,
    type IObjectShareGrantee,
    type IUseObjectShareOptions,
    type ObjectSharePermissionLevel,
} from "./objectShareController.types.js";
import { useAccessList } from "./useAccessList.js";
import { useLabelScope } from "./useLabelScope.js";

/**
 * Manages the share dialog state and backend I/O for a single shareable object.
 *
 * The access list is fetched once and seeded into local state, which is the
 * source of truth while the dialog/summary is mounted. Each access change is
 * written through to local state immediately and sent to the backend; on failure
 * the one changed entry is rolled back. There is no post-write refetch, so the
 * grantee list never blanks and never fights the backend's read-after-write lag.
 * Top-level open/close is the consumer's concern (see {@link ObjectShareDialog}).
 *
 * Mutations follow a **commit-on-interaction** model: each access change is sent
 * immediately; the general-access toggle goes through a confirm step because it
 * is high-impact. There is no batched Save. The list is fetched eagerly so
 * `state.summary` also drives an inline access row while closed.
 *
 * Most consumers do not call this directly — render {@link ObjectShareDialog} with
 * plain props and it owns its controller. Call this (exported as `useObjectShare`)
 * only to share a single access-list fetch between the dialog and an inline summary
 * row: call it once, read `state.summary` for the row, and pass the controller into
 * the dialog.
 *
 * @internal
 */
export function useObjectShareController(
    target: IObjectPermissionsObject | undefined,
    options?: IUseObjectShareOptions,
): IObjectShareController {
    const { onSaved, labels = NO_LABELS, labelsError = false, labelsLoading = false } = options ?? {};
    const toast = useToastMessage();

    // UI-local buffers — never backend data.
    const [subview, setSubview] = useState<"main" | "addGrantee">("main");
    const [pendingGrantees, setPendingGrantees] = useState<IUiPickedGrantee[]>([]);
    const [pendingGeneralAccess, setPendingGeneralAccess] = useState<GeneralAccessValue | undefined>(
        undefined,
    );
    // True while a workspace-level re-grade is committing. The workspace rule has no
    // grantee row to carry a `pending` flag (unlike named grantees), so this gates
    // re-entry and disables the dropdown to keep rapid VIEW↔SHARE toggles from issuing
    // overlapping writes that could settle out of order.
    const [workspaceLevelSaving, setWorkspaceLevelSaving] = useState(false);

    // The backend access list, seeded into local state (rows, general access,
    // summary, the commit/picker primitives) lives in its own hook.
    const {
        targetKey,
        hasList,
        grantees,
        generalAccess,
        workspaceLevel,
        summary,
        status,
        loadError,
        accessUnavailable,
        commit,
        loadOptions,
        refForId,
        setGrantees,
        setGeneralAccess,
        setWorkspaceLevel,
        setKnownNames,
    } = useAccessList(target, onSaved);

    // Always-current target key, read inside async mutation finalizers that captured
    // an older one. A write started for object A resolves after the user navigated to
    // object B; because local state is authoritative (no refetch), applying A's
    // finalizer to B's seeded list would corrupt B (e.g. clobber a same-id row, or
    // revert B's general access). Each finalizer captures the target it started for
    // and bails if it no longer matches.
    const targetKeyRef = useRef(targetKey);
    targetKeyRef.current = targetKey;

    // The committed grantee ids the label-scope probe resolves against (a removing
    // row is excluded so its scope is dropped, not re-seeded).
    const committedGranteeIds = useMemo(
        () => grantees.filter((g) => g.pending !== "removing").map((g) => g.id),
        [grantees],
    );

    // Per-label scope resolution + the single label-write path live in their own hook.
    const {
        effectiveLabels,
        labelsResolved,
        selectedLabelIdsByGrantee,
        setSelectedLabelIdsByGrantee,
        reconcileLabelScope,
    } = useLabelScope(target, targetKey, labels, hasList, committedGranteeIds, labelsError, labelsLoading);

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
        setWorkspaceLevelSaving(false);
    }

    const reset = useCallback(() => {
        setSubview("main");
        setPendingGrantees([]);
        setPendingGeneralAccess(undefined);
        setWorkspaceLevelSaving(false);
    }, []);

    const openAddGrantee = useCallback(() => {
        setSubview("addGrantee");
        setPendingGrantees([]);
    }, []);

    const closeAddGrantee = useCallback(() => {
        setSubview("main");
        setPendingGrantees([]);
    }, []);

    // The single object+labels write path shared by remove and general access (the
    // two changes that must keep the object grant and its label mirror consistent).
    // Mirrors the labels first, then writes the object; if the object write fails it
    // undoes the label mirror so the two never drift. `abortIfLabelsFail` distinguishes
    // the two callers' label-failure policy: general access aborts (labels and object
    // are one logical change), remove proceeds (the object revoke is what matters; a
    // leftover label grant is only surfaced as a warning). Returns the object-write
    // result and whether the label mirror fully applied; the caller owns the local
    // write-through, the revert and any toast beyond `commit`'s own.
    const applyAccessChange = useCallback(
        async (params: {
            principal: LabelScopePrincipal;
            objectMutation: IGranularAccessGrantee;
            successMessage: { id: string };
            labelDesired: ReadonlySet<string>;
            labelCurrent: ReadonlySet<string>;
            abortIfLabelsFail: boolean;
        }): Promise<{ ok: boolean; labelsOk: boolean }> => {
            const { principal, objectMutation, successMessage, labelDesired, labelCurrent } = params;
            const labelsOk = await reconcileLabelScope(principal, labelDesired, labelCurrent);
            if (!labelsOk && params.abortIfLabelsFail) {
                // Don't write the object on a half-applied label scope: undo whatever
                // mirrored and surface the failure to the caller.
                await reconcileLabelScope(principal, labelCurrent, labelDesired);
                return { ok: false, labelsOk: false };
            }
            const ok = await commit([objectMutation], successMessage);
            if (!ok) {
                // Object write failed — undo the label mirror so labels and object
                // don't drift.
                await reconcileLabelScope(principal, labelCurrent, labelDesired);
            }
            return { ok, labelsOk };
        },
        [commit, reconcileLabelScope],
    );

    const confirmAddGrantees = useCallback(async (): Promise<void> => {
        if (pendingGrantees.length === 0) {
            return;
        }
        const startedFor = targetKey;
        // Insert the picked grantees as pending rows, carrying the picker's display
        // name so the new row never renders a raw id.
        const addedIds = pendingGrantees.map((g) => g.id);
        const addedRows = pendingGrantees.map(
            (g): IObjectShareGrantee => ({
                id: g.id,
                kind: g.kind,
                granteeRef: refForId(g.id),
                name: g.name,
                level: g.permissionLevel,
                pending: "saving",
            }),
        );
        const mutations = pendingGrantees.map((g) =>
            toGranularGrantee(g.kind, refForId(g.id), g.permissionLevel),
        );
        // Default each new grantee to ALL labels (the picker's Add is gated until
        // labels have loaded, so the set is known here). Reflect the full scope
        // before the writes so the row shows it immediately.
        const allLabelIds = effectiveLabels.map((l) => l.id);
        const allLabelIdSet = new Set(allLabelIds);
        setGrantees((prev) => [...prev.filter((g) => !addedIds.includes(g.id)), ...addedRows]);
        setKnownNames((prev) => {
            const next = { ...prev };
            for (const g of pendingGrantees) {
                next[g.id] = g.name;
            }
            return next;
        });
        setSelectedLabelIdsByGrantee((prev) => {
            const next = { ...prev };
            for (const id of addedIds) {
                next[id] = allLabelIds;
            }
            return next;
        });
        // Leave the add subview at once so the new rows show in the main list.
        closeAddGrantee();

        const ok = await commit(mutations, objectShareMessages.toastGranteeAdded);
        // Bail if the target switched mid-add: the new object's list was already
        // seeded, so rolling back / clearing markers / mirroring labels by these ids
        // would hit the wrong object.
        if (targetKeyRef.current !== startedFor) {
            return;
        }
        if (!ok) {
            // Roll back the failed adds.
            setGrantees((prev) => prev.filter((g) => !addedIds.includes(g.id)));
            setSelectedLabelIdsByGrantee((prev) => {
                const next = { ...prev };
                for (const id of addedIds) {
                    delete next[id];
                }
                return next;
            });
            return;
        }
        // Object grant landed — clear the saving marker on the new rows.
        setGrantees((prev) => prev.map((g) => (addedIds.includes(g.id) ? { ...g, pending: undefined } : g)));

        // Mirror each new grantee's full label scope; pin failures to primary-only.
        const scoped = await Promise.all(
            pendingGrantees.map((g) =>
                reconcileLabelScope({ kind: g.kind, granteeRef: refForId(g.id) }, allLabelIdSet, EMPTY_IDS),
            ),
        );
        if (targetKeyRef.current !== startedFor) {
            return;
        }
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
        targetKey,
        commit,
        closeAddGrantee,
        effectiveLabels,
        reconcileLabelScope,
        refForId,
        toast,
        setGrantees,
        setKnownNames,
        setSelectedLabelIdsByGrantee,
    ]);

    const changePermissionLevel = useCallback(
        async (granteeId: string, level: ObjectSharePermissionLevel): Promise<void> => {
            const grantee = grantees.find((g) => g.id === granteeId);
            if (!grantee || grantee.level === level || grantee.pending) {
                return;
            }
            const startedFor = targetKey;
            const previousLevel = grantee.level;
            // Recompute the inherited-SHARE badge for the new direct level: raising a
            // VIEW grant to SHARE makes the inherited SHARE no longer "above" the
            // direct grant (badge hidden); lowering it back surfaces the warning again.
            const nextEffective = effectivePermissionAbove(level, grantee.inheritsShare ? ["SHARE"] : []);
            // Show the new level immediately (marked saving), then write it through.
            setGrantees((prev) =>
                prev.map((g) =>
                    g.id === granteeId
                        ? { ...g, level, effectivePermission: nextEffective, pending: "saving" }
                        : g,
                ),
            );
            const ok = await commit(
                [toGranularGrantee(grantee.kind, grantee.granteeRef, level)],
                objectShareMessages.toastAccessUpdated,
            );
            // The target may have changed while the write was in flight; applying this
            // finalizer to the newly seeded list would corrupt the other object's row.
            if (targetKeyRef.current !== startedFor) {
                return;
            }
            setGrantees((prev) =>
                prev.map((g) =>
                    g.id === granteeId
                        ? {
                              ...g,
                              level: ok ? level : previousLevel,
                              effectivePermission: ok
                                  ? nextEffective
                                  : effectivePermissionAbove(previousLevel, g.inheritsShare ? ["SHARE"] : []),
                              pending: undefined,
                          }
                        : g,
                ),
            );
        },
        [grantees, targetKey, commit, setGrantees],
    );

    const removeGrantee = useCallback(
        async (granteeId: string): Promise<void> => {
            const grantee = grantees.find((g) => g.id === granteeId);
            if (!grantee || grantee.pending) {
                return;
            }
            const startedFor = targetKey;
            // Mark the row removed but keep it visible (muted) until the write lands.
            setGrantees((prev) => prev.map((g) => (g.id === granteeId ? { ...g, pending: "removing" } : g)));
            // Revoke the grantee's per-label grants too — they are independent
            // access-list entries, so the object revoke alone would leave them behind
            // (current = all permissionable). The object revoke is what matters; a
            // label revoke that fails is non-fatal (surfaced as a warning), so don't
            // abort on it.
            const { ok, labelsOk } = await applyAccessChange({
                principal: { kind: grantee.kind, granteeRef: grantee.granteeRef },
                objectMutation: toGranularGrantee(grantee.kind, grantee.granteeRef, "none"),
                successMessage: objectShareMessages.toastAccessUpdated,
                labelDesired: EMPTY_IDS,
                labelCurrent: new Set(effectiveLabels.map((l) => l.id)),
                abortIfLabelsFail: false,
            });
            // Bail if the target switched mid-write: the row no longer belongs to the
            // seeded list, and dropping/restoring "it" would hit the other object.
            if (targetKeyRef.current !== startedFor) {
                return;
            }
            if (!ok) {
                // Object revoke failed (applyAccessChange already re-granted the
                // labels) — restore the row.
                setGrantees((prev) =>
                    prev.map((g) => (g.id === granteeId ? { ...g, pending: undefined } : g)),
                );
                return;
            }
            // Object revoke landed — drop the row from local state.
            setGrantees((prev) => prev.filter((g) => g.id !== granteeId));
            setSelectedLabelIdsByGrantee((prev) => {
                const { [granteeId]: _omit, ...rest } = prev;
                return rest;
            });
            if (!labelsOk) {
                // Object access is gone but some per-label grants couldn't be
                // revoked — warn so the leftover scope isn't mistaken for success.
                toast.addWarning(objectShareMessages.toastLabelScopePartial);
            }
        },
        [
            grantees,
            targetKey,
            applyAccessChange,
            effectiveLabels,
            toast,
            setGrantees,
            setSelectedLabelIdsByGrantee,
        ],
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

            const startedFor = targetKey;
            // Reflect the new scope immediately; restore it on failure.
            const previousScope = currentScope;
            setSelectedLabelIdsByGrantee((prev) => ({ ...prev, [granteeId]: nextScope }));

            const ok = await reconcileLabelScope(
                { kind: grantee.kind, granteeRef: grantee.granteeRef },
                desired,
                current,
            );
            // Bail if the target switched mid-write — the scope map now belongs to the
            // other object, so neither the success no-op nor the rollback applies here.
            if (targetKeyRef.current !== startedFor) {
                return;
            }
            if (ok) {
                toast.addSuccess(objectShareMessages.toastAccessUpdated);
                onSaved?.();
            } else {
                toast.addError(objectShareMessages.toastError);
                setSelectedLabelIdsByGrantee((prev) => ({ ...prev, [granteeId]: previousScope }));
            }
        },
        [
            grantees,
            target,
            targetKey,
            effectiveLabels,
            selectedLabelIdsByGrantee,
            reconcileLabelScope,
            toast,
            onSaved,
            setSelectedLabelIdsByGrantee,
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
        // Don't toggle general access while a workspace-level re-grade is committing:
        // the two write the same allWorkspaceUsers rule, so a late re-grade could land
        // after this and leave the backend broader than the UI shows. The dialog also
        // disables the radio in this window; this guards the controller directly.
        if (workspaceLevelSaving) {
            return;
        }
        const startedFor = targetKey;
        const previous = generalAccess;
        const previousWorkspaceLevel = workspaceLevel;
        // Apply the new value and close the confirm at once — the radio + summary
        // reflect `next` immediately; the write commits in the background. The
        // workspace rule is always written as VIEW, so reflect VIEW now too —
        // otherwise the summary would keep a SHARE level left over from the fetch.
        setGeneralAccess(next);
        if (next === "WORKSPACE") {
            setWorkspaceLevel("VIEW");
        }
        setPendingGeneralAccess(undefined);

        const principal: LabelScopePrincipal = { allWorkspaceUsers: true };
        const allIds = new Set(effectiveLabels.map((l) => l.id));
        // The workspace rule must cover every label too, or the workspace would hold
        // object access while non-primary labels stay ungranted. Mirror the labels
        // (WORKSPACE → all, RESTRICTED → none) then write the object; the two are one
        // logical change, so abort if the labels fail.
        const [desired, current] = next === "WORKSPACE" ? [allIds, EMPTY_IDS] : [EMPTY_IDS, allIds];
        const { ok, labelsOk } = await applyAccessChange({
            principal,
            objectMutation: granularGranteeFor(principal, next === "WORKSPACE" ? "VIEW" : "none"),
            successMessage: objectShareMessages.toastGeneralAccessUpdated,
            labelDesired: desired,
            labelCurrent: current,
            abortIfLabelsFail: true,
        });
        // Bail if the target switched mid-write — reverting now would change the
        // other object's general access.
        if (targetKeyRef.current !== startedFor) {
            return;
        }
        if (!ok) {
            // Labels or object write failed (applyAccessChange already undid the
            // label mirror) — revert the value (and the workspace level). The
            // label-abort path produced no toast, so surface the error here; a
            // failed object write already toasted via commit, so don't double up.
            setGeneralAccess(previous);
            setWorkspaceLevel(previousWorkspaceLevel);
            if (!labelsOk) {
                toast.addError(objectShareMessages.toastError);
            }
        }
    }, [
        pendingGeneralAccess,
        generalAccess,
        workspaceLevel,
        workspaceLevelSaving,
        targetKey,
        applyAccessChange,
        effectiveLabels,
        toast,
        setGeneralAccess,
        setWorkspaceLevel,
    ]);

    const changeWorkspaceLevel = useCallback(
        async (level: "VIEW" | "SHARE"): Promise<void> => {
            // Only re-grade an already-granted workspace rule; ignore no-ops, calls made
            // while access is restricted (no rule to re-grade), and re-entry while a
            // previous re-grade is still in flight (would overlap writes).
            if (generalAccess !== "WORKSPACE" || level === workspaceLevel || workspaceLevelSaving) {
                return;
            }
            const startedFor = targetKey;
            const previousLevel = workspaceLevel;
            // Reflect the new level immediately and mark the write in flight, then commit
            // it. Labels are untouched — they were already mirrored when workspace access
            // was granted; this changes only the rule's permission grade.
            setWorkspaceLevel(level);
            setWorkspaceLevelSaving(true);
            const ok = await commit(
                [granularGranteeFor({ allWorkspaceUsers: true }, level)],
                objectShareMessages.toastGeneralAccessUpdated,
            );
            // Bail if the target switched mid-write — the workspace level now belongs to
            // the other object, so neither keeping nor rolling back applies here. The
            // saving flag is reset on the new target's seed, so don't touch it.
            if (targetKeyRef.current !== startedFor) {
                return;
            }
            if (!ok) {
                setWorkspaceLevel(previousLevel);
            }
            setWorkspaceLevelSaving(false);
        },
        [generalAccess, workspaceLevel, workspaceLevelSaving, targetKey, commit, setWorkspaceLevel],
    );

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
            changeWorkspaceLevel,
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
            changeWorkspaceLevel,
        ],
    );

    const state = useMemo<IObjectShareControllerState>(
        () => ({
            subview,
            status,
            error: loadError,
            accessUnavailable,
            summary,
            grantees,
            generalAccess,
            // The workspace rule isn't granted while restricted, so its level is
            // meaningless then — pin to VIEW so the (hidden) dropdown never shows a
            // stale SHARE left over from a prior workspace grant.
            workspaceLevel: generalAccess === "WORKSPACE" ? workspaceLevel : "VIEW",
            workspaceLevelSaving,
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
            accessUnavailable,
            summary,
            grantees,
            generalAccess,
            workspaceLevel,
            workspaceLevelSaving,
            effectiveLabels,
            labelsResolved,
            selectedLabelIdsByGrantee,
            pendingGeneralAccess,
            pendingGrantees,
        ],
    );

    return useMemo(() => ({ state, actions }), [state, actions]);
}
