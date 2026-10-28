// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function HeatmapMeasures({ color, className, width = 16, height = 16, ariaHidden }: IIconProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
        >
            <g fill={color ?? "#B0BECA"} fillRule="evenodd">
                <path fillOpacity=".4" d="M12 7h4v1.99439859h-4z" />
                <path d="M6 7h4v1.99439859H6z" />
                <path fillOpacity=".6" d="M0 7h4v1.99439859H0z" />
            </g>
        </svg>
    );
}
