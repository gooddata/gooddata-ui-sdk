// (C) 2007-2025 GoodData Corporation
import { HTMLProps } from "react";
import { Bubble, BubbleHoverTrigger, IAlignPoint } from "@gooddata/sdk-ui-kit";
import cx from "classnames";

interface IListItemTooltipProps extends HTMLProps<HTMLSpanElement> {
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
