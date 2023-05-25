// (C) 2021 GoodData Corporation
import React from "react";

import { IIconProps } from "../typings.js";

/**
 * @internal
 */
export const Explore: React.FC<IIconProps> = ({ color, className, width, height }) => {
    return (
        <svg
            className={className}
            width={width ?? 16}
            height={height ?? 16}
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g stroke={color ?? "#B1BECA"} fill="none" fillRule="evenodd">
                <path strokeWidth="2" strokeLinecap="square" d="M10.5 10V6.667M4.5 10V7.75M7.5 10V3.7" />
                <circle cx="7.5" cy="7.5" r="7" />
                <path strokeLinecap="round" d="M15.5 15.5l-3-3" />
            </g>
        </svg>
    );
};
