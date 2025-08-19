// (C) 2007-2025 GoodData Corporation
import React from "react";

import cx from "classnames";

import { Bubble, BubbleHoverTrigger, IAlignPoint } from "@gooddata/sdk-ui-kit";

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
