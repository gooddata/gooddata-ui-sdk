// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function BarView({ color, className, width = 17, height = 16, ariaHidden }: IIconProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 17 16"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
        >
            <g fill="none" fillRule="evenodd">
                <path fillOpacity=".45" fill={color ?? "#B0BECA"} d="M2 12h6v4H2zm0-6h10v4H2zm0-6h15v4H2z" />
                <path fill={color ?? "#94A1AD"} d="M0 0h2v16H0z" />
            </g>
        </svg>
    );
}
