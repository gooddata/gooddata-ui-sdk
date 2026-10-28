// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function HeatmapView({ color, className, width = 16, height = 16, ariaHidden }: IIconProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
        >
            <path
                d="M5 13h6v2H5zm0-3h6v2H5zm0-3h6v2H5zm0-3h6v2H5zm0-3h6v2H5z"
                fill={color ?? "#B0BECA"}
                fillRule="evenodd"
            />
        </svg>
    );
}
