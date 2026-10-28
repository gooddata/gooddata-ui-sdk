// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function ColumnMeasures({ color, className, width = 16, height = 15, ariaHidden }: IIconProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 16 15"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
        >
            <path d="M0 8h4v7H0zm6-8h4v15H6zm6 4h4v11h-4z" fill={color ?? "#B0BECA"} fillRule="evenodd" />
        </svg>
    );
}
