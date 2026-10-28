// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function BubbleMeasuresY({ color, className, width = 16, height = 16, ariaHidden }: IIconProps) {
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
                <path d="M0 0h1v16H0z" />
                <circle fillOpacity=".4" cx="7" cy="3.5" r="3" />
                <circle fillOpacity=".4" cx="14" cy="8" r="2" />
                <circle fillOpacity=".4" cx="6" cy="12.5" r="1.5" />
            </g>
        </svg>
    );
}
