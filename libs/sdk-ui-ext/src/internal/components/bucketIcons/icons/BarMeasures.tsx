// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function BarMeasures({ color, className, width = 17, height = 16, ariaHidden }: IIconProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 17 16"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
        >
            <path d="M0 12h7v4H0zm0-6h12v4H0zm0-6h17v4H0z" fill={color ?? "#B0BECA"} fillRule="evenodd" />
        </svg>
    );
}
