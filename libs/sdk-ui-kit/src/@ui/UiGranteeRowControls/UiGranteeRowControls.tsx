// (C) 2026 GoodData Corporation

import { useIntl } from "react-intl";

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
    permissionLevel: PermissionMenuLevel;
    /**
     * Set only when the grantee inherits a higher permission than `permissionLevel`
     * (e.g. from a group); drives the warning badge. Undefined when not elevated.
     */
    effectivePermission?: PermissionMenuLevel;
    onLabelsChange: (selectedIds: string[]) => void;
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

    const permissionTriggerText = intl.formatMessage(
        permissionLevel === "SHARE" ? olpPermissionMessages.canViewAndShare : olpPermissionMessages.canView,
    );

    // No labels and no transfer → nothing in the ⋯ menu, so drop it.
    const hasMoreOptions = hasLabels || !!onTransferOwnership;

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
            {hasMoreOptions ? (
                <UiMoreOptionsMenu
                    labels={hasLabels ? labels : undefined}
                    selectedLabelIds={selectedLabelIds}
                    onLabelsChange={onLabelsChange}
                    onTransferOwnership={onTransferOwnership}
                    isDisabled={isDisabled}
                />
            ) : null}
        </div>
    );
}
