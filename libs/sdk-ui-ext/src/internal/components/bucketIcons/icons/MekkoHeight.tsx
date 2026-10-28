// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function MekkoHeight({ color, className, width = 20, height = 20, ariaHidden }: IIconProps) {
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
            <path d="M13 5H5V20H13V5Z" fill={color ?? "#B0BECA"} fillOpacity="0.75" />
            <path fillRule="evenodd" clipRule="evenodd" d="M15 0H20V20H15V0Z" fill={color ?? "#B0BECA"} />
            <path d="M3 13H0V20H3V13Z" fill={color ?? "#B0BECA"} fillOpacity="0.6" />
        </svg>
    );
}
