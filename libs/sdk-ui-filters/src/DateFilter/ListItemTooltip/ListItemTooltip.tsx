// (C) 2007-2019 GoodData Corporation
import React from "react";
import { Bubble, BubbleHoverTrigger, IAlignPoint } from "@gooddata/sdk-ui-kit";
import cx from "classnames";

interface IListItemTooltipProps extends React.HTMLProps<HTMLSpanElement> {
    bubbleAlignPoints: IAlignPoint[];
}

export const ListItemTooltip: React.FC<IListItemTooltipProps> = ({
    children,
    className,
    bubbleAlignPoints,
    ...restProps
}) => (
    <span className={cx("gd-list-item-tooltip", className)} {...restProps}>
        <BubbleHoverTrigger>
            <span className="gd-icon-circle-question gd-list-item-tooltip-icon" />
            <Bubble alignPoints={bubbleAlignPoints}>{children}</Bubble>
        </BubbleHoverTrigger>
    </span>
);
