// (C) 2020-2025 GoodData Corporation
import React, { ReactNode } from "react";
import cx from "classnames";
import { Bubble, BubbleHoverTrigger, IAlignPoint, Item, UiSkeleton } from "@gooddata/sdk-ui-kit";
import { IInsightMenuItemButton } from "../../types.js";

const tooltipAlignPoints: IAlignPoint[] = [{ align: "cl cr" }];

export const DashboardInsightMenuItemButton: React.FC<
    Omit<IInsightMenuItemButton, "type"> & { submenu?: boolean }
> = (props) => {
    const {
        itemId,
        itemName,
        disabled,
        icon,
        onClick,
        tooltip,
        className,
        submenu = false,
        isLoading,
    } = props;

    // for JSX icons we need an extra gd-icon-wrapper class to align the icon and the text vertically
    return renderButtonWithTooltip(
        <Item
            className={className}
            onClick={disabled || isLoading ? undefined : onClick}
            disabled={disabled || isLoading}
            subMenu={submenu}
            isLoading={isLoading}
        >
            {isLoading ? (
                <UiSkeleton
                    direction="row"
                    itemsCount={2}
                    itemWidth={[16, "100%"]}
                    itemHeight={16}
                    itemsGap={10}
                />
            ) : (
                <span className={cx({ "gd-icon-wrapper": icon && typeof icon !== "string" })}>
                    {icon ? typeof icon === "string" ? <i className={icon} /> : icon : null}
                    {itemName}
                </span>
            )}
        </Item>,
        itemId,
        disabled,
        tooltip,
    );
};

function renderButtonWithTooltip(
    button: JSX.Element,
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
