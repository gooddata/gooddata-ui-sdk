// (C) 2022-2025 GoodData Corporation
import React from "react";
import { IIconProps } from "../../typings.js";

/**
 * @internal
 */
export const Bar: React.FC<IIconProps> = ({ className, width, height, color, ariaHidden }) => {
    return (
        <svg
            width={width}
            height={height}
            className={className}
            viewBox="0 0 22 21"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
        >
            <g fill={color ?? "#B0BECA"} fillRule="evenodd">
                <path d="M0 0h22v5H0zM0 8h15v5H0zM0 16h7v5H0z" />
            </g>
        </svg>
    );
};
