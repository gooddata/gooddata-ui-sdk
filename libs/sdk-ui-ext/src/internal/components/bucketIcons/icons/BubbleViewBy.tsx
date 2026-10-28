// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function BubbleViewBy({ color, className, width = 12, height = 14, ariaHidden }: IIconProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 12 14"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
        >
            <g fill={color ?? "#B0BECA"} fillRule="evenodd">
                <circle cx="3" cy="3.5" r="3" />
                <circle cx="10" cy="8" r="2" />
                <circle fillOpacity=".4" cx="2" cy="12.5" r="1.5" />
            </g>
        </svg>
    );
}
