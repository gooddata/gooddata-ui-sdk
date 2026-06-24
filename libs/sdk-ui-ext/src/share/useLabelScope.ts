// (C) 2026 GoodData Corporation

import { useCallback, useEffect, useMemo, useState } from "react";

import { type IObjectPermissionsObject, isUnexpectedResponseError } from "@gooddata/sdk-backend-spi";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import {
    type LabelScopePrincipal,
    buildLabelMutations,
    isGranteeGrantedIn,
} from "./objectShareController.helpers.js";
import type { IObjectShareLabel } from "./types.js";

/**
 * Whether a label's access-list error means the label is genuinely not
 * independently permissionable (a definitive 404 / 501), as opposed to a
 * transient failure (5xx / 403 / network) that should NOT drop a real label.
 */
function isNotPermissionable(error: unknown): boolean {
    return isUnexpectedResponseError(error) && (error.httpStatus === 404 || error.httpStatus === 501);
}

/**
 * Per-label access scope for the share dialog: which labels each grantee can
 * reach, which labels are independently permissionable, and the single write
 * path that grants/revokes label access.
 *
 * @internal
 */
export interface ILabelScope {
    /**
     * Labels that can actually take a per-label grant (a display form whose
     * permissions endpoint responded). Until resolution completes, this is the
     * full `labels` list.
     */
    effectiveLabels: IObjectShareLabel[];
    /**
     * Whether per-label resolution has finished (the permissionable set + each
     * grantee's scope are known). False while labels are still loading or the probe
     * is in flight, and false when label metadata failed to load (scope is then
     * unknowable, so acting on it would silently orphan real label grants). True
     * only for a genuinely label-free object. Callers gate every access-changing
     * control (label edits, Add, remove, general access) on this so they don't act
     * on the "assume all labels" placeholder.
     */
    labelsResolved: boolean;
    /** Per-grantee label scope: grantee id → label ids in scope (primary always in). */
    selectedLabelIdsByGrantee: Record<string, string[]>;
    setSelectedLabelIdsByGrantee: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
    /**
     * The single per-label write path. Diffs `desired` vs `current` over the
     * permissionable labels and grants/revokes for one principal. Returns false
     * if any write fails (callers surface the error and roll back).
     */
    reconcileLabelScope: (
        principal: LabelScopePrincipal,
        desiredLabelIds: ReadonlySet<string>,
        currentLabelIds: ReadonlySet<string>,
    ) => Promise<boolean>;
}

/**
 * Owns label-scope resolution + writes for {@link useObjectShareController}.
 * Resolves each grantee's scope by fetching every label's access list, tracks
 * which labels are permissionable, and exposes one reconcile primitive shared by
 * add / remove / general-access / the labels picker so their behavior can't drift.
 *
 * The resolved scope is local-authoritative: the probe seeds a scope only for
 * grantees it doesn't already know, so an optimistic scope written for a freshly
 * added grantee is never overwritten by the backend's lagging read. Local scopes
 * are dropped on a target switch so the next object re-resolves from scratch.
 *
 * @internal
 */
