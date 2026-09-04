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
    changesEffectiveLevel,
    granularGranteeFor,
    levelsAbove,
    levelsBelow,
    mergeDisabledLevels,
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
    const {
        labels = NO_LABELS,
        labelsError = false,
        labelsLoading = false,
        draft = false,
        initialDraft,
        initialDraftGeneralAccess,
    } = options ?? {};
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
        seededRuleShareCapable,
        selfIdentity,
        isWorkspaceManager,
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
        draft: draftValue,
    } = useAccessList(target, { draft, initialDraft, initialDraftGeneralAccess });

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
    // Label grants are written as they change, which a draft cannot allow. Reporting none
    // switches that path off; labels never resolve without a target and would lock the UI.
    const draftLabels = draft ? NO_LABELS : labels;
    // The flags go with the labels: either left true would disable every control forever.
    const draftLabelsError = draft ? false : labelsError;
    const draftLabelsLoading = draft ? false : labelsLoading;

    const {
        effectiveLabels,
        labelsResolved,
        labelsInitializing,
        selectedLabelIdsByGrantee,
        setSelectedLabelIdsByGrantee,
        inheritedLabelIdsByGrantee,
        directLabelIdsByGrantee,
        recordDirectLabelWrites,
        forgetGranteeLabels,
        reconcileLabelScope,
        reconcileLabelScopes,
        regradeLabelScope,
    } = useLabelScope(
        target,
        draftLabels,
        hasList,
        committedGranteeIds,
        draftLabelsError,
        draftLabelsLoading,
    );

    // The labels THIS workspace granted — the only ones a write may touch. Read straight
    // from the tracked direct set rather than subtracting "inherited" from the scope: the
    // subtraction relied on the probe still describing our own grants, and after a revoke it
    // did not, so a later re-grade re-created access that had just been removed. A label
    // held by inheritance ALONE is absent here, so no write can reach it: revoking one is a
    // no-op whose compensation could mint a real grant, and re-grading one would invent one.
    // A dual-granted label IS here — its local grant is ours to revoke and re-grade, or it
    // would outlive the inherited grant hiding it.
    const directLabelScopeOf = useCallback(
        (granteeId: string): ReadonlySet<string> =>
            new Set(directLabelIdsByGrantee[granteeId] ?? effectiveLabels.map((l) => l.id)),
        [directLabelIdsByGrantee, effectiveLabels],
    );

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
        }): Promise<{ ok: boolean; labelsOk: boolean; failedLabelIds: string[] }> => {
            const { principal, objectMutation, successMessage, labelDesired, labelCurrent } = params;
            const { ok: labelsOk, failedLabelIds } = await reconcileLabelScope(
                [principal],
                labelDesired,
                labelCurrent,
            );
            if (!labelsOk && params.abortIfLabelsFail) {
                // Don't write the object on a half-applied label scope: undo whatever
                // mirrored and surface the failure to the caller.
                await reconcileLabelScope([principal], labelCurrent, labelDesired);
                return { ok: false, labelsOk: false, failedLabelIds };
            }
            const ok = await commit([objectMutation], successMessage);
            if (!ok) {
                // Object write failed — undo the label mirror so labels and object
                // don't drift.
                await reconcileLabelScope([principal], labelCurrent, labelDesired);
            }
            // The failed ids are reported, not just counted: a caller that keeps the row
            // must keep those labels in its scope, or the local state would claim access
            // the backend still grants and a later edit would diff against a lie.
            return { ok, labelsOk, failedLabelIds };
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
        const addedRows = pendingGrantees.map((g): IObjectShareGrantee => ({
            id: g.id,
            kind: g.kind,
            granteeRef: g.ref,
            name: g.name,
            email: g.email,
            level: g.permissionLevel,
            // The add writes a grant in THIS workspace, so the new row holds a
            // direct grant at the picked level — without it the row would read as
            // inherited-only and its Remove would be (correctly) refused.
            directLevel: g.permissionLevel,
        }));
        const mutations = pendingGrantees.map((g) => toGranularGrantee(g.kind, g.ref, g.permissionLevel));
        // Each grantee is granted the label scope picked in the add dialog; an
        // untouched picker leaves it undefined, which means ALL labels (the picker's
        // Add is gated until labels have loaded, so the set is known here). The
        // primary label is always in scope, exactly as `changeGranteeLabels` keeps it.
        // Reflect each scope before the writes so the rows show them immediately.
        const allLabelIds = effectiveLabels.map((l) => l.id);
        const primaryLabelIds = effectiveLabels.filter((l) => l.isPrimary).map((l) => l.id);
        const scopeById = new Map(
            pendingGrantees.map(
                (g) =>
                    [
                        g.id,
                        g.labelIds === undefined
                            ? allLabelIds
                            : Array.from(new Set([...g.labelIds, ...primaryLabelIds])),
                    ] as const,
            ),
        );
        addedRows.forEach(applyGranteeAdd);
        setSelectedLabelIdsByGrantee((prev) => {
            const next = { ...prev };
            for (const id of addedIds) {
                next[id] = scopeById.get(id)!;
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
        // One label write per label carrying all added grantees, not one per grantee —
        // even when their scopes differ, so a shared label stays a single call. Each
        // label grant carries that grantee's picked level, so the label mirrors the
        // object grant instead of landing on VIEW.
        const { ok: labelsOk, failedLabelIds } = await reconcileLabelScopes(
            pendingGrantees.map((g) => ({
                principal: { kind: g.kind, granteeRef: g.ref, level: g.permissionLevel },
                desiredLabelIds: new Set(scopeById.get(g.id)!),
                currentLabelIds: EMPTY_IDS,
            })),
        );
        const failed = new Set(failedLabelIds);
        // Every label grant that landed is now a grant of OURS — record it, or a later
        // removal would not know to revoke it.
        for (const id of addedIds) {
            recordDirectLabelWrites(
                id,
                scopeById.get(id)!.filter((labelId) => !failed.has(labelId)),
                [],
            );
        }
        if (!labelsOk) {
            toast.addWarning(objectShareMessages.toastLabelScopePartial);
            // Drop only the failed labels from each grantee's own scope, keeping those
            // that landed — otherwise local scope under-reports and changeGranteeLabels
            // later skips their revokes.
            setSelectedLabelIdsByGrantee((prev) => {
                const next = { ...prev };
                for (const id of addedIds) {
                    next[id] = scopeById.get(id)!.filter((labelId) => !failed.has(labelId));
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
        reconcileLabelScopes,
        recordDirectLabelWrites,
        toast,
        applyGranteeAdd,
        settleGranteeEdit,
        failGranteeEdit,
        setSelectedLabelIdsByGrantee,
    ]);

    const changePermissionLevel = useCallback(
        async (granteeId: string, level: ObjectSharePermissionLevel): Promise<void> => {
            const grantee = grantees.find((g) => g.id === granteeId);
            // A pick that cannot move the effective level is refused rather than quietly
            // strengthening the grant made here — the rule lives in `changesEffectiveLevel`
            // so every reaction to a pick agrees, and no confirm is staged for a no-op.
            // Also refused before the label scope resolves: the re-grade below would run
            // over the assumed-all fallback and mint grants the grantee never held. The
            // UI gates on the same fact (isMutable); the controller stays authoritative.
            if (!grantee || grantee.pending || !labelsResolved || !changesEffectiveLevel(grantee, level)) {
                return;
            }
            applyGranteeLevel(granteeId, level);
            // A label grant is an independent access-list entry carrying its own
            // level, so re-grading the object alone would leave the grantee's labels
            // at the level they were granted at.
            //
            // Order so a label grant is never left above the object grant: lower the
            // labels BEFORE lowering the object, and raise the object BEFORE raising
            // the labels. Either way a failure leaves labels no broader than the
            // object, and a failed object write puts the labels back.
            const previousLevel = grantee.directLevel ?? grantee.level;
            const lowering = levelsBelow(previousLevel).includes(level);
            const scope = directLabelScopeOf(granteeId);
            const regradeLabels = (to: ObjectSharePermissionLevel) =>
                regradeLabelScope([{ kind: grantee.kind, granteeRef: grantee.granteeRef, level: to }], scope);

            let labelsOk = true;
            if (lowering) {
                labelsOk = (await regradeLabels(level)).ok;
                if (!labelsOk) {
                    // A label that kept the old, HIGHER level while the object dropped
                    // would leave label access above object access — the one state this
                    // ordering exists to prevent. So abort: put every in-scope label back
                    // and leave the object alone. Same all-or-nothing policy the
                    // general-access change applies to its label mirror.
                    await regradeLabels(previousLevel);
                    failGranteeEdit(granteeId);
                    toast.addError(objectShareMessages.toastError);
                    return;
                }
            }
            const ok = await commit(
                [toGranularGrantee(grantee.kind, grantee.granteeRef, level)],
                objectShareMessages.toastAccessUpdated,
            );
            // The settled entry persists on success (base still holds the old level);
            // failure restores the last committed entry, or the fetched row.
            if (!ok) {
                if (lowering) {
                    await regradeLabels(previousLevel);
                }
                failGranteeEdit(granteeId);
                return;
            }
            if (!lowering) {
                labelsOk = (await regradeLabels(level)).ok;
            }
            settleGranteeEdit(granteeId);
            if (!labelsOk) {
                // The object level changed but some labels kept the old one — warn so
                // the partial state isn't mistaken for success.
                toast.addWarning(objectShareMessages.toastLabelScopePartial);
            }
        },
        [
            grantees,
            labelsResolved,
            commit,
            directLabelScopeOf,
            regradeLabelScope,
            toast,
            applyGranteeLevel,
            settleGranteeEdit,
            failGranteeEdit,
        ],
    );

    const removeGrantee = useCallback(
        async (granteeId: string): Promise<void> => {
            const grantee = grantees.find((g) => g.id === granteeId);
            // Only a grant made in THIS workspace can be revoked here. With access
            // inherited-only (a group, or a parent workspace) there is nothing local
            // to revoke: the write would be an empty-permissions no-op that the row
            // then reported as removed. The menu also disables Remove in that case;
            // this keeps the controller — not the UI — authoritative. Same for an
            // unresolved label scope: the revoke below would run over the assumed-all
            // fallback and revoke (then compensate with) grants that never existed.
            if (!grantee || grantee.pending || !labelsResolved || grantee.directLevel === undefined) {
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
            const { ok, labelsOk, failedLabelIds } = await applyAccessChange({
                // The level matters only for the compensating re-grant if the object
                // revoke fails: without it the labels would come back at the default
                // VIEW, quietly downgrading an EDIT/SHARE grantee we just failed to
                // remove.
                principal: {
                    kind: grantee.kind,
                    granteeRef: grantee.granteeRef,
                    level: grantee.directLevel,
                },
                objectMutation: toGranularGrantee(grantee.kind, grantee.granteeRef, "none"),
                successMessage: objectShareMessages.toastAccessUpdated,
                labelDesired: EMPTY_IDS,
                labelCurrent: directLabelScopeOf(granteeId),
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
            // Every local label grant is gone except the ones whose revoke failed — record
            // that, so a later write on a surviving row cannot act on grants we removed.
            const revokedIds = [...directLabelScopeOf(granteeId)].filter(
                (id) => !failedLabelIds.includes(id),
            );
            recordDirectLabelWrites(granteeId, [], revokedIds);
            if (grantee.inheritedLevel === undefined) {
                // Row is gone for good; drop its bookkeeping — unless a label revoke
                // failed. The direct set is then the ONLY record that the label is still
                // granted (the probe never re-runs), and forgetting it would let the
                // grant outlive a same-session re-add: reseeded from the new writes
                // alone, no later diff would ever revoke it.
                if (failedLabelIds.length === 0) {
                    forgetGranteeLabels(granteeId);
                }
            } else {
                // A grantee who also inherits survives as an inherited-only row, so its
                // scope must survive too — narrowed to what the removal could not take away.
                // Dropping the entry would fall back to "all labels" (the probe does not
                // re-run for grantee changes) and overstate what they can reach. Any label
                // whose revoke FAILED stays in: the backend still grants it.
                setSelectedLabelIdsByGrantee((prev) => {
                    const keep = new Set([
                        ...(inheritedLabelIdsByGrantee[granteeId] ?? []),
                        ...failedLabelIds,
                    ]);
                    const survivingIds = effectiveLabels
                        .filter((l) => l.isPrimary || keep.has(l.id))
                        .map((l) => l.id);
                    return { ...prev, [granteeId]: survivingIds };
                });
            }
            if (!labelsOk) {
                // Object access is gone but some per-label grants couldn't be
                // revoked — warn so the leftover scope isn't mistaken for success.
                toast.addWarning(objectShareMessages.toastLabelScopePartial);
            }
        },
        [
            grantees,
            labelsResolved,
            applyAccessChange,
            directLabelScopeOf,
            recordDirectLabelWrites,
            forgetGranteeLabels,
            effectiveLabels,
            inheritedLabelIdsByGrantee,
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
            // Refused before the label scope resolves — the diff below would otherwise
            // run against the assumed-all fallback (the UI gates on the same fact via
            // `isMutable`; the controller stays authoritative).
            if (!grantee || grantee.pending || !labelsResolved || !target) {
                return;
            }
            // The primary label is always in scope, and so is a label the grantee only
            // inherits: there is no local grant to revoke, so dropping it would report
            // access removed that this workspace cannot reach. The checklist locks both;
            // this keeps the controller — not the UI — authoritative.
            const primaryIds = effectiveLabels.filter((l) => l.isPrimary).map((l) => l.id);
            const inheritedIds = inheritedLabelIdsByGrantee[granteeId] ?? [];
            const nextScope = Array.from(new Set([...requested, ...primaryIds, ...inheritedIds]));
            const currentScope = selectedLabelIdsByGrantee[granteeId] ?? effectiveLabels.map((l) => l.id);
            const desired = new Set(nextScope);
            // Inherited labels join the CURRENT side too: an add-path scope is seeded
            // before inheritance is known for the new row, so without this an untouched
            // Apply would diff an inherited label as newly checked and grant it locally.
            const current = new Set([...currentScope, ...inheritedIds]);
            // Applying the checklist unchanged is a no-op — don't lock the row or
            // toast success over zero writes.
            if (desired.size === current.size && nextScope.every((id) => current.has(id))) {
                return;
            }

            // Reflect the new scope immediately and lock the row until the writes
            // settle — an overlapping label edit or removal would race these writes on
            // the same labels. A lock-only overlay, because this changes no object
            // access: re-applying the displayed level would persist the EFFECTIVE level
            // as this row's direct grant, so an inherited EDIT over a direct VIEW would
            // become a local EDIT after any label edit.
            applyGranteeLock(granteeId);
            setSelectedLabelIdsByGrantee((prev) => ({ ...prev, [granteeId]: nextScope }));

            // Labels newly brought into scope are granted at the level the grantee
            // holds on the object — with no grant of their own here (inherited-only
            // access) there is no level to mirror, so VIEW stands.
            const { ok, failedLabelIds } = await reconcileLabelScope(
                [
                    {
                        kind: grantee.kind,
                        granteeRef: grantee.granteeRef,
                        level: grantee.directLevel ?? "VIEW",
                    },
                ],
                desired,
                current,
            );
            // Record what the writes actually did to OUR grants: a label brought into scope
            // gains one, a label dropped loses one. Only over the labels this workspace could
            // write — an inherited-only label is absent from the diff either way.
            const failedIds = new Set(failedLabelIds);
            const writable = directLabelScopeOf(granteeId);
            recordDirectLabelWrites(
                granteeId,
                nextScope.filter((id) => !current.has(id) && !failedIds.has(id)),
                currentScope.filter((id) => writable.has(id) && !desired.has(id) && !failedIds.has(id)),
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
            labelsResolved,
            effectiveLabels,
            selectedLabelIdsByGrantee,
            inheritedLabelIdsByGrantee,
            directLabelScopeOf,
            recordDirectLabelWrites,
            reconcileLabelScope,
            toast,
            applyGranteeLock,
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
        // The policy follows the self row however many others are listed: what makes
        // it special is that the access is THEIRS. A manager is exempt, their access
        // comes from the role, so there is no ceiling to cap and no lockout to warn of.
        const selfRow = isWorkspaceManager ? undefined : grantees.find((g) => g.isSelf);
        const selfManagedGranteeId = selfRow?.id;
        // The caller cannot grant above what they hold, and the server refuses such a
        // write. Proven from their own row only: with no row their access may come from
        // a group, which the list does not report, so capping would block a real holder.
        // A manager has no limit, and an UNKNOWN manager status must not produce one
        // either: unlike the confirm, a limit that guesses wrong blocks a legitimate
        // grant, and a failed permission read would make that permanent.
        // `=== false`, not `!isWorkspaceManager`: an unread permission must not produce a
        // limit, or a failed read would block a caller the backend would allow.
        const grantableDisabledLevels =
            isWorkspaceManager === false && selfRow ? levelsAbove(selfRow.level) : undefined;
        const granteeControlsLocked =
            !selfIdentityResolved && !isWorkspaceManager && grantees.some((g) => g.kind === "user");
        // The synthesized Admin row shows only while NO other permissions are set:
        // the caller must have reached the list without a grant of their own
        // (`seededWithoutSelfGrant` — a non-admin who locally removes their own
        // grant must not gain the badge) and the list must currently be empty, so
        // adding a grantee hides it and removing the last one brings it back.
        // A share-capable rule also passes the gate, judged from the SEED. A group
        // grant is another way in this cannot see: the heuristic's accepted blind spot.
        //
        // The heuristic infers how the caller reached a FETCHED list; a draft has none.
        const explainsAccessWithoutAGrant =
            !draft && status === "success" && seededWithoutSelfGrant && !seededRuleShareCapable;
        // A draft always shows the row — whoever drafts an object will own it — and unlike
        // the empty-state case it holds as grantees are added.
        const adminSelfRow =
            (draft || (explainsAccessWithoutAGrant && grantees.length === 0)) && selfIdentity
                ? userDisplayPair(selfIdentity, selfIdentity.id)
                : undefined;
        return {
            subview,
            status,
            error: loadError,
            summary,
            grantees: sortedGrantees,
            selfManagedGranteeId,
            // Policy, not just classification: the caller's own row can't be raised
            // above itself, an inherited workspace level can't be undercut.
            selfManagedDisabledLevels: selfRow ? levelsAbove(selfRow.level) : undefined,
            workspaceDisabledLevels: mergeDisabledLevels(
                workspaceInheritedLevel ? levelsBelow(workspaceInheritedLevel) : undefined,
                grantableDisabledLevels,
            ),
            grantableDisabledLevels,
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
            inheritedLabelIdsByGrantee,
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
        isWorkspaceManager,
        draft,
        seededWithoutSelfGrant,
        seededRuleShareCapable,
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
        inheritedLabelIdsByGrantee,
        pendingGeneralAccess,
        pendingGrantees,
    ]);

    // Undefined outside draft mode, so an empty draft is not mistaken for a real one.
    const reportedDraft = draft ? draftValue : undefined;

    return useMemo(() => ({ state, actions, draft: reportedDraft }), [state, actions, reportedDraft]);
}
