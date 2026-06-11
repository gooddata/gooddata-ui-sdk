// (C) 2026 GoodData Corporation

import { useIntl } from "react-intl";

import { olpGranteeControlsMessages, olpPermissionMessages } from "../../locales.js";
import { bem } from "../@utils/bem.js";
import { UiButton } from "../UiButton/UiButton.js";
import {
    type IUiLabelsPickerItem,
    UiLabelsPicker,
    isLabelsPickerItemChecked,
} from "../UiLabelsPicker/UiLabelsPicker.js";
import { type PermissionMenuLevel, UiPermissionMenu } from "../UiPermissionMenu/UiPermissionMenu.js";

const { b } = bem("gd-ui-kit-grantee-row-controls");

/**
 * @internal
 */
export interface IUiGranteeRowControlsProps {
    /** All labels available on the parent attribute. */
    labels: ReadonlyArray<IUiLabelsPickerItem>;
    /** Currently selected label ids. Locked items are always treated as selected. */
    selectedLabelIds: ReadonlyArray<string>;
    /** Current permission level for the grantee. */
    permissionLevel: PermissionMenuLevel;
    /** Fires when the labels picker commits a new selection. */
    onLabelsChange: (selectedIds: string[]) => void;
    /** Fires when the user picks a new permission level. */
    onPermissionChange: (level: PermissionMenuLevel) => void;
    /** Fires when the user picks Transfer ownership in the permission menu. */
    onTransferOwnership?: () => void;
    /** Fires when the user picks Remove access in the permission menu. */
    onRemoveAccess?: () => void;
    /** Test id forwarded to the root element. */
    dataTestId?: string;
}

/**
 * Pair of controls shown on every grantee row in the OLP share dialog:
 * a labels-picker trigger and a permission-menu trigger. Both triggers are
 * Tertiary `small` `UiButton`s with `chevronDown`
 * and open their respective popovers on click.
 *
 * @internal
 */
export function UiGranteeRowControls({
    labels,
    selectedLabelIds,
    permissionLevel,
    onLabelsChange,
    onPermissionChange,
    onTransferOwnership,
    onRemoveAccess,
    dataTestId,
}: IUiGranteeRowControlsProps) {
    const intl = useIntl();
    const total = labels.length;
    // Locked labels always count as selected. Reuse the picker's predicate so the
    // trigger never shows "N-1 of N" when a locked id is omitted from selectedLabelIds.
    const selected = labels.filter((label) => isLabelsPickerItemChecked(label, selectedLabelIds)).length;
    const labelsTriggerText =
        selected === total
            ? intl.formatMessage(olpGranteeControlsMessages.allLabels)
            : intl.formatMessage(olpGranteeControlsMessages.labelsCount, { selected, total });
    const permissionTriggerText = intl.formatMessage(
        permissionLevel === "SHARE" ? olpPermissionMessages.canViewAndShare : olpPermissionMessages.canView,
    );

    return (
        <div className={b()} data-testid={dataTestId}>
            <UiLabelsPicker
                anchor={
                    <UiButton
                        label={labelsTriggerText}
                        size="small"
                        variant="dropdownInline"
                        iconAfter="navigateDown"
                    />
                }
                items={labels}
                defaultSelectedIds={selectedLabelIds}
                onApply={onLabelsChange}
            />
            <UiPermissionMenu
                anchor={
                    <UiButton
                        label={permissionTriggerText}
                        size="small"
                        variant="dropdownInline"
                        iconAfter="navigateDown"
                    />
                }
                selectedLevel={permissionLevel}
                onPermissionChange={onPermissionChange}
                onTransferOwnership={onTransferOwnership}
                onRemoveAccess={onRemoveAccess}
            />
        </div>
    );
}
