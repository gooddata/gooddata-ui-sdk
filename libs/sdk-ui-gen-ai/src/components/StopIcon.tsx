// (C) 2024-2025 GoodData Corporation

import React from "react";

import { IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function StopIcon({ color = "#6D7680", className, width = 12, height = 12 }: IIconProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect width="12" height="12" rx="1.2" fill={color} />
        </svg>
    );
}
