// (C) 2024-2025 GoodData Corporation

import React from "react";

import { IIconProps } from "../typings.js";
import { combineIconClasses } from "../utils.js";

/**
 * @internal
 */
export const SimplifiedDashboard: React.FC<IIconProps> = ({ color, className, width = 16, height = 17 }) => {
    return (
        <svg
            width={width}
            height={height}
            className={combineIconClasses(className)}
            viewBox="0 0 16 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke={color ?? "#94A1AD"}
        >
            <rect
                x="0.442491"
                y="2.72276"
                width="15.1111"
                height="11.5556"
                rx="0.444444"
                strokeWidth="0.888889"
            />
            <rect
                x="11.1105"
                y="8.90929"
                width="2.66667"
                height="2.66667"
                rx="0.444444"
                strokeWidth="0.888889"
            />
            <rect
                x="6.66515"
                y="8.90929"
                width="2.66667"
                height="2.66667"
                rx="0.444444"
                strokeWidth="0.888889"
            />
            <rect
                x="2.22179"
                y="8.90929"
                width="2.66667"
                height="2.66667"
                rx="0.444444"
                strokeWidth="0.888889"
            />
            <path d="M15.5555 4.5006H0.444405" strokeWidth="0.888889" strokeLinecap="square" />
            <path d="M7.11081 7.16699H1.77734" strokeWidth="0.888889" />
        </svg>
    );
};
