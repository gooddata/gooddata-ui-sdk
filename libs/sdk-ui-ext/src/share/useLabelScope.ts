// (C) 2026 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import type { IObjectPermissionsObject } from "@gooddata/sdk-backend-spi";
import type { IObjectAccessList } from "@gooddata/sdk-model";
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { isPermissionsNotAvailable } from "./accessErrors.js";
import {
    type LabelScopePrincipal,
    buildLabelMutationsForPrincipals,
    isGranteeGrantedIn,
} from "./objectShareController.helpers.js";
import type { IObjectShareLabel } from "./types.js";

/** Per-label probe outcome: the fetched access list, or a failure with whether it was transient (not a 404). */
type LabelProbeResult =
    | { label: IObjectShareLabel; list: IObjectAccessList }
    | { label: IObjectShareLabel; transient: boolean };

/** Pure: each grantee's in-scope label ids — primary always counts, others only where the grantee is granted. */
function resolveScopes(
    results: readonly LabelProbeResult[],
    committedGranteeIds: readonly string[],
): Record<string, string[]> {
    const resolved: Record<string, string[]> = {};
    for (const id of committedGranteeIds) {
        resolved[id] = [];
    }
    for (const result of results) {
        if ("transient" in result) {
            continue;
        }
        for (const id of committedGranteeIds) {
            if (result.label.isPrimary || isGranteeGrantedIn(result.list, id)) {
                resolved[id]!.push(result.label.id);
            }
        }
    }
    return resolved;
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
    /**
     * True until the session's FIRST scope resolution settles (labels metadata +
     * the initial per-label probe). Unlike {@link labelsResolved} it never turns
     * back on: a later re-probe (a grantee or label-set change) only re-disables
     * controls. Lets the dialog hold its loading placeholders until controls are
     * actionable without flashing back to them mid-session; a resolution that
     * settles with failures counts too, so an error can't hold placeholders
     * forever.
     */
    labelsInitializing: boolean;
    /** Per-grantee label scope: grantee id → label ids in scope (primary always in). */
    selectedLabelIdsByGrantee: Record<string, string[]>;
    setSelectedLabelIdsByGrantee: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
    /**
     * The single per-label write path. Diffs `desired` vs `current` over the
     * permissionable labels and issues one `manageObjectPermissions` per changed
     * label, carrying every principal that changes on it. Reports `failedLabelIds`
     * so callers can keep the labels that landed rather than treat a partial
     * failure as all-or-nothing (each label write settles independently).
     */
    reconcileLabelScope: (
        principals: LabelScopePrincipal[],
        desiredLabelIds: ReadonlySet<string>,
        currentLabelIds: ReadonlySet<string>,
    ) => Promise<{ ok: boolean; failedLabelIds: string[] }>;
}

/**
 * Owns label-scope resolution + writes for {@link useObjectShareController}.
 * Resolves each grantee's scope by fetching every label's access list, tracks
 * which labels are permissionable, and exposes one reconcile primitive shared by
 * add / remove / general-access / the labels picker so their behavior can't drift.
 *
 * The resolved scope is local-authoritative: the probe seeds a scope only for
 * grantees it doesn't already know, so an optimistic scope written for a freshly
 * added grantee is never overwritten by the backend's lagging read. Session-scoped
 * like its owner — the target is fixed for the mount (see {@link ObjectShareDialog}).
 *
 * @internal
 */
