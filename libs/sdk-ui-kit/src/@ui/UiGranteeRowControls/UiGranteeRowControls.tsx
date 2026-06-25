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
    onLabelsChange: (selectedIds: string[]) => void;
    /** Fires only for selectable rows (VIEW/SHARE); EDIT rows have no level control. */
    onPermissionChange: (level: PermissionMenuLevel) => void;
    onTransferOwnership?: () => void;
    onRemoveAccess?: () => void;
    /** Disables both triggers, e.g. while the row's change is saving. */
    isDisabled?: boolean;
    dataTestId?: string;
}

/**
 * Per-row controls in the OLP share dialog: a permission trigger
 * ({@link UiPermissionMenu}) plus a "⋯" menu ({@link UiMoreOptionsMenu}) for
 * labels access and Transfer ownership, with an optional inherited-permission
 * warning badge.
 *
 * @internal
 */
export function UiGranteeRowControls({
    labels,
    selectedLabelIds,
    permissionLevel,
    effectivePermission,
    onLabelsChange,
    onPermissionChange,
    onTransferOwnership,
    onRemoveAccess,
    isDisabled,
    dataTestId,
}: IUiGranteeRowControlsProps) {
    const intl = useIntl();

    const hasLabels = labels.length > 0;

    // EDIT is display-only: the dialog can't assign or change it, and offering the
    // VIEW/SHARE menu on an EDIT row would silently downgrade the grant on pick.
    // So an EDIT row shows a static, non-interactive "Can edit" label instead of
    // the permission dropdown.
    const isReadOnlyLevel = permissionLevel === "EDIT";

    const permissionTriggerText = intl.formatMessage(
        isReadOnlyLevel
            ? olpPermissionMessages.canEdit
            : permissionLevel === "SHARE"
              ? olpPermissionMessages.canViewAndShare
              : olpPermissionMessages.canView,
    );

    // A read-only level has no permission dropdown to host Remove access, so that
    // action moves into the ⋯ menu for those rows (dropdown rows keep it in the menu).
    const removeInMoreOptions = isReadOnlyLevel ? onRemoveAccess : undefined;

    // Nothing to put in the ⋯ menu → drop it.
    const hasMoreOptions = hasLabels || !!onTransferOwnership || !!removeInMoreOptions;

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
            {permissionLevel === "EDIT" ? (
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
                    selectedLevel={permissionLevel}
                    onPermissionChange={onPermissionChange}
                    onRemoveAccess={onRemoveAccess}
                />
            )}
            {hasMoreOptions ? (
                <UiMoreOptionsMenu
                    labels={hasLabels ? labels : undefined}
                    selectedLabelIds={selectedLabelIds}
                    onLabelsChange={onLabelsChange}
                    onTransferOwnership={onTransferOwnership}
                    onRemoveAccess={removeInMoreOptions}
                    isDisabled={isDisabled}
                />
            ) : null}
        </div>
    );
}
