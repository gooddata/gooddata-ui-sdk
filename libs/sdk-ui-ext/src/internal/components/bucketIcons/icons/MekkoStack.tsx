// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function MekkoStack({ color, className, width = 20, height = 20, ariaHidden }: IIconProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15 0H20V5H15V0Z"
                fill={color ?? "#B0BECA"}
                fillOpacity="0.45"
            />
            <path d="M13 4H5V8H13V4Z" fill={color ?? "#B0BECA"} fillOpacity="0.45" />
            <path d="M3 9H0V13H3V9Z" fill={color ?? "#B0BECA"} fillOpacity="0.45" />
            <path fillRule="evenodd" clipRule="evenodd" d="M15 6H20V12H15V6Z" fill={color ?? "#B0BECA"} />
            <path d="M13 15H5V9H13V15Z" fill={color ?? "#B0BECA"} />
            <path d="M3 14H0V18H3V14Z" fill={color ?? "#B0BECA"} />
            <path fillRule="evenodd" clipRule="evenodd" d="M15 13H20V20H15V13Z" fill={color ?? "#94A1AD"} />
            <path d="M13 16H5V20H13V16Z" fill={color ?? "#94A1AD"} />
            <path d="M3 19H0V20H3V19Z" fill={color ?? "#94A1AD"} />
        </svg>
    );
}
