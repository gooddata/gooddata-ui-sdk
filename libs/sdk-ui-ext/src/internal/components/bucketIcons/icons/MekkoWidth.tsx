// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function MekkoWidth({ color, className, width = 20, height = 20, ariaHidden }: IIconProps) {
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
            <path d="M20 0H12V20H20V0Z" fill={color ?? "#B0BECA"} />
            <path d="M3 0H0V20H3V0Z" fill={color ?? "#B0BECA"} fillOpacity="0.6" />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5 0H10V20H5V0Z"
                fill={color ?? "#B0BECA"}
                fillOpacity="0.75"
            />
        </svg>
    );
}
