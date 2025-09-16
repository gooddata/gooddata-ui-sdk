// (C) 2020-2025 GoodData Corporation

import { ReactElement, ReactNode } from "react";

import cx from "classnames";

import { Item, UiTooltip } from "@gooddata/sdk-ui-kit";

import { IInsightMenuItemButton } from "../../types.js";

export const DashboardInsightMenuItemButton = (
    props: Omit<IInsightMenuItemButton, "type"> & { submenu?: boolean },
) => {
    const { itemName, disabled, icon, onClick, tooltip, isFocused, className, submenu = false } = props;

    // for JSX icons we need an extra gd-icon-wrapper class to align the icon and the text vertically
    return renderButtonWithTooltip(
        <Item
            className={className}
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            subMenu={submenu}
        >
            <span className={cx({ "gd-icon-wrapper": icon && typeof icon !== "string" })}>
                {icon ? typeof icon === "string" ? <i aria-hidden={true} className={icon} /> : icon : null}
                {itemName}
            </span>
        </Item>,
        disabled,
        tooltip,
        isFocused,
    );
};

function renderButtonWithTooltip(
    button: ReactElement,
    disabled?: boolean,
    tooltip?: string | ReactNode,
    isFocused?: boolean,
) {
    if (tooltip && disabled) {
        return (
            <>
                <UiTooltip
                    triggerBy={isFocused ? [] : ["hover", "focus"]}
                    arrowPlacement="right"
                    optimalPlacement
                    content={tooltip}
                    anchor={button}
                />
                {/* Screen reader announcement area */}
                <div className="sr-only" aria-live="polite">
                    {tooltip}
                </div>
            </>
        );
    } else {
        return button;
    }
}
