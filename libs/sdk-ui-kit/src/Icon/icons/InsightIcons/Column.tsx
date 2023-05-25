// (C) 2022 GoodData Corporation
import React from "react";
import { IIconProps } from "../../typings.js";

/**
 * @internal
 */
export const Column: React.FC<IIconProps> = ({ className, width, height, color }) => {
    return (
        <svg
            width={width}
            height={height}
            className={className}
            viewBox="0 0 24 19"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g fill={color ?? "#B0BECA"} fillRule="evenodd">
                <path d="M0 13h6v6H0zM9 0h6v19H9zM18 15h6v4h-6z" />
            </g>
        </svg>
    );
};
