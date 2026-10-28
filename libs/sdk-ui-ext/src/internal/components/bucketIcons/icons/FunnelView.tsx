// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function FunnelView({ color, className, width = 18, height = 17, ariaHidden }: IIconProps) {
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
            <path
                d="M5.66683 12H12.3335L13.6668 8H4.3335L5.66683 12Z"
                fill={color ?? "#B0BECA"}
                fillOpacity="0.6"
            />
            <path d="M6 13L7 16H11L12 13H6Z" fill={color ?? "#B0BECA"} fillOpacity="0.4" />
            <path d="M4 7H14L16 1H2L4 7Z" fill={color ?? "#B0BECA"} />
        </svg>
    );
}
