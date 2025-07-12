// (C) 2022-2025 GoodData Corporation

import { IIconProps } from "../../typings.js";

/**
 * @internal
 */
export function TreeMap({ className, width, height, color, ariaHidden }: IIconProps) {
    return (
        <svg
            width={width}
            height={height}
            className={className}
            viewBox="0 0 26 26"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
        >
            <g fill={color ?? "#B0BECA"} fillRule="evenodd">
                <path fillOpacity=".4" d="M0 0h26v10H0z" />
                <path fillOpacity=".6" d="M0 12h15v14H0z" />
                <path d="M17 12h9v14h-9z" />
            </g>
        </svg>
    );
}
