// (C) 2025-2026 GoodData Corporation

import { DefaultUiMenuInteractiveItem, type IUiMenuInteractiveItemProps } from "@gooddata/sdk-ui-kit";

import { type IDrillSelectDropdownMenuItemData } from "../hooks/useDrillSelectDropdownMenuItems.js";

export function DrillSelectDropdownMenuItem(
    props: IUiMenuInteractiveItemProps<IDrillSelectDropdownMenuItemData>,
) {
    const { item, isFocused } = props;

    if (!item.stringTitle) {
        return (
            <div className="gd-drill-to-url-modal-picker s-drill-to-url-modal-picker">
                <div className="gd-spinner small" />
            </div>
        );
    }

    return (
        <div className={`s-gd-drill-modal-picker-item s-${item.data.type}`}>
            <DefaultUiMenuInteractiveItem item={item} isFocused={isFocused} />
        </div>
    );
}
