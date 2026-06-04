// (C) 2025-2026 GoodData Corporation

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
                        {/* Don't pass `stopPropagation` — the new @ui/UiCheckbox overlays the
                         * native input on the visible 14×14 control, so a click on the box
                         * always lands on the input. With `stopPropagation` the parent `dropdown-item` div's
                         * onClick (which owns selection here) would never fire. The
                         * checkbox itself stays read-only (no `onChange` prop given) — the
                         * row's click handler is the source of truth. */}
                        <UiCheckbox checked={isSelected ?? false} tabIndex={-1} />
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
