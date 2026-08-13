// (C) 2026 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import type { IObjectPermissionsObject } from "@gooddata/sdk-backend-spi";
import type { IGranularAccessGrantee, IObjectAccessList, ObjRef } from "@gooddata/sdk-model";
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { isPermissionsNotAvailable } from "./accessErrors.js";
import {
    type ILabelScopeChange,
    type LabelScopePrincipal,
    buildLabelMutationsForScopes,
    buildLabelRegrades,
    granteeGrantIn,
} from "./objectShareController.helpers.js";
import type { IObjectShareLabel } from "./types.js";

/** Per-label probe outcome: the fetched access list, or a failure with whether it was transient (not a 404). */
type LabelProbeResult =
    | { label: IObjectShareLabel; list: IObjectAccessList }
    | { label: IObjectShareLabel; transient: boolean };

/**
 * Pure: each grantee's in-scope label ids — primary always counts, others wherever
 * the grantee holds the label, whether granted here or inherited. An inherited label
 * is genuinely in scope: the grantee can read it, so the checklist must show it
 * checked, exactly as the parent workspace shows it.
 */
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
            if (result.label.isPrimary || granteeGrantIn(result.list, id)) {
                resolved[id]!.push(result.label.id);
            }
        }
    }
    return resolved;
}

/**
 * Pure: per-grantee label provenance, split by which question it answers. A label that is
 * both granted here and inherited appears in BOTH maps, and that is the point — the two
 * facts drive different decisions.
 *
 * - `inherited` — access survives revoking whatever this workspace granted, so the
 *   checkbox stays checked and locked. Immutable for the session: no write from this
 *   workspace can change a group's or a parent's grant, so deriving it from the probe
 *   cannot go stale.
 * - `direct` — granted HERE, so it is the only thing a write may target. This one DOES
 *   change under our own writes, so the hook keeps it as an optimistic overlay seeded from
 *   here rather than re-deriving it from a probe that runs once per session.
 *
 * The primary label is excluded from both: it is locked for every grantee regardless, and
 * never written.
 */
