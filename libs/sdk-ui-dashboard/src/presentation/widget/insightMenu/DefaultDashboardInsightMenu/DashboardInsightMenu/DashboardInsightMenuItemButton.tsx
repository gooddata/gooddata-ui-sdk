// (C) 2020-2022 GoodData Corporation
import React from "react";
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
                {icon ? typeof icon === "string" ? <i className={icon} /> : icon : null}
                {itemName}
            </span>
        </Item>,
        itemId,
        disabled,
        tooltip,
    );
};

function renderButtonWithTooltip(button: JSX.Element, id: string, disabled?: boolean, tooltip?: string) {
    if (tooltip && disabled) {
        return (
            <BubbleHoverTrigger className="s-gd-bubble-trigger-options-menu-item">
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
