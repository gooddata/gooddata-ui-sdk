// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function TableColumns({ color, className, width = 16, height = 10, ariaHidden }: IIconProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 16 10"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
        >
            <g fillRule="nonzero" fill="none">
                <g fill={color ?? "#B0BECA"} fillOpacity=".45">
                    <path d="M7 8h9v2H7zM7 4h9v2H7zM0 8h5v2H0zM0 4h5v2H0z" />
                </g>
                <g fill={color ?? "#94A1AD"}>
                    <path d="M7 0h9v2H7zM0 0h5v2H0z" />
                </g>
            </g>
        </svg>
    );
}
