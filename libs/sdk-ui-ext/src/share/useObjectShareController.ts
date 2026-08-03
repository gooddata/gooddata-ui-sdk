// (C) 2026 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import type { IObjectPermissionsObject } from "@gooddata/sdk-backend-spi";
import { type IGranularAccessGrantee } from "@gooddata/sdk-model";
import { type GeneralAccessValue, type IUiPickedGrantee, useToastMessage } from "@gooddata/sdk-ui-kit";

import { composeEffectiveWorkspaceAccess } from "./accessSummary.js";
import { objectShareMessages } from "./messages.js";
import {
    EMPTY_IDS,
    type LabelScopePrincipal,
    NO_LABELS,
    granularGranteeFor,
    levelsAbove,
    levelsBelow,
    sortGrantees,
    toGranularGrantee,
    userDisplayPair,
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
 * Manages the share-dialog state and backend I/O for ONE dialog session: the hook
 * is mounted while the dialog is open, for a single target that must not change
 * while mounted (see {@link ObjectShareDialog}). Unmounting discards every
 * transient — pending rows, staged confirms, optimistic overlays — so no explicit
 * reset exists or is needed.
 *
 * The access list is fetched once, and the displayed state is *derived* from that
 * fetch composed with a small local edit overlay (owned by `useAccessList`). Each
 * access change writes its overlay entry (so the row updates immediately), commits
 * to the backend, then settles the entry on success or reverts it on failure (to
 * the last committed entry, or the fetched value). There is no post-write refetch,
 * so the grantee list never blanks and never fights read-after-write lag.
 *
 * Mutations follow a **commit-on-interaction** model: each access change is sent
 * immediately; the general-access toggle goes through a confirm step because it
 * is high-impact. There is no batched Save. Grantee rows carry identity facts only
 * (`name`/`email` are undefined when unknown); the display fallback order is not
 * exposed, so {@link ObjectShareDialog} is the only sanctioned row renderer.
 *
 * @internal
 */
export function useObjectShareController(
    target: IObjectPermissionsObject | undefined,
    options?: IUseObjectShareOptions,
): IObjectShareController {
    const { labels = NO_LABELS, labelsError = false, labelsLoading = false } = options ?? {};
    const toast = useToastMessage();

    // UI-local buffers — never backend data.
    const [subview, setSubview] = useState<"main" | "addGrantee">("main");
    const [pendingGrantees, setPendingGrantees] = useState<IUiPickedGrantee[]>([]);
    const [pendingGeneralAccess, setPendingGeneralAccess] = useState<GeneralAccessValue | undefined>(
        undefined,
    );

    const {
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
        applyGranteeRemove,
        settleGranteeEdit,
        failGranteeEdit,
        applyRuleEdit,
        settleRuleEdit,
        failRuleEdit,
    } = useAccessList(target);

    // Grantee ids the label-scope probe resolves against — a removing row is excluded
    // so its scope is dropped, not re-seeded.
    const committedGranteeIds = useMemo(() => {
        const ids: string[] = [];
        for (const g of grantees) {
            if (g.pending !== "removing") {
                ids.push(g.id);
            }
        }
        return ids;
    }, [grantees]);

    // Per-label scope resolution + the single label-write path live in their own hook.
    const {
        effectiveLabels,
        labelsResolved,
        labelsInitializing,
        selectedLabelIdsByGrantee,
        setSelectedLabelIdsByGrantee,
        reconcileLabelScope,
    } = useLabelScope(target, labels, hasList, committedGranteeIds, labelsError, labelsLoading);

    // Effective access: the direct state composed with inherited rule access.
    // Also pins the level to VIEW while restricted, so the (hidden) dropdown
    // never shows a stale SHARE left over from a prior grant.
    const effectiveWorkspace = useMemo(
        () => composeEffectiveWorkspaceAccess(generalAccess, workspaceLevel, workspaceInheritedLevel),
        [generalAccess, workspaceLevel, workspaceInheritedLevel],
    );

    // ── Add-grantee subview ──────────────────────────────────────────────────────

    const openAddGrantee = useCallback(() => {
        setSubview("addGrantee");
        setPendingGrantees([]);
    }, []);

    const closeAddGrantee = useCallback(() => {
        setSubview("main");
        setPendingGrantees([]);
    }, []);

    // ── Shared write path (object grant + label-scope mirror) ────────────────────

    // The single object+labels write path shared by remove and general access (the
    // two changes that must keep the object grant and its label mirror consistent).
    // Mirrors the labels first, then writes the object; if the object write fails it
    // undoes the label mirror so the two never drift. `abortIfLabelsFail` distinguishes
    // the two callers' label-failure policy: general access aborts (labels and object
    // are one logical change), remove proceeds (the object revoke is what matters; a
    // leftover label grant is only surfaced as a warning). Returns the object-write
    // result and whether the label mirror fully applied; the caller owns the local
    // overlay, the revert and any toast beyond `commit`'s own.
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
            const { ok: labelsOk } = await reconcileLabelScope([principal], labelDesired, labelCurrent);
            if (!labelsOk && params.abortIfLabelsFail) {
                // Don't write the object on a half-applied label scope: undo whatever
                // mirrored and surface the failure to the caller.
                await reconcileLabelScope([principal], labelCurrent, labelDesired);
                return { ok: false, labelsOk: false };
            }
            const ok = await commit([objectMutation], successMessage);
            if (!ok) {
                // Object write failed — undo the label mirror so labels and object
                // don't drift.
                await reconcileLabelScope([principal], labelCurrent, labelDesired);
            }
            return { ok, labelsOk };
        },
        [commit, reconcileLabelScope],
    );

    // ── Grantee mutations (add / level / remove / labels) ────────────────────────

    const confirmAddGrantees = useCallback(async (): Promise<void> => {
        if (pendingGrantees.length === 0) {
            return;
        }
        // Insert the picked grantees as pending overlay rows, carrying the picker
        // option's ref (exact backend ref) and display name/email straight through —
        // there is no post-write refetch, so the row shows what the picker showed.
        const addedIds = pendingGrantees.map((g) => g.id);
        const addedRows = pendingGrantees.map(
            (g): IObjectShareGrantee => ({
                id: g.id,
                kind: g.kind,
                granteeRef: g.ref,
                name: g.name,
                email: g.email,
                level: g.permissionLevel,
            }),
        );
        const mutations = pendingGrantees.map((g) => toGranularGrantee(g.kind, g.ref, g.permissionLevel));
        // Default each new grantee to ALL labels (the picker's Add is gated until
        // labels have loaded, so the set is known here). Reflect the full scope
        // before the writes so the row shows it immediately.
        const allLabelIds = effectiveLabels.map((l) => l.id);
        const allLabelIdSet = new Set(allLabelIds);
        addedRows.forEach(applyGranteeAdd);
        setSelectedLabelIdsByGrantee((prev) => {
            const next = { ...prev };
            for (const id of addedIds) {
                next[id] = allLabelIds;
            }
            return next;
        });
        closeAddGrantee();

        const ok = await commit(mutations, objectShareMessages.toastGranteeAdded);
        if (!ok) {
            // Roll back the failed adds.
            addedIds.forEach((id) => failGranteeEdit(id));
            setSelectedLabelIdsByGrantee((prev) => {
                const next = { ...prev };
                for (const id of addedIds) {
                    delete next[id];
                }
                return next;
            });
            return;
        }
        // One label write per label carrying all added grantees, not one per grantee.
        const principals = pendingGrantees.map(
            (g): LabelScopePrincipal => ({ kind: g.kind, granteeRef: g.ref }),
        );
        const { ok: labelsOk, failedLabelIds } = await reconcileLabelScope(
            principals,
            allLabelIdSet,
            EMPTY_IDS,
        );
        if (!labelsOk) {
            toast.addWarning(objectShareMessages.toastLabelScopePartial);
            // Drop only the failed labels, keeping those that landed — otherwise local
            // scope under-reports and changeGranteeLabels later skips their revokes.
            const failed = new Set(failedLabelIds);
            const survived = allLabelIds.filter((id) => !failed.has(id));
            setSelectedLabelIdsByGrantee((prev) => {
                const next = { ...prev };
                for (const id of addedIds) {
                    next[id] = survived;
                }
                return next;
            });
        }
        // Settle only now — the add is one logical operation (object grant + label
        // grants), and an unlocked row mid-way would let a remove or label edit race
        // the in-flight label grants. The `added` entries persist (base never had
        // these rows); only the saving marker clears.
        addedIds.forEach((id) => settleGranteeEdit(id));
    }, [
        pendingGrantees,
        commit,
        closeAddGrantee,
        effectiveLabels,
        reconcileLabelScope,
        toast,
        applyGranteeAdd,
        settleGranteeEdit,
        failGranteeEdit,
        setSelectedLabelIdsByGrantee,
    ]);

    const changePermissionLevel = useCallback(
        async (granteeId: string, level: ObjectSharePermissionLevel): Promise<void> => {
            const grantee = grantees.find((g) => g.id === granteeId);
            if (!grantee || grantee.level === level || grantee.pending) {
                return;
            }
            applyGranteeLevel(granteeId, level);
            const ok = await commit(
                [toGranularGrantee(grantee.kind, grantee.granteeRef, level)],
                objectShareMessages.toastAccessUpdated,
            );
            // The settled entry persists on success (base still holds the old level);
            // failure restores the last committed entry, or the fetched row.
            if (ok) {
                settleGranteeEdit(granteeId);
            } else {
                failGranteeEdit(granteeId);
            }
        },
        [grantees, commit, applyGranteeLevel, settleGranteeEdit, failGranteeEdit],
    );

    const removeGrantee = useCallback(
        async (granteeId: string): Promise<void> => {
            const grantee = grantees.find((g) => g.id === granteeId);
            if (!grantee || grantee.pending) {
                return;
            }
            // Mark the row removed but keep it visible (muted) until the write lands.
            applyGranteeRemove(granteeId);
            // Revoke the grantee's per-label grants too — they are independent
            // access-list entries, so the object revoke alone would leave them behind.
            // The revoke runs over the grantee's KNOWN scope: if the object revoke
            // then fails, the compensation re-grants exactly that scope, never labels
            // the grantee didn't hold. The object revoke is what matters; a label
            // revoke that fails is non-fatal (surfaced as a warning), so don't abort
            // on it.
            const { ok, labelsOk } = await applyAccessChange({
                principal: { kind: grantee.kind, granteeRef: grantee.granteeRef },
                objectMutation: toGranularGrantee(grantee.kind, grantee.granteeRef, "none"),
                successMessage: objectShareMessages.toastAccessUpdated,
                labelDesired: EMPTY_IDS,
                labelCurrent: new Set(
                    selectedLabelIdsByGrantee[granteeId] ?? effectiveLabels.map((l) => l.id),
                ),
                abortIfLabelsFail: false,
            });
            if (!ok) {
                // Object revoke failed (applyAccessChange already re-granted the
                // labels) — restore the row.
                failGranteeEdit(granteeId);
                return;
            }
            // Object revoke landed. For a fetched row the settled `removed` entry
            // persists to keep it hidden; a revoked overlay-born row drops entirely.
            settleGranteeEdit(granteeId);
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
            applyAccessChange,
            effectiveLabels,
            selectedLabelIdsByGrantee,
            toast,
            applyGranteeRemove,
            settleGranteeEdit,
            failGranteeEdit,
            setSelectedLabelIdsByGrantee,
        ],
    );

    const changeGranteeLabels = useCallback(
        async (granteeId: string, requested: string[]): Promise<void> => {
            const grantee = grantees.find((g) => g.id === granteeId);
            if (!grantee || grantee.pending || !target) {
                return;
            }
            // Primary label is always in scope; never let it be dropped.
            const primaryIds = effectiveLabels.filter((l) => l.isPrimary).map((l) => l.id);
            const nextScope = Array.from(new Set([...requested, ...primaryIds]));
            const currentScope = selectedLabelIdsByGrantee[granteeId] ?? effectiveLabels.map((l) => l.id);
            const desired = new Set(nextScope);
            const current = new Set(currentScope);
            // Applying the checklist unchanged is a no-op — don't lock the row or
            // toast success over zero writes.
            if (desired.size === current.size && nextScope.every((id) => current.has(id))) {
                return;
            }

            // Reflect the new scope immediately and lock the row until the writes
            // settle — an overlapping label edit or removal would race these writes
            // on the same labels. The lock reuses the level overlay at the unchanged
            // level; pending is the only fact it adds.
            applyGranteeLevel(granteeId, grantee.level);
            setSelectedLabelIdsByGrantee((prev) => ({ ...prev, [granteeId]: nextScope }));

            const { ok, failedLabelIds } = await reconcileLabelScope(
                [{ kind: grantee.kind, granteeRef: grantee.granteeRef }],
                desired,
                current,
            );
            if (ok) {
                settleGranteeEdit(granteeId);
                toast.addSuccess(objectShareMessages.toastAccessUpdated);
                return;
            }
            failGranteeEdit(granteeId);
            // Label writes settle independently: keep what landed and flip only the
            // failed labels back, so the local scope matches the backend exactly —
            // restoring the whole previous scope would un-track the writes that
            // succeeded, and later edits would diff against a false state.
            const failed = new Set(failedLabelIds);
            const landedScope = Array.from(new Set([...nextScope, ...currentScope])).filter((id) =>
                (failed.has(id) ? current : desired).has(id),
            );
            setSelectedLabelIdsByGrantee((prev) => ({ ...prev, [granteeId]: landedScope }));
            const anyLanded =
                landedScope.length !== currentScope.length || landedScope.some((id) => !current.has(id));
            if (anyLanded) {
                toast.addWarning(objectShareMessages.toastLabelScopePartial);
            } else {
                toast.addError(objectShareMessages.toastError);
            }
        },
        [
            grantees,
            target,
            effectiveLabels,
            selectedLabelIdsByGrantee,
            reconcileLabelScope,
            toast,
            applyGranteeLevel,
            settleGranteeEdit,
            failGranteeEdit,
            setSelectedLabelIdsByGrantee,
        ],
    );

    // ── Workspace-rule mutations (general access + rule level) ───────────────────

    const requestGeneralAccessChange = useCallback(
        (next: GeneralAccessValue) => {
            // Inherited rule access can't be revoked from this workspace, so a
            // Restricted request can never be honored — refuse it (the radio row
            // is also disabled). Compare against the effective value the radio
            // shows: with inherited access it is WORKSPACE even when this
            // workspace holds no rule of its own.
            if (workspaceInheritedLevel && next === "RESTRICTED") {
                return;
            }
            const effective = workspaceInheritedLevel ? "WORKSPACE" : generalAccess;
            if (next !== effective) {
                setPendingGeneralAccess(next);
            }
        },
        [generalAccess, workspaceInheritedLevel],
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
        // Apply the new value and close the confirm at once — the radio + summary
        // reflect `next` immediately; the write commits in the background. The
        // workspace rule is always written as VIEW, so reflect VIEW now too —
        // otherwise the summary would keep a SHARE level left over from the fetch.
        // PENDING until the whole labels+object save settles: the radio and the
        // level menu must stay locked, or a re-grade started meanwhile would race
        // this save on the same allWorkspaceUsers rule and could land first, letting
        // the delayed VIEW write downgrade what the UI shows.
        const nextLevel: ObjectSharePermissionLevel = next === "WORKSPACE" ? "VIEW" : workspaceLevel;
        applyRuleEdit({ generalAccess: next, level: nextLevel, pending: true });
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
        if (ok) {
            settleRuleEdit();
        } else {
            // Labels or object write failed (applyAccessChange already undid the
            // label mirror) — revert to the last committed rule state, or the fetch.
            // The label-abort path produced no toast, so surface the error here; a
            // failed object write already toasted via commit, so don't double up.
            failRuleEdit();
            if (!labelsOk) {
                toast.addError(objectShareMessages.toastError);
            }
        }
    }, [
        pendingGeneralAccess,
        generalAccess,
        workspaceLevel,
        workspaceLevelSaving,
        applyAccessChange,
        effectiveLabels,
        toast,
        applyRuleEdit,
        settleRuleEdit,
        failRuleEdit,
    ]);

    const changeWorkspaceLevel = useCallback(
        async (level: ObjectSharePermissionLevel): Promise<void> => {
            // The dropdown displays the EFFECTIVE level (direct composed with
            // inherited), so no-ops must be judged against it: with an inherited
            // SHARE over a direct VIEW the menu shows SHARE checked, and clicking
            // it must not silently escalate the persisted direct rule to SHARE.
            const effectiveLevel = effectiveWorkspace.workspaceLevel;
            // Only re-grade an already-granted workspace rule; ignore no-ops, calls made
            // while this workspace grants no rule of its own (inherited-only access has
            // nothing to re-grade), calls for levels below an inherited one (a direct
            // downgrade couldn't lower the effective level), and re-entry while a
            // previous re-grade is still in flight (would overlap writes).
            if (
                generalAccess !== "WORKSPACE" ||
                levelsBelow(workspaceInheritedLevel ?? "VIEW").includes(level) ||
                level === effectiveLevel ||
                workspaceLevelSaving
            ) {
                return;
            }
            // Labels are untouched — already mirrored when workspace access was granted;
            // this only re-grades the rule's permission level.
            applyRuleEdit({ generalAccess: "WORKSPACE", level, pending: true });
            const ok = await commit(
                [granularGranteeFor({ allWorkspaceUsers: true }, level)],
                objectShareMessages.toastGeneralAccessUpdated,
            );
            if (ok) {
                settleRuleEdit();
            } else {
                failRuleEdit();
            }
        },
        [
            generalAccess,
            workspaceInheritedLevel,
            effectiveWorkspace,
            workspaceLevelSaving,
            commit,
            applyRuleEdit,
            settleRuleEdit,
            failRuleEdit,
        ],
    );

    // ── Assembly: actions + state view exposed to consumers ──────────────────────

    const actions = useMemo<IObjectShareControllerActions>(
        () => ({
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

    // Sorted for display only; the overlay stays in write-through order, so
    // add/rollback logic is unaffected. Memoized apart from the state assembly so
    // the array identity changes only when the rows do, not on every state change.
    const sortedGrantees = useMemo(() => sortGrantees(grantees), [grantees]);

    const state = useMemo<IObjectShareControllerState>(() => {
        // Row policy is classified here, not in the dialog, so a consumer
        // injecting this controller into its own UI gets the same classification.
        const selfManagedGranteeId = grantees.length === 1 && grantees[0].isSelf ? grantees[0].id : undefined;
        const granteeControlsLocked =
            grantees.length === 1 && grantees[0].kind === "user" && !selfIdentityResolved;
        // A workspace-wide share-capable rule (SHARE or EDIT) is the one way other
        // than admin/manager rights through the manage gate — no Admin badge then.
        const workspaceShareCapable =
            effectiveWorkspace.generalAccess === "WORKSPACE" && effectiveWorkspace.workspaceLevel !== "VIEW";
        // The synthesized Admin row shows only while NO other permissions are set:
        // the caller must have reached the list without a grant of their own
        // (`seededWithoutSelfGrant` — a non-admin who locally removes their own
        // grant must not gain the badge) and the list must currently be empty, so
        // adding a grantee hides it and removing the last one brings it back.
        const adminSelfRow =
            status === "success" &&
            seededWithoutSelfGrant &&
            grantees.length === 0 &&
            !workspaceShareCapable &&
            selfIdentity
                ? userDisplayPair(selfIdentity, selfIdentity.id)
                : undefined;
        return {
            subview,
            status,
            error: loadError,
            summary,
            grantees: sortedGrantees,
            selfManagedGranteeId,
            // Policy, not just classification: the caller's own sole row can't be
            // raised above itself, an inherited workspace level can't be undercut.
            selfManagedDisabledLevels: selfManagedGranteeId ? levelsAbove(grantees[0].level) : undefined,
            workspaceDisabledLevels: workspaceInheritedLevel
                ? levelsBelow(workspaceInheritedLevel)
                : undefined,
            granteeControlsLocked,
            adminSelfRow,
            ...effectiveWorkspace,
            workspaceInheritedLevel: workspaceInheritedLevel,
            workspaceLevelLocked: generalAccess !== "WORKSPACE" || workspaceInheritedLevel === "EDIT",
            workspaceLevelSaving,
            labels: effectiveLabels,
            labelsResolved,
            labelsInitializing,
            selectedLabelIdsByGrantee,
            pendingGeneralAccess,
            pendingGrantees,
        };
    }, [
        subview,
        status,
        loadError,
        summary,
        selfIdentity,
        selfIdentityResolved,
        seededWithoutSelfGrant,
        grantees,
        sortedGrantees,
        effectiveWorkspace,
        generalAccess,
        workspaceInheritedLevel,
        workspaceLevelSaving,
        effectiveLabels,
        labelsResolved,
        labelsInitializing,
        selectedLabelIdsByGrantee,
        pendingGeneralAccess,
        pendingGrantees,
    ]);

    return useMemo(() => ({ state, actions }), [state, actions]);
}
