// (C) 2022 GoodData Corporation
import React from "react";
import { IIconProps } from "../../typings.js";

/**
 * @internal
 */
export const Bubble: React.FC<IIconProps> = ({ className, width, height, color }) => {
    return (
        <svg
            width={width}
            height={height}
            className={className}
            viewBox="11 11 26 26"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g fill={color ?? "#B0BECA"} fillRule="evenodd">
                <path d="M11 11h2v26h-2zm2 24h24v2H13z" fillOpacity=".45" />
                <circle cx="23" cy="16.5" r="4.5" />
                <circle cx="34" cy="24" r="3" />
                <circle cx="19" cy="30" r="2" />
            </g>
        </svg>
    );
};
