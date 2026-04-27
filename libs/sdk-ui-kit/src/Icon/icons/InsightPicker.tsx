// (C) 2026 GoodData Corporation

import { type IIconProps } from "../typings.js";
import { combineIconClasses } from "../utils.js";

/**
 * @internal
 */
export function InsightPicker({ color = "#94A1AD", className, width = 24, height = 24 }: IIconProps) {
    return (
        <svg
            className={combineIconClasses(className)}
            width={width}
            height={height}
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Circle — top left */}
            <circle cx="5" cy="4.5" r="3.5" stroke={color} strokeWidth="1.3" />
            {/* Triangle — top right */}
            <path d="M15.5 1L19.5 8.5H11.5L15.5 1Z" stroke={color} strokeWidth="1.3" strokeLinejoin="round" />
            {/* Rounded square — bottom left */}
            <rect x="1" y="11.5" width="8" height="7.5" rx="1.2" stroke={color} strokeWidth="1.3" />
            {/* Pentagon — bottom right */}
            <path
                d="M15.5 11L19.3 13.8L17.8 18.4H13.2L11.7 13.8L15.5 11Z"
                stroke={color}
                strokeWidth="1.3"
                strokeLinejoin="round"
            />
        </svg>
    );
}
