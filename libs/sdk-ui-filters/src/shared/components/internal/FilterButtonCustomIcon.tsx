// (C) 2023-2025 GoodData Corporation
import cx from "classnames";
import { BubbleHoverTrigger, Bubble, IAlignPoint } from "@gooddata/sdk-ui-kit";

import { IFilterButtonCustomIcon } from "../../interfaces/index.js";

const DEFAULT_BUBBLE_ALIGN_POINTS: IAlignPoint[] = [{ align: "bc tl", offset: { x: 0, y: 5 } }];

export interface IFilterButtonCustomIconProps {
    customIcon?: IFilterButtonCustomIcon;
    disabled?: boolean;
}

export function FilterButtonCustomIcon({ customIcon, disabled }: IFilterButtonCustomIconProps) {
    if (!customIcon) {
        return null;
    }

    const { icon, tooltip, bubbleClassNames, bubbleAlignPoints } = customIcon;
    const classNames = cx(
        ["gd-filter-button-custom-icon-wrapper", "s-gd-filter-button-custom-icon-wrapper"],
        {
            "disabled s-disabled": disabled,
        },
    );

    return (
        <div className={classNames}>
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
}
