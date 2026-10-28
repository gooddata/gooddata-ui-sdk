// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function GeoPushpinColorIcon({ color, className, width = 16, height = 16, ariaHidden }: IIconProps) {
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
                <path
                    d="M7.334 6C8.806 6 10 7.12 10 8.5S8.806 11 7.334 11A2.79 2.79 0 016 10.665c.798-.433 1.334-1.24 1.334-2.165s-.536-1.732-1.332-2.165C6.392 6.122 6.848 6 7.334 6z"
                    fillOpacity=".6"
                />
                <path
                    d="M11.334 6C12.806 6 14 7.12 14 8.5S12.806 11 11.334 11A2.79 2.79 0 0110 10.665c.798-.433 1.334-1.24 1.334-2.165s-.536-1.732-1.332-2.165c.39-.213.846-.335 1.332-.335z"
                    fillOpacity=".4"
                />
                <circle cx="3.5" cy="8.5" r="2.5" />
            </g>
        </svg>
    );
}