function resolveLabelProvenance(
    results: readonly LabelProbeResult[],
    committedGranteeIds: readonly string[],
): { inherited: Record<string, string[]>; direct: Record<string, string[]> } {
    const inherited: Record<string, string[]> = {};
    const direct: Record<string, string[]> = {};
    for (const id of committedGranteeIds) {
        inherited[id] = [];
        direct[id] = [];
    }
    for (const result of results) {
        if ("transient" in result || result.label.isPrimary) {
            continue;
        }
        for (const id of committedGranteeIds) {
            const grant = granteeGrantIn(result.list, id);
            if (grant?.inherited) {
                inherited[id]!.push(result.label.id);
            }
            if (grant?.direct) {
                direct[id]!.push(result.label.id);
            }
        }
    }
    return { inherited, direct };
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
     * In-scope labels whose access the grantee INHERITS, per grantee id — including ones
     * they also hold a local grant on. Callers render these locked: unchecking cannot take
     * the access away. Derived straight from the probe, never optimistic, because only the
     * backend can say where a grant lives.
     */
    inheritedLabelIdsByGrantee: Record<string, string[]>;
    /**
     * Labels THIS workspace grants the grantee, per grantee id — the only ones a write may
     * target, and the complement of "inherited only". An optimistic overlay, not a
     * derivation: the per-label probe runs once per session, so after the dialog revokes or
     * grants a label the probe's answer is stale and acting on it re-creates access that was
     * just removed. Every label write reports its outcome through
     * {@link recordDirectLabelWrites}.
     */
    directLabelIdsByGrantee: Record<string, string[]>;
    /**
     * Record the outcome of the dialog's OWN label writes so the direct set stays true:
     * `granted` ids gain a local grant, `revoked` ids lose theirs. Pass only the writes
     * that actually landed.
     */
    recordDirectLabelWrites: (
        granteeId: string,
        granted: readonly string[],
        revoked: readonly string[],
    ) => void;
    /** Forget a grantee's label bookkeeping once their row is gone for good. */
    forgetGranteeLabels: (granteeId: string) => void;
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
    /**
     * Per-principal variant of {@link reconcileLabelScope}: each principal moves its
     * OWN scope, for grantees added in one step that each picked a different label
     * scope. Still one write per label carrying every principal that changes on it,
     * so a shared label costs one call regardless of how the scopes differ.
     */
    reconcileLabelScopes: (
        changes: ILabelScopeChange[],
    ) => Promise<{ ok: boolean; failedLabelIds: string[] }>;
    /**
     * Re-grades an UNCHANGED label scope to each principal's `level` — what a
     * permission-level change on the object needs so its labels don't keep the level
     * they were granted at. Not a diff: every in-scope label is rewritten (a diff
     * over an unchanged set produces no writes). Same independent settling and
     * `failedLabelIds` reporting as {@link reconcileLabelScope}.
     */
    regradeLabelScope: (
        principals: LabelScopePrincipal[],
        scopeLabelIds: ReadonlySet<string>,
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
    // Which labels THIS workspace grants each grantee. Optimistic for the same reason the
    // scope is, and for a sharper one: our own revokes and grants change it, and the probe
    // will not run again to notice.
    const [directLabelIdsByGrantee, setDirectLabelIdsByGrantee] = useState<Record<string, string[]>>({});
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
        setDirectLabelIdsByGrantee({});
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
                const { direct } = resolveLabelProvenance(results, committedGranteeIds);
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
                // Same rule for the direct set: what we wrote outranks what the probe read.
                setDirectLabelIdsByGrantee((prev) => {
                    const next: Record<string, string[]> = {};
                    for (const id of committedGranteeIds) {
                        next[id] = prev[id] ?? direct[id]!;
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

    // Inheritance is the one fact no write from here can change, so it stays a pure
    // derivation of the probe — there is no optimistic version of "someone else granted
    // this", and nothing we do can make it stale.
    const inheritedLabelIdsByGrantee = useMemo(
        () => (labelLists ? resolveLabelProvenance(labelLists, committedGranteeIds).inherited : {}),
        [labelLists, committedGranteeIds],
    );

    const recordDirectLabelWrites = useCallback(
        (granteeId: string, granted: readonly string[], revoked: readonly string[]) => {
            if (granted.length === 0 && revoked.length === 0) {
                return;
            }
            setDirectLabelIdsByGrantee((prev) => {
                const dropped = new Set(revoked);
                const kept = (prev[granteeId] ?? []).filter((id) => !dropped.has(id));
                return { ...prev, [granteeId]: Array.from(new Set([...kept, ...granted])) };
            });
        },
        [],
    );

    const forgetGranteeLabels = useCallback((granteeId: string) => {
        setSelectedLabelIdsByGrantee((prev) => {
            const { [granteeId]: _scope, ...rest } = prev;
            return rest;
        });
        setDirectLabelIdsByGrantee((prev) => {
            const { [granteeId]: _direct, ...rest } = prev;
            return rest;
        });
    }, []);

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
    // Issues one manageObjectPermissions per label and reports the failures by id.
    // Shared by the scope diff and the level re-grade so both settle identically.
    const writeLabels = useCallback(
        async (
            writes: Array<{ id: string; ref: ObjRef; grantees: IGranularAccessGrantee[] }>,
        ): Promise<{ ok: boolean; failedLabelIds: string[] }> => {
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
        [backend, workspace],
    );

    const reconcileLabelScopes = useCallback(
        (changes: ILabelScopeChange[]): Promise<{ ok: boolean; failedLabelIds: string[] }> =>
            writeLabels(buildLabelMutationsForScopes(changes, effectiveLabels)),
        [effectiveLabels, writeLabels],
    );

    const reconcileLabelScope = useCallback(
        (
            principals: LabelScopePrincipal[],
            desiredLabelIds: ReadonlySet<string>,
            currentLabelIds: ReadonlySet<string>,
        ): Promise<{ ok: boolean; failedLabelIds: string[] }> =>
            reconcileLabelScopes(
                principals.map((principal) => ({ principal, desiredLabelIds, currentLabelIds })),
            ),
        [reconcileLabelScopes],
    );

    const regradeLabelScope = useCallback(
        (
            principals: LabelScopePrincipal[],
            scopeLabelIds: ReadonlySet<string>,
        ): Promise<{ ok: boolean; failedLabelIds: string[] }> =>
            writeLabels(buildLabelRegrades(principals, scopeLabelIds, effectiveLabels)),
        [effectiveLabels, writeLabels],
    );

    return {
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
    };
}
