// (C) 2007-2025 GoodData Corporation
import React from "react";

import cx from "classnames";

import { Bubble, BubbleHoverTrigger, IAlignPoint } from "@gooddata/sdk-ui-kit";

interface IListItemTooltipProps extends React.HTMLProps<HTMLSpanElement> {
    bubbleAlignPoints: IAlignPoint[];
}

export function ListItemTooltip({
    children,
    className,
    bubbleAlignPoints,
    ...restProps
}: IListItemTooltipProps) {
    return (
        <span className={cx("gd-list-item-tooltip", className)} {...restProps}>
            <BubbleHoverTrigger>
                <span className="gd-icon-circle-question gd-list-item-tooltip-icon" />
                <Bubble alignPoints={bubbleAlignPoints}>{children}</Bubble>
            </BubbleHoverTrigger>
        </span>
    );
}
