// (C) 2020-2025 GoodData Corporation
import React, { ReactElement, ReactNode } from "react";

import cx from "classnames";

import { Bubble, BubbleHoverTrigger, IAlignPoint, Item } from "@gooddata/sdk-ui-kit";

import { IInsightMenuItemButton } from "../../types.js";

const tooltipAlignPoints: IAlignPoint[] = [{ align: "cl cr" }];

export const DashboardInsightMenuItemButton: React.FC<
    Omit<IInsightMenuItemButton, "type"> & { submenu?: boolean }
> = (props) => {
    const { itemId, itemName, disabled, icon, onClick, tooltip, className, submenu = false } = props;

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
        itemId,
        disabled,
        tooltip,
    );
};

function renderButtonWithTooltip(
    button: ReactElement,
    id: string,
    disabled?: boolean,
    tooltip?: string | ReactNode,
) {
    if (tooltip && disabled) {
        return (
            <BubbleHoverTrigger className="s-gd-bubble-trigger-options-menu-item" eventsOnBubble>
                {button}
                <Bubble
                    className={`bubble-primary bubble-primary-${id} s-bubble-primary-${id}`}
                    alignPoints={tooltipAlignPoints}
                >
                    {tooltip}
                </Bubble>
            </BubbleHoverTrigger>
        );
    } else {
        return button;
    }
}
