// (C) 2026 GoodData Corporation

import { type MessageDescriptor, useIntl } from "react-intl";

import { type AccessGranularPermission } from "@gooddata/sdk-model";

import { olpPermissionMessages } from "../../locales.js";
import { bem } from "../@utils/bem.js";
import { UiButton } from "../UiButton/UiButton.js";
import { UiIcon } from "../UiIcon/UiIcon.js";
import { type IUiLabelsChecklistItem } from "../UiLabelsChecklist/UiLabelsChecklist.js";
import {
    type PermissionMenuLevel,
    UiPermissionMenu,
    permissionLevelMessage,
} from "../UiPermissionMenu/UiPermissionMenu.js";
import { UiTooltip } from "../UiTooltip/UiTooltip.js";

const { b, e } = bem("gd-ui-kit-grantee-row-controls");

// The warning badge names an inherited EDIT or SHARE. VIEW can never be the
// higher level and has no entry — an absent entry means "no badge".
const EFFECTIVE_PERMISSION_TOOLTIP: Partial<Record<AccessGranularPermission, MessageDescriptor>> = {
    EDIT: olpPermissionMessages.effectivePermissionTooltipEdit,
    SHARE: olpPermissionMessages.effectivePermissionTooltipShare,
};

/**
 * @internal
 */
export interface IUiGranteeRowControlsProps {
    /** Locked items are always treated as selected. */
    labels: ReadonlyArray<IUiLabelsChecklistItem>;
    selectedLabelIds: ReadonlyArray<string>;
    /** The grantee's current permission level — anchors the permission menu. */
    permissionLevel: AccessGranularPermission;
    /**
     * CONTRACT: set only when the grantee inherits a higher permission than
     * `permissionLevel` (e.g. via a group) — the control renders the warning badge
     * whenever this is set and does not re-check the ordering. Undefined when the
     * assigned level already is the effective one.
     */
    effectivePermission?: AccessGranularPermission;
    /** Levels rendered disabled in the permission menu — see {@link UiPermissionMenu}. */
    disabledLevels?: ReadonlyArray<PermissionMenuLevel>;
    /** Tooltip shown on disabled level rows in place of the level's info text. */
    disabledTooltip?: string;
    onLabelsChange: (selectedIds: string[]) => void;
    onPermissionChange: (level: PermissionMenuLevel) => void;
    onRemoveAccess?: () => void;
    /** Disables the permission trigger, e.g. while the row's change is saving. */
    isDisabled?: boolean;
    dataTestId?: string;
}

/**
 * Per-row controls in the OLP share dialog: the permission dropdown
 * ({@link UiPermissionMenu}) hosting the level choice, the labels drill-in and
 * Remove access, with an optional inherited-permission warning badge.
 *
 * @internal
 */
export function UiGranteeRowControls({
    labels,
    selectedLabelIds,
    permissionLevel,
    effectivePermission,
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

    // The caller sets `effectivePermission` only when it outranks the assigned level
    // (the ext side owns that comparison) — render the badge whenever it is set and
    // has tooltip copy, without re-deriving the level ordering here.
    const inheritedTooltipMessage =
        effectivePermission === undefined ? undefined : EFFECTIVE_PERMISSION_TOOLTIP[effectivePermission];
    const effectiveTooltip = inheritedTooltipMessage
        ? intl.formatMessage(inheritedTooltipMessage)
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
                        label={intl.formatMessage(permissionLevelMessage(permissionLevel))}
                        size="small"
                        variant="dropdownInline"
                        iconAfter="navigateDown"
                        isDisabled={isDisabled}
                    />
                }
                selectedLevel={permissionLevel}
                onPermissionChange={onPermissionChange}
                disabledLevels={disabledLevels}
                disabledTooltip={disabledTooltip}
                labels={hasLabels ? labels : undefined}
                selectedLabelIds={selectedLabelIds}
                onLabelsChange={onLabelsChange}
                onRemoveAccess={onRemoveAccess}
            />
        </div>
    );
}
