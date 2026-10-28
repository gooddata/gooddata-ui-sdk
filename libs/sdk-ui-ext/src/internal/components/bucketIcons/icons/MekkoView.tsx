// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function MekkoView({ color, className, width = 20, height = 20, ariaHidden }: IIconProps) {
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
                d="M15 0H20V18H15V0Z"
                fill={color ?? "#B0BECA"}
                fillOpacity="0.45"
            />
            <path d="M13 5H5V18H13V5Z" fill={color ?? "#B0BECA"} fillOpacity="0.45" />
            <path d="M3 10H0V18H3V10Z" fill={color ?? "#B0BECA"} fillOpacity="0.45" />
            <path d="M20 18H0V20H20V18Z" fill={color ?? "#94A1AD"} />
        </svg>
    );
}
