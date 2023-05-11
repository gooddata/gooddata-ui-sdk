// (C) 2022 GoodData Corporation
import React from "react";
import { IIconProps } from "../../typings";

/**
 * @internal
 */
export const Pyramid: React.FC<IIconProps> = ({ className, width, height, color }) => {
    return (
        <svg
            width={width}
            height={height}
            className={className}
            viewBox="0 0 32 30"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g fill={color ?? "#B0BECA"} fillRule="evenodd">
                <path d="M13.25 10L9.95001 16H22.05L18.75 10H13.25Z" fillOpacity="0.6" />
                <path d="M13.8 9L16 5L18.2 9H13.8Z" fillOpacity="0.4" />
                <path d="M22.6 17H9.4L5 25H27L22.6 17Z" />
            </g>
        </svg>
    );
};
