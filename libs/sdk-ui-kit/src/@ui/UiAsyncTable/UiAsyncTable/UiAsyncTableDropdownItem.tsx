// (C) 2025 GoodData Corporation

import { UiCheckbox } from "../../../@ui/UiCheckbox/UiCheckbox.js";
import { ContentDivider } from "../../../Dialog/ContentDivider.js";
import { e } from "../asyncTableBem.js";
import { UiAsyncTableDropdownItemProps } from "../types.js";

function UiAsyncTableDropdownItem({
    label,
    secondaryLabel,
    onClick,
    isSelected,
    isMultiSelect,
    isUnderlined,
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

export default UiAsyncTableDropdownItem;
