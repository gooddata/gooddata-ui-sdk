// (C) 2021 GoodData Corporation
import React from "react";

import { IIconProps } from "../typings";

/**
 * @internal
 */
export const Explore: React.FC<IIconProps> = ({ color }) => {
    return (
        <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
            <g stroke={color || "#B1BECA"} fill="none" fillRule="evenodd">
                <path strokeWidth="2" strokeLinecap="square" d="M10.5 10V6.667M4.5 10V7.75M7.5 10V3.7" />
                <circle cx="7.5" cy="7.5" r="7" />
                <path strokeLinecap="round" d="M15.5 15.5l-3-3" />
            </g>
        </svg>
    );
};
