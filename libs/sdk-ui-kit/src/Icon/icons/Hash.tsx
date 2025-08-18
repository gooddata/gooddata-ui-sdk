// (C) 2021-2025 GoodData Corporation

import React from "react";

import { IIconProps } from "../typings.js";
import { combineIconClasses } from "../utils.js";

export interface IHashIconProps extends IIconProps {
    backgroundColor?: string;
}
/**
 * @internal
 */
export const Hash: React.FC<IHashIconProps> = ({
    color,
    backgroundColor,
    className,
    width = 17,
    height = 15,
}) => {
    return (
        <svg
            className={combineIconClasses(className)}
            width={width}
            height={height}
            viewBox="0 0 17 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g id="093758c617f89e91ad13" clipPath="url(#clip0_976_21566)">
                <path
                    id="Intersect"
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M5.22919 13.75L5.61289 10.625H3.04169V9.375H5.76637L6.22681 5.625H3.04169V4.375L6.38029 4.375L6.84073 0.625H8.10012L7.63968 4.375H11.0678L11.5282 0.625H12.7876L12.3272 4.375H14.9167V5.625H12.1737L11.7133 9.375H14.9167V10.625H11.5598L11.1761 13.75H9.91669L10.3004 10.625H6.87228L6.48857 13.75H5.22919ZM10.4539 9.375L10.9143 5.625H7.4862L7.02576 9.375H10.4539Z"
                    fill={color ?? "#14B2E2"}
                />
            </g>
            <defs>
                <clipPath id="clip0_976_21566">
                    <rect
                        width="16.25"
                        height="13.75"
                        fill={backgroundColor ?? "white"}
                        transform="translate(0.541687 0.625)"
                    />
                </clipPath>
            </defs>
        </svg>
    );
};
