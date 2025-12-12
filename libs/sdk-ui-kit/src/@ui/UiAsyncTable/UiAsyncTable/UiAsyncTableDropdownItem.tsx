// (C) 2025 GoodData Corporation

import { UiCheckbox } from "../../../@ui/UiCheckbox/UiCheckbox.js";
import { ContentDivider } from "../../../Dialog/ContentDivider.js";
import { accessibilityConfigToAttributes } from "../../../typings/utilities.js";
import { e } from "../asyncTableBem.js";
import { type UiAsyncTableDropdownItemProps } from "../types.js";

export function UiAsyncTableDropdownItem({
    label,
    secondaryLabel,
    onClick,
    isSelected,
    isMultiSelect,
    isUnderlined,
    accessibilityConfig,
}: UiAsyncTableDropdownItemProps) {
    return (
        <div className={e("dropdown-item-container", { underlined: isUnderlined ?? false })}>
            <div
                className={e("dropdown-item", {
                    selected: isSelected ?? false,
                    "multi-select": isMultiSelect ?? false,
                })}
                onClick={onClick}
                role="menuitem"
                aria-disabled={false}
                {...accessibilityConfigToAttributes(accessibilityConfig)}
            >
                {isMultiSelect ? (
                    <div className={e("dropdown-item-checkbox")}>
                        <UiCheckbox preventDefault checked={isSelected ?? false} tabIndex={-1} />
                    </div>
                ) : null}
                <div className={e("dropdown-item-label-primary")}>{label}</div>
                {secondaryLabel ? (
                    <div className={e("dropdown-item-label-secondary")}>{secondaryLabel}</div>
                ) : null}
            </div>
            {isUnderlined ? <ContentDivider className={e("dropdown-item-divider")} /> : null}
        </div>
    );
}
