// (C) 2023-2025 GoodData Corporation
import React from "react";

import { IIconProps } from "../../typings.js";
import { combineIconClasses } from "../../utils.js";

/**
 * @internal
 */
export function Waterfall({ className, width, height, color, ariaHidden }: IIconProps) {
    return (
        <svg
            width={width}
            height={height}
            className={combineIconClasses(className)}
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
        >
            <rect y="9" width="3.00022" height="6.00044" fill={color ?? "#B0BECA"} />
            <rect x="4" y="5" width="3" height="4" fill={color ?? "#B0BECA"} />
            <rect x="8" width="3" height="5" fill={color ?? "#B0BECA"} />
            <rect x="12" width="3" height="15" fill={color ?? "#B0BECA"} />
        </svg>
    );
}
