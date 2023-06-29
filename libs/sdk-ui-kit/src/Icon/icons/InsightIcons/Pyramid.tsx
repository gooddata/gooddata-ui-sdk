// (C) 2022 GoodData Corporation
import React from "react";
import { IIconProps } from "../../typings.js";

/**
 * @internal
 */
export const Pyramid: React.FC<IIconProps> = ({ className, width, height, color }) => {
    return (
        <svg
            width={width}
            height={height}
            className={className}
            viewBox="0 0 22 20"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g fill={color ?? "#B0BECA"} fillRule="evenodd">
                <path d="M8.24995 5L4.94995 11H17.05L13.75 5H8.24995Z" fillOpacity="0.6" />
                <path d="M8.80005 4L11 0L13.2 4H8.80005Z" fillOpacity="0.4" />
                <path d="M17.6 12H4.4L0 20H22L17.6 12Z" />
            </g>
        </svg>
    );
};
