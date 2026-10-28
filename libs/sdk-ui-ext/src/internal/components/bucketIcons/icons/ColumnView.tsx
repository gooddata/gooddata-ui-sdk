// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function ColumnView({ color, className, width = 16, height = 15, ariaHidden }: IIconProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 16 15"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
        >
            <g fill="none" fillRule="evenodd">
                <path fill={color ?? "#94A1AD"} d="M0 13h16v2H0z" />
                <path fillOpacity=".45" fill={color ?? "#B0BECA"} d="M0 8h4v5H0zm6-8h4v13H6zm6 4h4v9h-4z" />
            </g>
        </svg>
    );
}
