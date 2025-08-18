// (C) 2022-2025 GoodData Corporation
import React from "react";
import { IIconProps } from "../../typings.js";
import { combineIconClasses } from "../../utils.js";

/**
 * @internal
 */
export const Column: React.FC<IIconProps> = ({ className, width, height, color, ariaHidden }) => {
    return (
        <svg
            width={width}
            height={height}
            className={combineIconClasses(className)}
            viewBox="0 0 24 19"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
        >
            <g fill={color ?? "#B0BECA"} fillRule="evenodd">
                <path d="M0 13h6v6H0zM9 0h6v19H9zM18 15h6v4h-6z" />
            </g>
        </svg>
    );
};
