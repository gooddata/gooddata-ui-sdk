// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function BubbleSize({ color, className, width = 16, height = 16, ariaHidden }: IIconProps) {
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
                <circle fillOpacity=".4" cx="9" cy="7" r="5" />
                <path d="M1 0h1v12H1zm2.5 15v-1h12v1z" />
                <path d="M3 0v1H0V0zm0 12v1H0v-1zm12 1h1v3h-1zM3 13h1v3H3z" />
            </g>
        </svg>
    );
}
