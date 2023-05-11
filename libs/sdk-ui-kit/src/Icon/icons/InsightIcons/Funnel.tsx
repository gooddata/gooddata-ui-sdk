// (C) 2022 GoodData Corporation
import React from "react";
import { IIconProps } from "../../typings";

/**
 * @internal
 */
export const Funnel: React.FC<IIconProps> = ({ className, width, height, color }) => {
    return (
        <svg
            width={width}
            height={height}
            className={className}
            viewBox="0 0 32 30"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g fill={color ?? "#B0BECA"} fillRule="evenodd">
                <path d="M11.25 20H20.75L22.85 14H9.15002L11.25 20Z" fillOpacity="0.6" />
                <path d="M11.6 21L13 25H19L20.4 21H11.6Z" fillOpacity="0.4" />
                <path d="M8.8 13H23.2L26 5H6L8.8 13Z" />
            </g>
        </svg>
    );
};
