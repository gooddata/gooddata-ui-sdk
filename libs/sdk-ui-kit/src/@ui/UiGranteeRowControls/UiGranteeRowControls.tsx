// (C) 2026 GoodData Corporation

import { useIntl } from "react-intl";

import { type AccessGranularPermission } from "@gooddata/sdk-model";

import { olpPermissionMessages } from "../../locales.js";
import { bem } from "../@utils/bem.js";
import { UiButton } from "../UiButton/UiButton.js";
import { UiIcon } from "../UiIcon/UiIcon.js";
import { type IUiLabelsChecklistItem } from "../UiLabelsChecklist/UiLabelsChecklist.js";
import { UiMoreOptionsMenu } from "../UiMoreOptionsMenu/UiMoreOptionsMenu.js";
import { type PermissionMenuLevel, UiPermissionMenu } from "../UiPermissionMenu/UiPermissionMenu.js";
import { UiTooltip } from "../UiTooltip/UiTooltip.js";

const { b, e } = bem("gd-ui-kit-grantee-row-controls");

/**
 * @internal
 */
export interface IUiGranteeRowControlsProps {
    /** Locked items are always treated as selected. */
    labels: ReadonlyArray<IUiLabelsChecklistItem>;
    selectedLabelIds: ReadonlyArray<string>;
    /** The level to display. `EDIT` renders read-only; VIEW/SHARE are selectable. */
    permissionLevel: AccessGranularPermission;
    /**
     * Set only when the grantee inherits a higher permission than `permissionLevel`
     * (e.g. from a group); drives the warning badge. Undefined when not elevated.
     */
    effectivePermission?: AccessGranularPermission;
    /**
     * Merge every action into the permission dropdown: the labels drill-in and
     * Remove access render inside {@link UiPermissionMenu} (no "⋯" menu), and
     * the level dropdown is offered even for an EDIT row. Used for the signed-in
     * user's own row when they manage their own access.
     */
    mergedControls?: boolean;
    /** Levels rendered disabled in the permission menu — see {@link UiPermissionMenu}. */
    disabledLevels?: ReadonlyArray<PermissionMenuLevel>;
    /** Tooltip shown on disabled level rows in place of the level's info text. */
    disabledTooltip?: string;
    onLabelsChange: (selectedIds: string[]) => void;
    /** Fires only for selectable rows (VIEW/SHARE); EDIT rows have no level control. */
    onPermissionChange: (level: PermissionMenuLevel) => void;
    onRemoveAccess?: () => void;
    /** Disables both triggers, e.g. while the row's change is saving. */
    isDisabled?: boolean;
    dataTestId?: string;
}

/**
 * Per-row controls in the OLP share dialog: a permission trigger
 * ({@link UiPermissionMenu}) plus a "⋯" menu ({@link UiMoreOptionsMenu}) for
 * labels access, with an optional inherited-permission warning badge.
 *
 * @internal
 */
export function UiGranteeRowControls({
    labels,
    selectedLabelIds,
    permissionLevel,
    effectivePermission,
    mergedControls,
    disabledLevels,
    disabledTooltip,
    onLabelsChange,
    onPermissionChange,
    onRemoveAccess,
    isDisabled,
    dataTestId,
}: IUiGranteeRowControlsProps) {
    const intl = useIntl();

    const hasLabels = labels.length > 0;

    // EDIT is display-only: the dialog can't assign or change it, and offering the
    // VIEW/SHARE menu on an EDIT row would silently downgrade the grant on pick.
    // So an EDIT row shows a static, non-interactive "Can edit" label instead of
    // the permission dropdown — except in merged mode, where the user manages
    // their own access and downgrading is exactly the offered action.
    const isReadOnlyLevel = permissionLevel === "EDIT" && !mergedControls;
    // EDIT is not selectable — a merged EDIT row anchors on "Can edit" with no
    // radio checked, offering only the (lower) selectable levels.
    const selectedLevel = permissionLevel === "EDIT" ? undefined : permissionLevel;

    const permissionTriggerText = intl.formatMessage(
        permissionLevel === "EDIT"
            ? olpPermissionMessages.canEdit
            : permissionLevel === "SHARE"
              ? olpPermissionMessages.canViewAndShare
              : olpPermissionMessages.canView,
    );

    // A read-only level has no permission dropdown to host Remove access, so that
    // action moves into the ⋯ menu for those rows (dropdown rows keep it in the menu).
    const removeInMoreOptions = isReadOnlyLevel ? onRemoveAccess : undefined;

    // Nothing to put in the ⋯ menu → drop it. Merged mode hosts everything in
    // the permission dropdown, so the ⋯ menu never renders there.
    const hasMoreOptions = !mergedControls && (hasLabels || !!removeInMoreOptions);

    // Guard on permissionLevel too, so the badge can't show when the assigned
    // level already matches the inherited one.
    const isInheritedHigherPermission = permissionLevel === "VIEW" && effectivePermission === "SHARE";
    const effectiveTooltip = isInheritedHigherPermission
        ? intl.formatMessage(olpPermissionMessages.effectivePermissionTooltipShare)
        : undefined;

    return (
        <div className={b()} data-testid={dataTestId}>
            {effectiveTooltip ? (
                <UiTooltip
                    triggerBy={["hover", "focus"]}
                    content={effectiveTooltip}
                    anchor={
                        <span
                            className={e("effective-warning")}
                            role="img"
                            aria-label={intl.formatMessage(
                                olpPermissionMessages.effectivePermissionAriaLabel,
                            )}
                            tabIndex={0}
                        >
                            <UiIcon type="warning" size={16} color="warning" />
                        </span>
                    }
                />
            ) : null}
            {isReadOnlyLevel ? (
                <span className={e("readonly-permission")}>{permissionTriggerText}</span>
            ) : (
                <UiPermissionMenu
                    anchor={
                        <UiButton
                            label={permissionTriggerText}
                            size="small"
                            variant="dropdownInline"
                            iconAfter="navigateDown"
                            isDisabled={isDisabled}
                        />
                    }
                    selectedLevel={selectedLevel}
                    onPermissionChange={onPermissionChange}
                    disabledLevels={disabledLevels}
                    disabledTooltip={disabledTooltip}
                    labels={mergedControls && hasLabels ? labels : undefined}
                    selectedLabelIds={mergedControls ? selectedLabelIds : undefined}
                    onLabelsChange={mergedControls ? onLabelsChange : undefined}
                    onRemoveAccess={onRemoveAccess}
                />
            )}
            {hasMoreOptions ? (
                <UiMoreOptionsMenu
                    labels={hasLabels ? labels : undefined}
                    selectedLabelIds={selectedLabelIds}
                    onLabelsChange={onLabelsChange}
                    onRemoveAccess={removeInMoreOptions}
                    isDisabled={isDisabled}
                />
            ) : null}
        </div>
    );
}
