// (C) 2022 GoodData Corporation
import React from "react";
import { IIconProps } from "../../typings.js";

/**
 * @internal
 */
export const HeatMap: React.FC<IIconProps> = ({ className, width, height, color }) => {
    return (
        <svg
            width={width}
            height={height}
            className={className}
            viewBox="11 11 26 26"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g fill={color ?? "#B0BECA"} fillRule="evenodd">
                <path fillOpacity=".6" d="M29 11h8v3h-8z" />
                <path d="M20 11h8v3h-8z" />
                <path fillOpacity=".6" d="M11 11h8v3h-8z" />
                <path fillOpacity=".4" d="M20 15h8v3h-8z" />
                <path d="M29 15h8v3h-8z" />
                <path fillOpacity=".6" d="M11 15h8v3h-8z" />
                <path d="M20 19h8v3h-8zm9 0h8v3h-8z" />
                <path fillOpacity=".4" d="M11 19h8v3h-8z" />
                <path d="M20 23h8v3h-8z" />
                <path fillOpacity=".4" d="M29 23h8v3h-8zm-18 0h8v3h-8z" />
                <path d="M20 27h8v3h-8zm9 0h8v3h-8z" />
                <path fillOpacity=".4" d="M11 27h8v3h-8zm9 4h8v3h-8z" />
                <path d="M20 35h8v2h-8z" />
                <path fillOpacity=".4" d="M29 31h8v3h-8zm0 4h8v2h-8z" />
                <path fillOpacity=".6" d="M11 31h8v3h-8zm0 4h8v2h-8z" />
            </g>
        </svg>
    );
};
