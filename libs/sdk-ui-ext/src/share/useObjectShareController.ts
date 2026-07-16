// (C) 2026 GoodData Corporation

import { useCallback, useMemo, useRef, useState } from "react";

import type { IObjectPermissionsObject } from "@gooddata/sdk-backend-spi";
import { type IGranularAccessGrantee, type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";
import {
    type GeneralAccessValue,
    type IUiGranteeAsyncOption,
    type IUiPickedGrantee,
    useToastMessage,
} from "@gooddata/sdk-ui-kit";

import { composeEffectiveWorkspaceAccess } from "./accessSummary.js";
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
 * the dialog. Grantee rows carry identity facts only (`name`/`email` are undefined
 * when unknown); the display fallback order is not exposed, so {@link ObjectShareDialog}
 * is the only sanctioned row renderer.
 *
 * @internal
 */
export function useObjectShareController(
    target: IObjectPermissionsObject | undefined,
    options?: IUseObjectShareOptions,
): IObjectShareController {
    const {
        onSaved,
        labels = NO_LABELS,
        labelsError = false,
        labelsLoading = false,
        isOpen = false,
    } = options ?? {};
    const toast = useToastMessage();

    // UI-local buffers — never backend data.
    const [subview, setSubview] = useState<"main" | "addGrantee" | "transferOwnership">("main");
    const [pendingGrantees, setPendingGrantees] = useState<IUiPickedGrantee[]>([]);
    const [pendingGeneralAccess, setPendingGeneralAccess] = useState<GeneralAccessValue | undefined>(
        undefined,
    );
    // Transfer-ownership buffers. Cleared on close and on target switch.
    const [transferTarget, setTransferTargetState] = useState<IUiGranteeAsyncOption | undefined>(undefined);
    const [transferAlsoRemoveSelf, setTransferAlsoRemoveSelf] = useState(false);
    const [transferSaving, setTransferSaving] = useState(false);
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
        inheritedWorkspaceLevel,
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
    } = useAccessList(target, onSaved, isOpen);

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
        reconcileLabelScopeMany,
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
        setTransferTargetState(undefined);
        setTransferAlsoRemoveSelf(false);
        setTransferSaving(false);
    }

    const reset = useCallback(() => {
        setSubview("main");
        setPendingGrantees([]);
        setPendingGeneralAccess(undefined);
        setWorkspaceLevelSaving(false);
        setTransferTargetState(undefined);
        setTransferAlsoRemoveSelf(false);
        // Deliberately NOT clearing transferSaving here: closing the dialog must not
        // release the transfer lock while the write is still in flight, or a reopened
        // dialog could mutate concurrently with the unfinished transfer. The in-flight
        // confirmTransferOwnership clears it itself once the write settles.
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
        // Insert the picked grantees as pending rows. Identity facts are not copied
        // from the picker option (its name/email are display fallbacks, not facts) —
        // rows render from the facts cache the picker fetch already populated.
        const addedIds = pendingGrantees.map((g) => g.id);
        const addedRows = pendingGrantees.map(
            (g): IObjectShareGrantee => ({
                id: g.id,
                kind: g.kind,
                granteeRef: refForId(g.id),
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

        // One label write per label carrying all added grantees, not one per grantee.
        const principals = pendingGrantees.map(
            (g): LabelScopePrincipal => ({ kind: g.kind, granteeRef: refForId(g.id) }),
        );
        const { ok: labelsOk, failedLabelIds } = await reconcileLabelScopeMany(
            principals,
            allLabelIdSet,
            EMPTY_IDS,
        );
        if (targetKeyRef.current !== startedFor) {
            return;
        }
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
    }, [
        pendingGrantees,
        targetKey,
        commit,
        closeAddGrantee,
        effectiveLabels,
        reconcileLabelScopeMany,
        refForId,
        toast,
        setGrantees,
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
            // Inherited rule access can't be revoked from this workspace, so a
            // Restricted request can never be honored — refuse it (the radio row
            // is also disabled). Compare against the effective value the radio
            // shows: with inherited access it is WORKSPACE even when this
            // workspace holds no rule of its own.
            if (inheritedWorkspaceLevel && next === "RESTRICTED") {
                return;
            }
            const effective = inheritedWorkspaceLevel ? "WORKSPACE" : generalAccess;
            if (next !== effective) {
                setPendingGeneralAccess(next);
            }
        },
        [generalAccess, inheritedWorkspaceLevel],
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
            // while this workspace grants no rule of its own (inherited-only access has
            // nothing to re-grade), calls while an inherited SHARE pins the effective
            // level (a direct downgrade couldn't change it), and re-entry while a
            // previous re-grade is still in flight (would overlap writes).
            if (
                generalAccess !== "WORKSPACE" ||
                inheritedWorkspaceLevel === "SHARE" ||
                level === workspaceLevel ||
                workspaceLevelSaving
            ) {
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
        [
            generalAccess,
            inheritedWorkspaceLevel,
            workspaceLevel,
            workspaceLevelSaving,
            targetKey,
            commit,
            setWorkspaceLevel,
        ],
    );

    const openTransferOwnership = useCallback(() => {
        setSubview("transferOwnership");
        setTransferTargetState(undefined);
        setTransferAlsoRemoveSelf(false);
    }, []);

    const closeTransferOwnership = useCallback(() => {
        setSubview("main");
        setTransferTargetState(undefined);
        setTransferAlsoRemoveSelf(false);
    }, []);

    const setTransferTarget = useCallback((owner: IUiGranteeAsyncOption) => {
        setTransferTargetState(owner);
    }, []);

    // The picked user already owns the object when a grantee row for them holds
    // EDIT — then there's nothing to transfer (the dialog offers to remove the
    // current user's own access instead).
    const transferTargetIsOwner = useMemo(
        () =>
            transferTarget ? grantees.some((g) => g.id === transferTarget.id && g.level === "EDIT") : false,
        [transferTarget, grantees],
    );

    // Insert a brand-new grantee row with its label scope — the shared seed for a
    // freshly-granted principal (used when a transfer promotes a user who wasn't
    // already a grantee; the same row shape the add flow creates). Identity
    // renders from the facts cache.
    const seedNewGranteeRow = useCallback(
        (row: IObjectShareGrantee, labelIds: string[]) => {
            setGrantees((prev) => [...prev, row]);
            setSelectedLabelIdsByGrantee((prev) => ({ ...prev, [row.id]: labelIds }));
        },
        [setGrantees, setSelectedLabelIdsByGrantee],
    );

    const confirmTransferOwnership = useCallback(async (): Promise<void> => {
        if (!transferTarget || transferSaving) {
            return;
        }
        const startedFor = targetKey;
        const ownerRef = refForId(transferTarget.id);

        let selfRef: ObjRef;
        try {
            selfRef = await getCurrentUserRef();
        } catch {
            toast.addError(objectShareMessages.toastError);
            return;
        }
        if (targetKeyRef.current !== startedFor) {
            return;
        }
        // Guard against transferring to yourself: the picker's loader already
        // excludes the current user, but if a backend ever returned self the batch
        // below would emit conflicting grants for one ref (EDIT + VIEW/none). Bail
        // and just close — there is nothing to transfer to oneself.
        if (areObjRefsEqual(ownerRef, selfRef)) {
            closeTransferOwnership();
            return;
        }

        // Build the write. A real transfer grants the picked user EDIT and changes
        // the current user's own grant: kept as VIEW by default, or removed when
        // "Also remove my access" is set. When the picked user already owns the
        // object there's nothing to transfer — only the self-access choice applies,
        // and "keep" is then a pure no-op (don't downgrade an existing owner-self to
        // VIEW just for confirming).
        const mutations: IGranularAccessGrantee[] = [];
        if (!transferTargetIsOwner) {
            mutations.push(toGranularGrantee("user", ownerRef, "EDIT"));
            mutations.push(toGranularGrantee("user", selfRef, transferAlsoRemoveSelf ? "none" : "VIEW"));
        } else if (transferAlsoRemoveSelf) {
            mutations.push(toGranularGrantee("user", selfRef, "none"));
        }
        if (mutations.length === 0) {
            closeTransferOwnership();
            return;
        }

        // Whether the new owner already has a grantee row (was granted before this
        // transfer). A brand-new owner needs a row seeded and their labels mirrored,
        // exactly like the add-grantee flow; an existing grantee already has both.
        const existingOwnerRow = transferTargetIsOwner
            ? undefined
            : grantees.find((g) => g.id === transferTarget.id);
        const ownerIsNew = !transferTargetIsOwner && !existingOwnerRow;
        const allLabelIds = effectiveLabels.map((l) => l.id);

        setTransferSaving(true);

        // "Ownership transferred" only when ownership actually moves; the
        // already-owner path just changes the current user's own access.
        const successMessage = transferTargetIsOwner
            ? objectShareMessages.toastAccessUpdated
            : objectShareMessages.toastOwnershipTransferred;
        const ok = await commit(mutations, successMessage);
        if (targetKeyRef.current !== startedFor) {
            return;
        }
        if (!ok) {
            setTransferSaving(false);
            return;
        }

        // Mirror per-label grants for the same reason add/remove do: label
        // permissions are independent access-list entries, so the object write
        // alone would leave a new owner without label access, or leave a removed
        // self with orphaned label grants. A failed label write is non-fatal here
        // (the object grant is what matters) — surfaced as a warning, like remove.
        //
        // Do every backend label write first, then apply all local state behind a
        // single target guard. Since no local write happens before that guard, a
        // target switch during a label await can't land a half-applied transfer on
        // the next object's seeded list — unlike the optimistic finalizers, which
        // write before committing and so must re-guard after each await.
        let labelsOk = true;
        if (ownerIsNew) {
            // Grant the brand-new owner every label — the add-grantee default scope.
            const granted = await reconcileLabelScope(
                { kind: "user", granteeRef: ownerRef },
                new Set(allLabelIds),
                EMPTY_IDS,
            );
            labelsOk = labelsOk && granted;
        }
        if (transferAlsoRemoveSelf) {
            // Self lost object access — revoke their per-label grants too.
            const revoked = await reconcileLabelScope(
                { kind: "user", granteeRef: selfRef },
                EMPTY_IDS,
                new Set(allLabelIds),
            );
            labelsOk = labelsOk && revoked;
        }
        if (targetKeyRef.current !== startedFor) {
            return;
        }

        // Reflect the object-grant changes locally (authoritative, no refetch).
        if (!transferTargetIsOwner) {
            const nextEffective = effectivePermissionAbove("EDIT", []);
            if (ownerIsNew) {
                seedNewGranteeRow(
                    {
                        id: transferTarget.id,
                        kind: "user",
                        granteeRef: ownerRef,
                        level: "EDIT",
                        effectivePermission: nextEffective,
                    },
                    allLabelIds,
                );
            } else {
                // Existing grantee: their label scope is unchanged by an
                // object-level promotion, so only the row's level is raised.
                setGrantees((prev) =>
                    prev.map((g) =>
                        g.id === transferTarget.id
                            ? { ...g, level: "EDIT", effectivePermission: nextEffective }
                            : g,
                    ),
                );
            }
        }
        // The current user may have their own grantee row (the access list keeps
        // every grant, including self) — reflect their object-grant change locally
        // too: dropped when "remove my access", otherwise downgraded to VIEW. Match
        // by ref since self isn't tied to a picker-derived row id.
        setGrantees((prev) =>
            transferAlsoRemoveSelf
                ? prev.filter((g) => !areObjRefsEqual(g.granteeRef, selfRef))
                : prev.map((g) =>
                      areObjRefsEqual(g.granteeRef, selfRef)
                          ? { ...g, level: "VIEW", effectivePermission: undefined }
                          : g,
                  ),
        );
        if (!labelsOk) {
            toast.addWarning(objectShareMessages.toastLabelScopePartial);
        }
        setTransferSaving(false);
        closeTransferOwnership();
    }, [
        transferTarget,
        transferSaving,
        transferTargetIsOwner,
        transferAlsoRemoveSelf,
        targetKey,
        grantees,
        effectiveLabels,
        refForId,
        getCurrentUserRef,
        commit,
        reconcileLabelScope,
        toast,
        setGrantees,
        seedNewGranteeRow,
        closeTransferOwnership,
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
            changeWorkspaceLevel,
            openTransferOwnership,
            closeTransferOwnership,
            setTransferTarget,
            setTransferAlsoRemoveSelf,
            confirmTransferOwnership,
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
            openTransferOwnership,
            closeTransferOwnership,
            setTransferTarget,
            confirmTransferOwnership,
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
            // Effective access: the direct state composed with inherited rule
            // access. Also pins the level to VIEW while restricted, so the (hidden)
            // dropdown never shows a stale SHARE left over from a prior grant.
            ...composeEffectiveWorkspaceAccess(generalAccess, workspaceLevel, inheritedWorkspaceLevel),
            workspaceAccessInherited: inheritedWorkspaceLevel !== undefined,
            // No direct rule to re-grade (inherited-only access), or an inherited
            // SHARE pins the effective level — either way the dropdown is read-only.
            workspaceLevelLocked: generalAccess !== "WORKSPACE" || inheritedWorkspaceLevel === "SHARE",
            workspaceLevelSaving,
            labels: effectiveLabels,
            labelsResolved,
            selectedLabelIdsByGrantee,
            pendingGeneralAccess,
            pendingGrantees,
            transferTarget,
            transferAlsoRemoveSelf,
            transferTargetIsOwner,
            transferSaving,
            canTransferOwnership,
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
            inheritedWorkspaceLevel,
            workspaceLevelSaving,
            effectiveLabels,
            labelsResolved,
            selectedLabelIdsByGrantee,
            pendingGeneralAccess,
            pendingGrantees,
            transferTarget,
            transferAlsoRemoveSelf,
            transferTargetIsOwner,
            transferSaving,
            canTransferOwnership,
        ],
    );

    return useMemo(() => ({ state, actions }), [state, actions]);
}
