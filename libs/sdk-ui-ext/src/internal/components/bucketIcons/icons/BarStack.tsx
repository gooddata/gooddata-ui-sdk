// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function BarStack({ color, className, width = 16, height = 16, ariaHidden }: IIconProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
        >
            <g fill="none" fillRule="evenodd">
                <path fill={color ?? "#94A1AD"} d="M5 0v4H0V0zm1 6v4H0V6zm-3 6v4H0v-4z" />
                <path fill={color ?? "#B0BECA"} d="M9 0v4H6V0zm2 6v4H7V6zm-2 6v4H4v-4z" />
                <path
                    fillOpacity=".45"
                    fill={color ?? "#B0BECA"}
                    d="M14 0v4h-4V0zm1 6v4h-3V6zm1 6v4h-6v-4z"
                />
            </g>
        </svg>
    );
}
