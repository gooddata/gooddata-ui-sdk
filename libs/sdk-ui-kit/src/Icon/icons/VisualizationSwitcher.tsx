// (C) 2024-2025 GoodData Corporation
import React from "react";

import { IIconProps } from "../typings.js";
import { combineIconClasses } from "../utils.js";

/**
 * @internal
 */
export const VisualizationSwitcher: React.FC<IIconProps> = ({ color, className, width, height }) => {
    return (
        <svg
            className={combineIconClasses(className)}
            width={width ?? 24}
            height={height ?? 28}
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10 2.5V1C10 0.447715 9.55228 0 9 0H1C0.447715 0 0 0.447716 0 1V9C0 9.55229 0.447716 10 1 10H2.5V11.5C2.5 12.0523 2.94772 12.5 3.5 12.5H5V14C5 14.5523 5.44772 15 6 15H14C14.5523 15 15 14.5523 15 14V6C15 5.44772 14.5523 5 14 5H12.5V3.5C12.5 2.94772 12.0523 2.5 11.5 2.5H10ZM9 0.8H1C0.889543 0.8 0.8 0.889543 0.8 1V9C0.8 9.11046 0.889543 9.2 1 9.2H2.5V3.5C2.5 2.94772 2.94772 2.5 3.5 2.5H9.2V1C9.2 0.889543 9.11046 0.8 9 0.8ZM3.5 3.3H11.5C11.6105 3.3 11.7 3.38954 11.7 3.5V5H6C5.44772 5 5 5.44772 5 6V11.7H3.5C3.38954 11.7 3.3 11.6105 3.3 11.5V3.5C3.3 3.38954 3.38954 3.3 3.5 3.3ZM14.2 6C14.2 5.88954 14.1105 5.8 14 5.8H6C5.88954 5.8 5.8 5.88954 5.8 6V14C5.8 14.1105 5.88954 14.2 6 14.2H14C14.1105 14.2 14.2 14.1105 14.2 14V6Z"
                fill={color ?? "#B0BECA"}
            />
        </svg>
    );
};
