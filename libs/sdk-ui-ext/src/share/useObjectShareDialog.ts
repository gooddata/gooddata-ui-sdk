// (C) 2026 GoodData Corporation

import { useCallback, useEffect, useState } from "react";

import { type MessageDescriptor, useIntl } from "react-intl";

import type { IObjectPermissionsObject } from "@gooddata/sdk-backend-spi";
import type { GeneralAccessValue } from "@gooddata/sdk-ui-kit";

import { objectShareMessages, objectShareRemoveAccessMessages } from "./messages.js";
import {
    ALL_LEVELS,
    changesEffectiveLevel,
    granteeDisplayPair,
    levelsAbove,
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
import { type RowConfirmKind, removeAccessConfirmKind } from "./removeAccessConfirm.js";
import type { IObjectAccessSummary, IObjectShareLabel } from "./types.js";
import { useObjectShareController } from "./useObjectShareController.js";

/**
 * A row change held until its confirm: a lower level the signed-in user picked for their
 * own sole grant, or a removal ("none"). The kind is fixed when staged, so the open confirm
 * can't change.
 */
interface IPendingRowChange {
    grantee: IObjectShareGrantee;
    level: ObjectSharePermissionLevel | "none";
    kind: RowConfirmKind;
}

const ROW_CONFIRM_COPY = {
    loseAccess: {
        title: objectShareMessages.removeAccessTitle,
        description: objectShareRemoveAccessMessages.loseAccess,
    },
    inheritedStays: {
        title: objectShareMessages.removeAccessTitle,
        description: objectShareRemoveAccessMessages.inheritedStays,
    },
    workspaceStays: {
        title: objectShareMessages.removeAccessTitle,
        description: objectShareRemoveAccessMessages.workspaceStays,
    },
    selfLoseAccess: {
        title: objectShareMessages.removeAccessSelfTitle,
        description: objectShareRemoveAccessMessages.selfLoseAccess,
    },
    selfLoseEditAccess: {
        title: objectShareMessages.removeAccessSelfTitle,
        description: objectShareRemoveAccessMessages.selfLoseEditAccess,
    },
    selfRestrict: {
        title: objectShareMessages.selfRestrictTitle,
        description: objectShareMessages.selfRestrictWarning,
    },
} satisfies Record<RowConfirmKind, { title: MessageDescriptor; description: MessageDescriptor }>;

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
 * controller ownership, the row confirm flow, open/close and the
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
    /** Title and body of the confirm a staged row change waits on, or undefined when none is. */
    rowConfirm: { title: string; description: string } | undefined;

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
    rowRemoveDisabledTooltip: (grantee: IObjectShareGrantee) => string;
    /** Whether this row's direct grant is above the caller's level, so nothing on it may change. */
    isRowAboveCaller: (grantee: IObjectShareGrantee) => boolean;
    /** Whether this row's controls must stay disabled (see `granteeControlsLocked`). */
    isRowControlsLocked: (grantee: IObjectShareGrantee) => boolean;

    /** Close the whole dialog, handing the draft over and discarding any staged row change. */
    onClose: () => void;
    /**
     * Handle a grantee row's permission change. The signed-in user's own sole grant is
     * staged for the "Restrict your access?" row confirm; every other row commits immediately.
     */
    onRowPermissionChange: (grantee: IObjectShareGrantee, level: ObjectSharePermissionLevel) => void;
    /** Handle a grantee row's remove: staged for the row confirm, except in a draft. */
    onRowRemove: (grantee: IObjectShareGrantee) => void;
    /** Dismiss the row confirm, leaving the grantee's access unchanged. */
    onRowConfirmCancel: () => void;
    /** Apply the staged row change: lower the user's own level, or remove the grantee. */
    onRowConfirm: () => void;
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
 * the controller, the row confirm flow, the mutation-gating flags, and
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

    const [pendingRowChange, setPendingRowChange] = useState<IPendingRowChange | undefined>(undefined);

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
    // classified it as self-managed — lowering it routes through the confirm, raising it
    // (allowed when a group grants more) commits directly.
    const onRowPermissionChange = useCallback(
        (grantee: IObjectShareGrantee, level: ObjectSharePermissionLevel) => {
            if (state.selfManagedGranteeId === grantee.id && levelsBelow(grantee.level).includes(level)) {
                // Stage the confirm only for a pick that would really move the level the
                // user effectively holds. Comparing against the displayed level instead
                // opened "Restrict your access?" for a pick under an inherited floor, which
                // the controller then refuses — the user would confirm a restriction that
                // never happens. Same predicate the controller applies.
                if (changesEffectiveLevel(grantee, level)) {
                    setPendingRowChange({ grantee, level, kind: "selfRestrict" });
                }
                return;
            }
            void actions.changePermissionLevel(grantee.id, level);
        },
        [state.selfManagedGranteeId, actions],
    );

    const onRowRemove = (grantee: IObjectShareGrantee) => {
        // A draft row is only staged, so removing it takes no one's access away.
        const kind = draft ? undefined : removeAccessConfirmKind(grantee, state);
        if (kind) {
            setPendingRowChange({ grantee, level: "none", kind });
            return;
        }
        void actions.removeGrantee(grantee.id);
    };

    const onRowConfirm = () => {
        if (!pendingRowChange) {
            return;
        }
        const { grantee, level } = pendingRowChange;
        setPendingRowChange(undefined);
        if (level === "none") {
            void actions.removeGrantee(grantee.id);
        } else {
            void actions.changePermissionLevel(grantee.id, level);
        }
    };

    const rowConfirm = pendingRowChange && {
        title: intl.formatMessage(ROW_CONFIRM_COPY[pendingRowChange.kind].title),
        description: intl.formatMessage(ROW_CONFIRM_COPY[pendingRowChange.kind].description, {
            name: granteeDisplayPair(pendingRowChange.grantee).name,
        }),
    };

    const inheritedCoveredTooltip = intl.formatMessage(objectShareMessages.granteeLevelInheritedCovered);

    // The server refuses changing or removing a grant above the caller's own level.
    const isRowAboveCaller = useCallback(
        (grantee: IObjectShareGrantee) =>
            state.callerLevel !== undefined &&
            grantee.directLevel !== undefined &&
            levelsAbove(state.callerLevel).includes(grantee.directLevel),
        [state.callerLevel],
    );

    const coveredByWorkspacePermissionTooltip = intl.formatMessage(
        objectShareMessages.granteeCoveredByWorkspacePermission,
    );
    const aboveCallerUserTooltip = intl.formatMessage(objectShareMessages.granteeAboveCallerUser);
    const aboveCallerGroupTooltip = intl.formatMessage(objectShareMessages.granteeAboveCallerGroup);

    const rowLock = useCallback(
        (
            grantee: IObjectShareGrantee,
        ): { levels: ObjectSharePermissionLevel[]; tooltip: string } | undefined => {
            if (isRowAboveCaller(grantee)) {
                const tooltip = grantee.kind === "group" ? aboveCallerGroupTooltip : aboveCallerUserTooltip;
                return { levels: [...ALL_LEVELS], tooltip };
            }
            if (state.roleLockedGranteeId === grantee.id) {
                return { levels: levelsBelow("EDIT"), tooltip: coveredByWorkspacePermissionTooltip };
            }
            return undefined;
        },
        [
            isRowAboveCaller,
            state.roleLockedGranteeId,
            aboveCallerUserTooltip,
            aboveCallerGroupTooltip,
            coveredByWorkspacePermissionTooltip,
        ],
    );

    const rowDisabledLevels = useCallback(
        (grantee: IObjectShareGrantee) => {
            const lock = rowLock(grantee);
            if (lock) {
                return lock.levels;
            }
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
        [rowLock, state.selfManagedGranteeId, state.selfManagedDisabledLevels, state.grantableDisabledLevels],
    );

    const rowDisabledLevelTooltips = useCallback(
        (grantee: IObjectShareGrantee) => {
            const lock = rowLock(grantee);
            if (lock) {
                return Object.fromEntries(lock.levels.map((level) => [level, lock.tooltip]));
            }
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
        [rowLock, inheritedCoveredTooltip],
    );

    const isRowRemoveDisabled = useCallback(
        (grantee: IObjectShareGrantee) => grantee.directLevel === undefined || rowLock(grantee) !== undefined,
        [rowLock],
    );

    const removeInheritedTooltip = intl.formatMessage(objectShareMessages.granteeRemoveInherited);
    const rowRemoveDisabledTooltip = useCallback(
        (grantee: IObjectShareGrantee) => rowLock(grantee)?.tooltip ?? removeInheritedTooltip,
        [rowLock, removeInheritedTooltip],
    );

    const grantLimitTooltip = intl.formatMessage(objectShareMessages.toastEscalationRefused);

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
        rowConfirm,
        isMutable,
        isLoading,
        workspaceDisabledLevels: state.workspaceDisabledLevels,
        grantableDisabledLevels: state.grantableDisabledLevels,
        grantLimitTooltip,
        rowDisabledLevels,
        rowDisabledLevelTooltips,
        isRowRemoveDisabled,
        isRowControlsLocked,
        rowRemoveDisabledTooltip,
        isRowAboveCaller,
        onClose: closeDialog,
        onRowPermissionChange,
        onRowRemove,
        onRowConfirmCancel: () => setPendingRowChange(undefined),
        onRowConfirm,
    };
}
