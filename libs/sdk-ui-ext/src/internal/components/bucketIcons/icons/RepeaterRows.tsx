// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function RepeaterRows({ color, className, width = 16, height = 10, ariaHidden }: IIconProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 16 10"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
        >
            <g fill="none" fillRule="evenodd">
                <path fillOpacity=".45" fill={color ?? "#B0BECA"} d="M7 8h9v2H7zm0-4h9v2H7zm0-4h9v2H7z" />
                <path fill={color ?? "#94A1AD"} d="M0 8h5v2H0zm0-4h5v2H0zm0-4h5v2H0z" />
            </g>
        </svg>
    );
}
