// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function ColumnStack({ color, className, width = 16, height = 15, ariaHidden }: IIconProps) {
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
                <path fill={color ?? "#94A1AD"} d="M0 10h4v5H0zm6-1h4v6H6zm6 3h4v3h-4z" />
                <path fill={color ?? "#B0BECA"} d="M0 6h4v3H0zm6-2h4v4H6zm6 2h4v5h-4z" />
                <path fillOpacity=".45" fill={color ?? "#B0BECA"} d="M0 2h4v3H0zm6-1h4v2H6zm6-1h4v5h-4z" />
            </g>
        </svg>
    );
}
