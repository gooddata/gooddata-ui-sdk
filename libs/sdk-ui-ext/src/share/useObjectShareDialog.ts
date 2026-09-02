// (C) 2026 GoodData Corporation

import { useCallback, useEffect, useState } from "react";

import { useIntl } from "react-intl";

import type { IObjectPermissionsObject } from "@gooddata/sdk-backend-spi";
import type { GeneralAccessValue } from "@gooddata/sdk-ui-kit";

import { objectShareMessages } from "./messages.js";
import {
    changesEffectiveLevel,
    levelsBelow,
    removalChangesEffectiveLevel,
} from "./objectShareController.helpers.js";
import type {
    IObjectShareControllerActions,
    IObjectShareControllerState,
    IObjectShareDraft,
    IObjectShareGrantee,
    ObjectSharePermissionLevel,
} from "./objectShareController.types.js";
import type { IObjectAccessSummary, IObjectShareLabel } from "./types.js";
import { useObjectShareController } from "./useObjectShareController.js";

/**
 * A staged self-restriction: the level (or removal) the signed-in user picked for
 * their own sole grant, held until the "Restrict your access?" confirm.
 */
interface IPendingSelfChange {
    granteeId: string;
    level: ObjectSharePermissionLevel | "none";
}

/**
 * Level picks an inherited grant already covers, which the controller refuses as
 * no-ops ({@link changesEffectiveLevel}). Lowering a direct grant that sits ABOVE
 * what is inherited is NOT one of them: that does move the effective level (direct
 * EDIT under inherited SHARE, picking VIEW yields SHARE).
 */
function inheritedCoveredLevels(grantee: IObjectShareGrantee): ObjectSharePermissionLevel[] {
    return removalChangesEffectiveLevel(grantee) ? [] : levelsBelow(grantee.level);
}

/**
 * The presentational state {@link ObjectShareDialog} renders from. All logic —
 * controller ownership, the self-restriction confirm flow, open/close and the
 * mutation gating — lives here; the component maps this to JSX and holds no logic
 * of its own.
 *
 * @internal
 */
export interface IObjectShareDialogViewModel {
    /** The controller's current state, read by the component to build its rows and props. */
    state: IObjectShareControllerState;
    /** The controller's mutation actions, wired to the rendered controls. */
    actions: IObjectShareControllerActions;

    /** Whether the main share view (grantee list + general access) is visible. */
    isShareViewOpen: boolean;
    /** Whether the add-grantee sub-dialog is visible. */
    isAddGranteeOpen: boolean;
    /** Whether the general-access RESTRICTED↔WORKSPACE confirm is visible. */
    isGeneralAccessConfirmOpen: boolean;
    /** Whether the "Restrict your access?" self-restriction confirm is visible. */
    isSelfRestrictConfirmOpen: boolean;

    /**
     * Whether access-changing controls may be used. False until the list has loaded
     * AND per-label scope resolved: before then the controller reports a placeholder
     * (empty grantees + RESTRICTED, scope assumed-all), so a write would diff against
     * a false state — skipping grants or revoking the wrong labels.
     */
    isMutable: boolean;
    /**
     * Whether the dialog is still in its initial load — the access list or the
     * session's first label-scope resolution in flight. The component shows
     * skeletons in place of the grantee list and general access, so the reveal
     * happens once, with controls already actionable (or legitimately disabled
     * after a failed resolution). Mid-session re-probes don't turn it back on.
     */
    isLoading: boolean;

    /** The controller's workspace-rule menu policy, forwarded (see `IObjectShareControllerState`). */
    workspaceDisabledLevels: ObjectSharePermissionLevel[] | undefined;
    /**
     * Level picks a row must render disabled: the self-managed-row policy plus every
     * pick an inherited grant already covers.
     */
    rowDisabledLevels: (grantee: IObjectShareGrantee) => ObjectSharePermissionLevel[] | undefined;
    /** Per-level tooltips for the disabled picks an inherited grant covers. */
    rowDisabledLevelTooltips: (
        grantee: IObjectShareGrantee,
    ) => Partial<Record<ObjectSharePermissionLevel, string>> | undefined;
    /** Levels the add-grantee step must render disabled (see `grantableDisabledLevels`). */
    grantableDisabledLevels: ObjectSharePermissionLevel[] | undefined;
    /** Tooltip for a level the caller may not grant, in any menu. */
    grantLimitTooltip: string;
    /**
     * Whether Remove access must render disabled: the grantee holds no grant in this
     * workspace, so there is nothing here to revoke (their access is inherited).
     */
    isRowRemoveDisabled: (grantee: IObjectShareGrantee) => boolean;
    /** Tooltip explaining why Remove access is disabled on this row. */
    rowRemoveDisabledTooltip: string;
    /** Whether this row's controls must stay disabled (see `granteeControlsLocked`). */
    isRowControlsLocked: (grantee: IObjectShareGrantee) => boolean;

