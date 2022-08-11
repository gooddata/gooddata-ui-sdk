// (C) 2022 GoodData Corporation

import React from "react";
import { Bubble, BubbleHoverTrigger } from "../Bubble";
import { Typography } from "../Typography";
import { IAlignPoint } from "../typings/positioning";

const TOOLTIP_ALIGN_POINTS: IAlignPoint[] = [{ align: "tr tl" }];

// offset arrow to solve an issue with a tooltip being hidden when cursor goes to the right part of the icon
const BUBBLE_ARROW_LARGE_OFFSET = 20;
const BUBBLE_ARROW_SMALL_OFFSET = 13;

export const BUBBLE_ARROW_OFFSETS = {
    "tr tl": [BUBBLE_ARROW_LARGE_OFFSET, 0],
    "cr bl": [BUBBLE_ARROW_LARGE_OFFSET, BUBBLE_ARROW_SMALL_OFFSET],
    "cr tl": [BUBBLE_ARROW_LARGE_OFFSET, -BUBBLE_ARROW_SMALL_OFFSET],
    "cl cr": [-BUBBLE_ARROW_SMALL_OFFSET, 0],
    "bc tc": [0, BUBBLE_ARROW_LARGE_OFFSET],
};

interface IStylingPickerHeaderProps {
    title: string;
    titleTooltip?: string;
}

export const StylingPickerHeader: React.FC<IStylingPickerHeaderProps> = ({ title, titleTooltip }) => {
    return (
        <div className="gd-styling-picker-header s-styling-picker-header">
            <div className="gd-styling-picker-header-content">
                <Typography tagName="h3">{title}</Typography>
                <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                    {titleTooltip && (
                        <span className="gd-icon-circle-question gd-styling-picker-header-icon" />
                    )}
                    {titleTooltip && (
                        <Bubble
                            className="bubble-primary"
                            alignPoints={TOOLTIP_ALIGN_POINTS}
                            arrowOffsets={BUBBLE_ARROW_OFFSETS}
                        >
                            {titleTooltip}
                        </Bubble>
                    )}
                </BubbleHoverTrigger>
            </div>
        </div>
    );
};
