// (C) 2021-2022 GoodData Corporation

import React from "react";

import { IIconProps } from "../typings.js";

/**
 * @internal
 */
export const Minimize: React.FC<IIconProps> = ({ color, className, width = 18, height = 18 }) => {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M15.6259 13.6016H2.36691C2.26619 13.6016 2.17986 13.5625 2.10791 13.4844C2.03597 13.4062 2 13.3125 2 13.2031C2 13.0885 2.03597 12.9922 2.10791 12.9141C2.17986 12.8359 2.26619 12.7969 2.36691 12.7969H15.6259C15.7314 12.7969 15.8201 12.8359 15.8921 12.9141C15.964 12.9922 16 13.0885 16 13.2031C16 13.3125 15.964 13.4062 15.8921 13.4844C15.8201 13.5625 15.7314 13.6016 15.6259 13.6016Z"
                fill={color ?? "#6D7680"}
            />
        </svg>
    );
};
