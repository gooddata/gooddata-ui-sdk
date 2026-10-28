// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function HeatmapStack({ color, className, width = 16, height = 16, ariaHidden }: IIconProps) {
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
                d="M12 7h4v1.99439859h-4zM6 7h4v1.99439859H6zM0 7h4v1.99439859H0z"
                fill={color ?? "#B0BECA"}
                fillRule="evenodd"
            />
        </svg>
    );
}
