// (C) 2023 GoodData Corporation
import React from "react";

import { BubbleHoverTrigger, Bubble, IAlignPoint } from "@gooddata/sdk-ui-kit";
import { IFilterButtonCustomIcon } from "../../interfaces/index.js";

const DEFAULT_BUBBLE_ALIGN_POINTS: IAlignPoint[] = [{ align: "bc tl", offset: { x: 0, y: 5 } }];

export interface IFilterButtonCustomIconProps {
    customIcon?: IFilterButtonCustomIcon;
}

export const FilterButtonCustomIcon: React.FC<IFilterButtonCustomIconProps> = ({ customIcon }) => {
    if (!customIcon) {
        return null;
    }

    const { icon, tooltip, bubbleClassNames, bubbleAlignPoints } = customIcon;

    return (
        <div className="gd-filter-button-custom-icon-wrapper s-gd-filter-button-custom-icon-wrapper">
            <BubbleHoverTrigger>
                <i className={`gd-filter-button-custom-icon s-gd-filter-button-custom-icon ${icon}`} />
                <Bubble
                    className={`bubble-primary ${bubbleClassNames || ""}`}
                    alignPoints={bubbleAlignPoints || DEFAULT_BUBBLE_ALIGN_POINTS}
                >
                    {tooltip}
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
};
