// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function ScatterAttribute({ color, className, width = 16, height = 16, ariaHidden }: IIconProps) {
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
                <path d="M2 6h4v4H2zm7-5h4v4H9z" />
                <path fillOpacity=".4" d="M12 12h4v4h-4z" />
            </g>
        </svg>
    );
}
