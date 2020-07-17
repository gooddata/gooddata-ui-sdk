// (C) 2007-2019 GoodData Corporation
import React from "react";
import Bubble from "@gooddata/goodstrap/lib/Bubble/Bubble";
import BubbleHoverTrigger from "@gooddata/goodstrap/lib/Bubble/BubbleHoverTrigger";
import cx from "classnames";

export const ListItemTooltip: React.FC<React.HTMLProps<HTMLSpanElement>> = ({
    children,
    className,
    ...restProps
}) => (
    <span className={cx("gd-list-item-tooltip", className)} {...restProps}>
        <BubbleHoverTrigger>
            <span className="icon-circle-question gd-list-item-tooltip-icon" />
            <Bubble alignPoints={[{ align: "bc tc" }]}>{children}</Bubble>
        </BubbleHoverTrigger>
    </span>
);
