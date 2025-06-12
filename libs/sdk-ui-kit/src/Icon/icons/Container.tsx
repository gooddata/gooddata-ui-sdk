// (C) 2024 GoodData Corporation
import React from "react";

import { IIconProps } from "../typings.js";

/**
 * @internal
 */
export const Container: React.FC<IIconProps> = ({ color = "#94A1AD", className, width, height }) => {
    return (
        <svg
            className={className}
            width={width ?? 24}
            height={height ?? 24}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g clipPath="url(#clip0_1731_6947)">
                <mask id="path-1-inside-1_1731_6947" fill="white">
                    <rect x="4" y="4" width="7" height="7" rx="1" />
                </mask>
                <rect
                    x="4"
                    y="4"
                    width="7"
                    height="7"
                    rx="1"
                    stroke={color}
                    strokeWidth="2.8"
                    mask="url(#path-1-inside-1_1731_6947)"
                />
                <rect x="13.5" y="22.6016" width="3.5" height="1.4" fill={color} />
                <rect x="7" y="22.6016" width="3.5" height="1.4" fill={color} />
                <mask id="path-4-inside-2_1731_6947" fill="white">
                    <rect x="13" y="4" width="7" height="7" rx="1" />
                </mask>
                <rect
                    x="13"
                    y="4"
                    width="7"
                    height="7"
                    rx="1"
                    stroke={color}
                    strokeWidth="2.8"
                    mask="url(#path-4-inside-2_1731_6947)"
                />
                <mask id="path-5-inside-3_1731_6947" fill="white">
                    <rect x="4" y="13" width="7" height="7" rx="1" />
                </mask>
                <rect
                    x="4"
                    y="13"
                    width="7"
                    height="7"
                    rx="1"
                    stroke={color}
                    strokeWidth="2.8"
                    mask="url(#path-5-inside-3_1731_6947)"
                />
                <mask id="path-6-inside-4_1731_6947" fill="white">
                    <rect x="13" y="13" width="7" height="7" rx="1" />
                </mask>
                <rect
                    x="13"
                    y="13"
                    width="7"
                    height="7"
                    rx="1"
                    stroke={color}
                    strokeWidth="2.8"
                    mask="url(#path-6-inside-4_1731_6947)"
                />
                <rect x="13.5" width="3.5" height="1.4" fill={color} />
                <rect
                    x="1.40039"
                    y="13.5"
                    width="3.5"
                    height="1.4"
                    transform="rotate(90 1.40039 13.5)"
                    fill={color}
                />
                <rect x="24" y="13.5" width="3.5" height="1.4" transform="rotate(90 24 13.5)" fill={color} />
                <rect x="7" width="3.5" height="1.4" fill={color} />
                <rect
                    x="1.40039"
                    y="7"
                    width="3.5"
                    height="1.4"
                    transform="rotate(90 1.40039 7)"
                    fill={color}
                />
                <rect x="24" y="7" width="3.5" height="1.4" transform="rotate(90 24 7)" fill={color} />
                <path
                    d="M4 0H2C0.895431 0 0 0.89543 0 2V4H1.4V2C1.4 1.66863 1.66863 1.4 2 1.4H4V0Z"
                    fill={color}
                />
                <path
                    d="M22.6 4V2C22.6 1.66863 22.3314 1.4 22 1.4H20V0H22C23.1046 0 24 0.895431 24 2V4H22.6Z"
                    fill={color}
                />
                <path
                    d="M20 22.6H22C22.3314 22.6 22.6 22.3314 22.6 22V20H24V22C24 23.1046 23.1046 24 22 24H20V22.6Z"
                    fill={color}
                />
                <path
                    d="M1.4 20V22C1.4 22.3314 1.66863 22.6 2 22.6H4V24H2C0.89543 24 0 23.1046 0 22V20H1.4Z"
                    fill={color}
                />
            </g>
            <defs>
                <clipPath id="clip0_1731_6947">
                    <rect width="24" height="24" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );
};
