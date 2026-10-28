// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function PyramidMeasures({ color, className, width = 18, height = 17, ariaHidden }: IIconProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 18 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
        >
            <path d="M13.2 10H4.8L2 16H16L13.2 10Z" fill={color ?? "#B0BECA"} />
            <path d="M7.13333 5L5.26666 9H12.7333L10.8667 5H7.13333Z" fill={color ?? "#B0BECA"} />
            <path d="M7.59998 4L8.99998 1L10.4 4H7.59998Z" fill={color ?? "#B0BECA"} />
        </svg>
    );
}
