// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function RadarSegment({ color, className, width = 18, height = 18, ariaHidden }: IIconProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
        >
            <path
                d="M17 7L14 16H4L1 7L9 1L17 7ZM3.35254 7.73438L5.44141 14H12.5586L14.6465 7.73438L9 3.49902L3.35254 7.73438Z"
                fill={color ?? "#DDE4EB"}
            />
            <path
                d="M12.5518 8.38867L11.2754 12.2197H6.72461L5.44727 8.38867L9 5.72461L12.5518 8.38867Z"
                fill={color ?? "#B0BECA"}
            />
        </svg>
    );
}
