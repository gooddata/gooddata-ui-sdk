// (C) 2022-2025 GoodData Corporation

import cx from "classnames";

import { ALIGN_POINTS, ARROW_OFFSETS } from "./constants.js";
import { Bubble } from "../Bubble/Bubble.js";
import { BubbleHoverTrigger } from "../Bubble/BubbleHoverTrigger.js";
import { type ArrowOffset } from "../Bubble/typings.js";
import { type IAlignPoint } from "../typings/positioning.js";

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
export function TooltipIcon({
    text,
    iconClass,
    arrowOffsets = ARROW_OFFSETS,
    alignPoints = ALIGN_POINTS,
}: ITooltipIconProps) {
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
}