    /** Close the whole dialog, handing the draft over and discarding any staged self-restriction. */
    onClose: () => void;
    /**
     * Handle a grantee row's permission change. The signed-in user's own sole grant is
     * staged for the self-restriction confirm; every other row commits immediately.
     */
    onRowPermissionChange: (grantee: IObjectShareGrantee, level: ObjectSharePermissionLevel) => void;
    /** Handle a grantee row's remove. Same self-restriction routing as {@link onRowPermissionChange}. */
    onRowRemove: (grantee: IObjectShareGrantee) => void;
    /** Dismiss the self-restriction confirm, leaving the user's own access unchanged. */
    onSelfRestrictCancel: () => void;
    /** Apply the staged self-restriction — lower the user's own level, or remove their grant. */
    onSelfRestrictConfirm: () => void;
}

/**
 * Inputs to {@link useObjectShareDialog} — the subset of {@link ObjectShareDialog}'s
 * props the presentation logic needs. The component owns the public prop interface
 * and forwards these through.
 */
interface IUseObjectShareDialogParams {
    /** Object whose access is managed. Fixed for the mount — remount for a new target. */
    target: IObjectPermissionsObject | undefined;
    /** Called when the dialog requests to close; closing unmounts the session, discarding its state. */
    onClose: () => void;
    /** Fires with the current access summary whenever the displayed access changes. */
    onSummaryChange?: (summary: IObjectAccessSummary) => void;
    /** Attribute labels enabling the per-grantee scope picker; forwarded to the controller. */
    labels?: IObjectShareLabel[];
    /** Whether the object's labels are still loading (gates mutations); forwarded to the controller. */
    labelsLoading?: boolean;
    /** Whether the object's labels failed to load (gates mutations); forwarded to the controller. */
    labelsError?: boolean;
    /** Manage access for an object that does not exist yet; forwarded to the controller. */
    draft?: boolean;
    /** Fires with the final draft as the dialog closes (draft mode only). */
    onDraftChange?: (draft: IObjectShareDraft) => void;
    /** Draft to carry on from; forwarded to the controller. */
    initialDraft?: IObjectShareDraft;
    /** What a new object's general access starts as; forwarded to the controller. */
    initialDraftGeneralAccess?: GeneralAccessValue;
}

/**
 * Owns everything {@link ObjectShareDialog} needs to render for one dialog session:
 * the controller, the self-restriction confirm flow, the mutation-gating flags, and
 * the outward summary synchronization. Returns a flat view model the component
 * renders — no JSX and no rendering logic here.
 *
 * @internal
 */