export function useLabelScope(
    target: IObjectPermissionsObject | undefined,
    labels: IObjectShareLabel[],
    hasList: boolean,
    committedGranteeIds: string[],
    labelsError: boolean,
    labelsLoading: boolean,
): ILabelScope {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    // The optimistic label-scope overlay — kept authoritative: a scope written for
    // a fresh add / labels edit must survive the backend's lagging re-read, so the
    // probe below only seeds grantees it doesn't already know.
    const [selectedLabelIdsByGrantee, setSelectedLabelIdsByGrantee] = useState<Record<string, string[]>>({});
    // Whether the session's first probe has settled (see `labelsInitializing`) —
    // a fact about session history, so it is state, flipped once in onSuccess.
    const [everResolved, setEverResolved] = useState(false);

    const labelsKey = labels.map((l) => l.id).join(",");

    // Drop every resolved scope when the label SET changes (labels finish loading, a
    // label added/removed) — the probe must re-resolve, or a grantee keeps a scope
    // missing a newly-granted label. Render-time adjust-on-change.
    const [seenLabelsKey, setSeenLabelsKey] = useState(labelsKey);
    if (seenLabelsKey !== labelsKey) {
        setSeenLabelsKey(labelsKey);
        setSelectedLabelIdsByGrantee({});
    }

    // Probe each label's access list to learn which are permissionable (some 404) and
    // which each grantee holds. `hasList` gates it: a list with no named grantees keeps
    // `granteeIdsKey` empty, but the permissionable set (404 filtering) must still resolve.
    const { result: labelLists } = useCancelablePromise(
        {
            promise:
                target && labels.length > 0 && hasList
                    ? () =>
                          Promise.all(
                              labels.map((label) =>
                                  backend
                                      .workspace(workspace)
                                      .objectPermissions()
                                      .getAccessList({ kind: "label", ref: label.ref })
                                      .then((list) => ({ label, list }) as const)
                                      // Only a definitive 404 means the label can't take a
                                      // grant; a transient failure must NOT drop a real label.
                                      .catch(
                                          (error: unknown) =>
                                              ({
                                                  label,
                                                  transient: !isPermissionsNotAvailable(error),
                                              }) as const,
                                      ),
                              ),
                          )
                    : undefined,
            onSuccess: (results) => {
                setEverResolved(true);
                const resolved = resolveScopes(results, committedGranteeIds);
                // Seed only grantees we don't already have a scope for — an optimistic
                // scope is authoritative and must survive this re-resolution. Fired once
                // per resolution (onSuccess), so reading `prev` is safe.
                setSelectedLabelIdsByGrantee((prev) => {
                    const next: Record<string, string[]> = {};
                    for (const id of committedGranteeIds) {
                        next[id] = prev[id] ?? resolved[id]!;
                    }
                    return next;
                });
            },
        },
        // Keyed on the label set's stable string hash, not the array (rebuilt every
        // render — listing it would refetch each render, an infinite loop). NOT keyed
        // on the grantee set: adds and removes maintain their scope optimistically,
        // so a per-grantee-change re-probe would only discard its own results while
        // flipping labelsResolved false and disabling controls for the round trip.
        [backend, workspace, labelsKey, hasList],
    );

    // Permissionable ids derived straight from the probe result — `undefined` (assume
    // all) until it resolves, which also invalidates automatically on a dep change
    // (useCancelablePromise resets to loading), so no separate reset is needed.
    const permissionableLabelIds = useMemo<Set<string> | undefined>(() => {
        if (!labelLists) {
            return undefined;
        }
        const permissionable = new Set<string>();
        for (const result of labelLists) {
            // Keep transiently-failed labels permissionable; skip definitive 404s.
            if ("transient" in result) {
                if (result.transient) {
                    permissionable.add(result.label.id);
                }
            } else {
                permissionable.add(result.label.id);
            }
        }
        return permissionable;
    }, [labelLists]);

    // Only permissionable labels are scope-controllable; assume all until resolved.
    const effectiveLabels = useMemo<IObjectShareLabel[]>(
        () =>
            hasList && permissionableLabelIds
                ? labels.filter((l) => permissionableLabelIds.has(l.id))
                : labels,
        [labels, permissionableLabelIds, hasList],
    );

    // A transiently-failed probe means that label's per-grantee grants are UNKNOWN —
    // the label stays visible (permissionable), but the scope must not count as
    // resolved: edits would diff against an invented current and could orphan or
    // skip that label's real grants. Same philosophy as the `labelsError` gate.
    const hasTransientProbe = labelLists?.some((r) => "transient" in r && r.transient) ?? false;

    // Resolved once the probe produced a permissionable set with no unknowns, or for
    // a genuinely label-free object. An EMPTY `labels` list counts as resolved only
    // when labels aren't still loading and didn't error — otherwise row controls
    // would reconcile against an empty set and silently orphan real per-label grants.
    const labelsPending = labelsError || labelsLoading;
    const labelsResolved =
        !labelsPending &&
        (labels.length === 0 || (permissionableLabelIds !== undefined && !hasTransientProbe));

    // First-resolution only: metadata still loading, or a probe will run and hasn't
    // settled once. A metadata ERROR is not initializing (nothing more will load —
    // the dialog reveals with disabled controls instead of holding placeholders).
    const labelsInitializing = labelsLoading || (labels.length > 0 && !everResolved);

    // The single per-label write path (see the interface doc) — used by add, remove,
    // general access and the labels picker alike, so their label behavior can't
    // drift. Writes settle independently (allSettled), and the failed labels are
    // reported by id — never collapsed into one boolean, or a partial failure would
    // roll callers back past writes that actually landed.
    const reconcileLabelScope = useCallback(
        async (
            principals: LabelScopePrincipal[],
            desiredLabelIds: ReadonlySet<string>,
            currentLabelIds: ReadonlySet<string>,
        ): Promise<{ ok: boolean; failedLabelIds: string[] }> => {
            const writes = buildLabelMutationsForPrincipals(
                principals,
                desiredLabelIds,
                currentLabelIds,
                effectiveLabels,
            );
            if (writes.length === 0) {
                return { ok: true, failedLabelIds: [] };
            }
            const svc = backend.workspace(workspace).objectPermissions();
            const results = await Promise.allSettled(
                writes.map((w) => svc.manageObjectPermissions({ kind: "label", ref: w.ref }, w.grantees)),
            );
            const failedLabelIds = writes
                .filter((_, i) => results[i]!.status === "rejected")
                .map((w) => w.id);
            return { ok: failedLabelIds.length === 0, failedLabelIds };
        },
        [effectiveLabels, backend, workspace],
    );

    return {
        effectiveLabels,
        labelsResolved,
        labelsInitializing,
        selectedLabelIdsByGrantee,
        setSelectedLabelIdsByGrantee,
        reconcileLabelScope,
    };
}
