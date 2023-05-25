// (C) 2021-2022 GoodData Corporation

import React from "react";

import { IIconProps } from "../typings.js";

/**
 * @internal
 */
export const Insight: React.FC<IIconProps> = ({ color, className, width = 16, height = 16 }) => {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 24 25"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
        >
            <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g transform="translate(-13.000000, -10.000000)" fill={color ?? "#94A1AD"}>
                    <g transform="translate(13.000000, 10.500000)">
                        <path d="M15,5 L15,24 L9,24 L9,5 L15,5 Z M24,0 L24,24 L18,24 L18,0 L24,0 Z M6,12 L6,24 L0,24 L0,12 L6,12 Z M13.6,6.4 L10.4,6.4 L10.4,22.6 L13.6,22.6 L13.6,6.4 Z M22.6,1.4 L19.4,1.4 L19.4,22.6 L22.6,22.6 L22.6,1.4 Z M4.6,13.4 L1.4,13.4 L1.4,22.6 L4.6,22.6 L4.6,13.4 Z" />
                    </g>
                </g>
            </g>
        </svg>
    );
};
