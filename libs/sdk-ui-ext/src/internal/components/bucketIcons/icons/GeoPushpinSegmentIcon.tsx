// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function GeoPushpinSegmentIcon({ color, className, width = 16, height = 16, ariaHidden }: IIconProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
        >
            <g fill={color ?? "#B0BECA"} fillRule="evenodd">
                <circle fillOpacity=".5" cx="4.5" cy="4.5" r="3.5" />
                <circle cx="11.5" cy="11.5" r="3.5" />
            </g>
        </svg>
    );
}
