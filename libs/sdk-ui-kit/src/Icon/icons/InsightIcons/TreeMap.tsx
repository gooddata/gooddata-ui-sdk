// (C) 2022 GoodData Corporation
import React from "react";
import { IIconProps } from "../../typings.js";

/**
 * @internal
 */
export const TreeMap: React.FC<IIconProps> = ({ className, width, height, color }) => {
    return (
        <svg
            width={width}
            height={height}
            className={className}
            viewBox="0 0 26 26"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g fill={color ?? "#B0BECA"} fillRule="evenodd">
                <path fillOpacity=".4" d="M0 0h26v10H0z" />
                <path fillOpacity=".6" d="M0 12h15v14H0z" />
                <path d="M17 12h9v14h-9z" />
            </g>
        </svg>
    );
};
