// (C) 2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { IAlignPoint } from "../typings/positioning.js";
import { ArrowOffset, Bubble, BubbleHoverTrigger } from "../Bubble/index.js";
import { ALIGN_POINTS, ARROW_OFFSETS } from "./constants.js";

/**
 * @internal
 */
export interface ITooltipIconProps {
    text: string;
    iconClass: string;
    alignPoints?: IAlignPoint[];
    arrowOffsets?: Record<string, ArrowOffset>;
}

/**
 * @internal
 */
export const TooltipIcon: React.FC<ITooltipIconProps> = (props) => {
    const { text, iconClass, arrowOffsets = ARROW_OFFSETS, alignPoints = ALIGN_POINTS } = props;
    return (
        <span>
            <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                <span className={cx("gd-tooltip-icon", iconClass)} />
                <Bubble arrowOffsets={arrowOffsets} alignPoints={alignPoints}>
                    {text}
                </Bubble>
            </BubbleHoverTrigger>
        </span>
    );
};
