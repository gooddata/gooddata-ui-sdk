// (C) 2022 GoodData Corporation

import React from "react";
import { Bubble, BubbleHoverTrigger } from "../Bubble";
import { Typography } from "../Typography";
import { IAlignPoint } from "../typings/positioning";

const TOOLTIP_ALIGN_POINTS: IAlignPoint[] = [{ align: "bl tl", offset: { x: 10, y: 4 } }];

interface IStylingPickerHeaderProps {
    title: string;
    titleTooltip?: string;
}

export const StylingPickerHeader: React.FC<IStylingPickerHeaderProps> = ({ title, titleTooltip }) => {
    return (
        <div className="gd-styling-picker-header s-styling-picker-header">
            <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                <div className="gd-styling-picker-header-content">
                    <Typography tagName="h3">{title}</Typography>
                    {titleTooltip && (
                        <span className="gd-icon-circle-question gd-styling-picker-header-icon" />
                    )}
                </div>
                {titleTooltip && (
                    <Bubble className="bubble-primary" alignPoints={TOOLTIP_ALIGN_POINTS}>
                        {titleTooltip}
                    </Bubble>
                )}
            </BubbleHoverTrigger>
        </div>
    );
};
