// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function ComboMeasuresColumn({ color, className, width = 16, height = 16, ariaHidden }: IIconProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
        >
            <path d="M0 12h4v4H0zM6 0h4v16H6zm6 6h4v10h-4z" fill={color ?? "#B0BECA"} fillRule="evenodd" />
        </svg>
    );
}