export function useLabelScope(
    target: IObjectPermissionsObject | undefined,
    targetKey: string | undefined,
    labels: IObjectShareLabel[],
    hasList: boolean,
    committedGranteeIds: string[],
    labelsError: boolean,
    labelsLoading: boolean,
): ILabelScope {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    const [selectedLabelIdsByGrantee, setSelectedLabelIdsByGrantee] = useState<Record<string, string[]>>({});
    // Label ids whose permissions endpoint responded — not every display form is
    // independently permissionable (some 404). `undefined` means "not resolved
    // yet" (assume all).
    const [permissionableLabelIds, setPermissionableLabelIds] = useState<Set<string> | undefined>(undefined);

    const labelsKey = labels.map((l) => l.id).join(",");

    // A target switch OR a label-set change invalidates the previous probe's
    // permissionable set; until the resolution effect re-derives it,
    // `effectiveLabels` must fall back to all labels rather than filter against
    // stale ids. Resetting on `labelsKey` too matters when the label set changes
    // under the same target (e.g. labels finish loading): otherwise the old
    // permissionable set would briefly mark scope resolved and filter the new
    // labels against stale ids, so add/share could skip expected per-label grants.
    useEffect(() => {
        setPermissionableLabelIds(undefined);
    }, [targetKey, labelsKey]);

    // A target switch — or a label-set change under the same target (labels finish
    // loading, a label added/removed) — drops every resolved scope so the seeding
    // effect below re-resolves from the current label set's per-label lists rather
    // than preserving scopes computed against the old labels. Without the labelsKey
    // reset, an existing grantee would keep a scope missing a newly-added label even
    // when the backend grants them access to it. (An add under the SAME labels only
    // changes granteeIdsKey, not labelsKey, so an optimistic scope still survives.)
    useEffect(() => {
        setSelectedLabelIdsByGrantee({});
    }, [targetKey, labelsKey]);

    // Stable string key of the committed grantee ids — the array is rebuilt each
    // render, so the effect keys on this instead to re-resolve only on a real change.
    const granteeIdsKey = committedGranteeIds.slice().sort().join(",");

    // Resolve each grantee's label scope: fetch every label's access list once and
    // record, per grantee, which labels they appear in (primary label always counts).
    // Keyed on the committed grantee ids + labels so it re-resolves after add/remove.
    // `hasList` is a dep too: a list that loads with no named grantees keeps
    // `granteeIdsKey` empty, so without it the effect would never run and the
    // permissionable set (404 filtering) would never resolve.
    useEffect(() => {
        if (!target || labels.length === 0 || !hasList) {
            return;
        }
        let cancelled = false;
        Promise.all(
            labels.map((label) =>
                backend
                    .workspace(workspace)
                    .objectPermissions()
                    .getAccessList({ kind: "label", ref: label.ref })
                    .then((list) => ({ label, list }) as const)
                    // Only a definitive 404/501 means the label can't take a per-label
                    // grant. A transient failure (5xx / 403 / network) must NOT drop a
                    // real label — return it without grant info so it stays grantable.
                    .catch((error: unknown) => ({ label, transient: !isNotPermissionable(error) }) as const),
            ),
        ).then((results) => {
            if (cancelled) {
                return;
            }
            const resolved: Record<string, string[]> = {};
            for (const id of committedGranteeIds) {
                resolved[id] = [];
            }
            const permissionable = new Set<string>();
            for (const result of results) {
                if ("transient" in result) {
                    // Keep transiently-failed labels permissionable (don't hide a real
                    // label); skip definitively-not-permissionable ones (404/501).
                    if (result.transient) {
                        permissionable.add(result.label.id);
                    }
                    continue;
                }
                const { label, list } = result;
                permissionable.add(label.id);
                for (const id of committedGranteeIds) {
                    // Primary label is always part of the scope; others are scoped
                    // only when the grantee actually holds a grant on that label.
                    if (label.isPrimary || isGranteeGrantedIn(list, id)) {
                        resolved[id]!.push(label.id);
                    }
                }
            }
            setSelectedLabelIdsByGrantee((prev) => {
                // Seed a scope only for grantees we don't already have one for. A
                // scope written optimistically (a fresh add, a labels edit) is
                // local-authoritative and must survive the re-resolution that the
                // grantee-set change triggers — the backend's lagging read would
                // otherwise reset it. Grantees gone from the list are dropped.
                const next: Record<string, string[]> = {};
                for (const id of committedGranteeIds) {
                    next[id] = prev[id] ?? resolved[id]!;
                }
                return next;
            });
            setPermissionableLabelIds(permissionable);
        });
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [backend, workspace, targetKey, labelsKey, granteeIdsKey, hasList]);

    // Only labels whose permissions endpoint responded are scope-controllable; until
    // resolution completes (permissionableLabelIds undefined) assume all are usable.
    // While the current target's list isn't loaded yet, ignore a permissionable set
    // left over from a previous object so we never mis-filter the new labels.
    const effectiveLabels = useMemo<IObjectShareLabel[]>(
        () =>
            hasList && permissionableLabelIds
                ? labels.filter((l) => permissionableLabelIds.has(l.id))
                : labels,
        [labels, permissionableLabelIds, hasList],
    );

    // Resolution is done when the probe has produced a permissionable set, or when
    // there are genuinely no labels to probe (a label-free object). Until then
    // callers must treat the scope as unknown (not "all selected").
    //
    // Crucially, an EMPTY `labels` list only means "resolved" when labels aren't
    // still loading and didn't error: while they load, the consumer hasn't passed
    // them yet (labels === [] with loading true), and on error they can't be known.
    // Treating either as resolved would let row controls reconcile against an empty
    // label set and silently orphan real per-label grants. So stay unresolved while
    // labels are pending, regardless of the current (possibly empty) list.
    const labelsPending = labelsError || labelsLoading;
    const labelsResolved = !labelsPending && (labels.length === 0 || permissionableLabelIds !== undefined);

    // The single per-label write path. Diffs `desired` vs `current` over the
    // permissionable labels and applies the grants/revokes for one principal
    // (a grantee, or the all-workspace-users rule). Returns false if ANY write
    // fails — callers surface the error and roll back, so a partial write never
    // looks like success (no silent .catch). Used by add, remove, general access
    // and the labels picker alike, so their label behavior can't drift.
    const reconcileLabelScope = useCallback(
        async (
            principal: LabelScopePrincipal,
            desiredLabelIds: ReadonlySet<string>,
            currentLabelIds: ReadonlySet<string>,
        ): Promise<boolean> => {
            const writes = buildLabelMutations(principal, desiredLabelIds, currentLabelIds, effectiveLabels);
            if (writes.length === 0) {
                return true;
            }
            const svc = backend.workspace(workspace).objectPermissions();
            const results = await Promise.allSettled(
                writes.map((w) => svc.manageObjectPermissions({ kind: "label", ref: w.ref }, [w.grantee])),
            );
            return results.every((r) => r.status === "fulfilled");
        },
        [effectiveLabels, backend, workspace],
    );

    return {
        effectiveLabels,
        labelsResolved,
        selectedLabelIdsByGrantee,
        setSelectedLabelIdsByGrantee,
        reconcileLabelScope,
    };
}
