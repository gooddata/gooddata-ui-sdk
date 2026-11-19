// (C) 2020-2026 GoodData Corporation

import { type ReactElement, type ReactNode } from "react";

import cx from "classnames";

import { Item, UiTooltip } from "@gooddata/sdk-ui-kit";

import { type IInsightMenuItemButton } from "../../types.js";

export const DashboardInsightMenuItemButton = (
    props: Omit<IInsightMenuItemButton, "type"> & {
        submenu?: boolean;
        /**
         * Id for the element holding the disabled reason. When set, the menu item references it with
         * aria-describedby, so the reason is rendered once as the description and kept out of the name.
         */
        descriptionId?: string;
    },
) => {
    const {
        itemName,
        itemId,
        disabled,
        icon,
        onClick,
        tooltip,
        isFocused,
        className,
        submenu = false,
        descriptionId,
    } = props;

    // for JSX icons we need an extra gd-icon-wrapper class to align the icon and the text vertically
    return renderButtonWithTooltip(
        <Item
            className={className}
            testId={itemId}
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            subMenu={submenu}
        >
            <span className={cx({ "gd-icon-wrapper": icon && typeof icon !== "string" })}>
                {icon ? typeof icon === "string" ? <i aria-hidden className={icon} /> : icon : null}
                {itemName}
            </span>
        </Item>,
        disabled,
        tooltip,
        isFocused,
        descriptionId,
    );
};

function renderButtonWithTooltip(
    button: ReactElement,
    disabled?: boolean,
    tooltip?: string | ReactNode,
    isFocused?: boolean,
    descriptionId?: string,
) {
    if (tooltip && disabled) {
        return (
            <>
                <UiTooltip
                    triggerBy={isFocused ? [] : ["hover", "focus"]}
                    arrowPlacement="left"
                    optimalPlacement
                    content={tooltip}
                    anchor={button}
                    accessibilityHidden
                />
                {/* The only accessible copy of the disabled reason. With descriptionId it is the target
                    of the item's aria-describedby and hidden from the item's name content (a directly
                    referenced hidden element still provides the description); without it, it is
                    plain screen-reader text next to the item. */}
                <span id={descriptionId} className="sr-only" aria-hidden={descriptionId ? true : undefined}>
                    {tooltip}
                </span>
            </>
        );
    } else {
        return button;
    }
}