export function useObjectShareDialog({
    target,
    onClose,
    onSummaryChange,
    draft,
    onDraftChange,
    initialDraft,
    initialDraftGeneralAccess,
    labels,
    labelsLoading,
    labelsError,
}: IUseObjectShareDialogParams): IObjectShareDialogViewModel {
    const intl = useIntl();
    const {
        state,
        actions,
        draft: currentDraft,
    } = useObjectShareController(target, {
        labels,
        labelsError,
        labelsLoading,
        draft,
        initialDraft,
        initialDraftGeneralAccess,
    });

    const [pendingSelfChange, setPendingSelfChange] = useState<IPendingSelfChange | undefined>(undefined);

    // Synchronize the displayed access summary out to the consumer — the legitimate
    // effect kind (notifying an external system of a change). `state.summary` is
    // content-stable, so this fires exactly when the displayed access changes: on
    // load, and after each summary-affecting mutation.
    //
    // Deliberately OPTIMISTIC: the summary is emitted as soon as an edit applies,
    // not when it settles. A failure while the dialog is open self-corrects (the
    // overlay reverts and the corrected summary re-emits); a failure landing after
    // the dialog closed leaves the consumer with the optimistic value — an accepted
    // edge case, decided over settled-only emission and refetch-on-close.
    useEffect(() => {
        if (state.summary) {
            onSummaryChange?.(state.summary);
        }
    }, [state.summary, onSummaryChange]);

    const closeDialog = useCallback(() => {
        if (currentDraft) {
            onDraftChange?.(currentDraft);
        }
        onClose();
    }, [currentDraft, onDraftChange, onClose]);

    // A row belongs to the signed-in user's own sole grant when the controller has
    // classified it as self-managed — those changes route through the confirm.
    const onRowPermissionChange = useCallback(
        (grantee: IObjectShareGrantee, level: ObjectSharePermissionLevel) => {
            if (state.selfManagedGranteeId === grantee.id) {
                // Stage the confirm only for a pick that would really move the level the
                // user effectively holds. Comparing against the displayed level instead
                // opened "Restrict your access?" for a pick under an inherited floor, which
                // the controller then refuses — the user would confirm a restriction that
                // never happens. Same predicate the controller applies.
                if (changesEffectiveLevel(grantee, level)) {
                    setPendingSelfChange({ granteeId: grantee.id, level });
                }
                return;
            }
            void actions.changePermissionLevel(grantee.id, level);
        },
        [state.selfManagedGranteeId, actions],
    );

    const onRowRemove = useCallback(
        (grantee: IObjectShareGrantee) => {
            // Stage the confirm only when the removal can lower the level the user
            // effectively holds — under an inherited floor the revoke removes the local
            // grant but restricts nothing, so the "Restrict your access?" warning would
            // promise a restriction that never happens. Same policy as the picks above.
            if (state.selfManagedGranteeId === grantee.id && removalChangesEffectiveLevel(grantee)) {
                setPendingSelfChange({ granteeId: grantee.id, level: "none" });
                return;
            }
            void actions.removeGrantee(grantee.id);
        },
        [state.selfManagedGranteeId, actions],
    );

    const onSelfRestrictConfirm = useCallback(() => {
        if (!pendingSelfChange) {
            return;
        }
        const { granteeId, level } = pendingSelfChange;
        setPendingSelfChange(undefined);
        if (level === "none") {
            void actions.removeGrantee(granteeId);
        } else {
            void actions.changePermissionLevel(granteeId, level);
        }
    }, [pendingSelfChange, actions]);

    const onSelfRestrictCancel = useCallback(() => setPendingSelfChange(undefined), []);

    const inheritedCoveredTooltip = intl.formatMessage(objectShareMessages.granteeLevelInheritedCovered);

    const rowDisabledLevels = useCallback(
        (grantee: IObjectShareGrantee) => {
            const self =
                state.selfManagedGranteeId === grantee.id ? (state.selfManagedDisabledLevels ?? []) : [];
            // Self caps levels ABOVE the row and coverage disables those BELOW, so those
            // two are disjoint; the grant limit can overlap either.
            const merged = [
                ...new Set([
                    ...self,
                    ...inheritedCoveredLevels(grantee),
                    ...(state.grantableDisabledLevels ?? []),
                ]),
            ];
            return merged.length > 0 ? merged : undefined;
        },
        [state.selfManagedGranteeId, state.selfManagedDisabledLevels, state.grantableDisabledLevels],
    );

    const rowDisabledLevelTooltips = useCallback(
        (grantee: IObjectShareGrantee) => {
            const covered = inheritedCoveredLevels(grantee);
            if (covered.length === 0) {
                return undefined;
            }
            const map: Partial<Record<ObjectSharePermissionLevel, string>> = {};
            for (const level of covered) {
                map[level] = inheritedCoveredTooltip;
            }
            return map;
        },
        [inheritedCoveredTooltip],
    );

    const isRowRemoveDisabled = useCallback(
        (grantee: IObjectShareGrantee) => grantee.directLevel === undefined,
        [],
    );

    // Only USER rows can be the caller's own, so a group row stays usable while the
    // profile is unresolved.
    const isRowControlsLocked = useCallback(
        (grantee: IObjectShareGrantee) => state.granteeControlsLocked && grantee.kind === "user",
        [state.granteeControlsLocked],
    );

    const isMutable = state.status === "success" && state.labelsResolved;
    const isLoading = state.status === "loading" || state.labelsInitializing;

    return {
        state,
        actions,
        isShareViewOpen: state.subview === "main",
        isAddGranteeOpen: state.subview === "addGrantee",
        isGeneralAccessConfirmOpen: !!state.pendingGeneralAccess,
        isSelfRestrictConfirmOpen: pendingSelfChange !== undefined,
        isMutable,
        isLoading,
        workspaceDisabledLevels: state.workspaceDisabledLevels,
        grantableDisabledLevels: state.grantableDisabledLevels,
        grantLimitTooltip: intl.formatMessage(objectShareMessages.toastEscalationRefused),
        rowDisabledLevels,
        rowDisabledLevelTooltips,
        isRowRemoveDisabled,
        isRowControlsLocked,
        rowRemoveDisabledTooltip: intl.formatMessage(objectShareMessages.granteeRemoveInherited),
        onClose: closeDialog,
        onRowPermissionChange,
        onRowRemove,
        onSelfRestrictCancel,
        onSelfRestrictConfirm,
    };
}
