// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function SankeyTo({ color, className, width = 16, height = 14, ariaHidden }: IIconProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 16 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
        >
            <rect width="2" height="5" fill={color ?? "#B0BECA"} fillOpacity="0.4" />
            <rect y="7" width="2" height="7" fill={color ?? "#B0BECA"} fillOpacity="0.4" />
            <rect x="14" y="4" width="2" height="4" fill={color ?? "#B0BECA"} />
            <rect x="14" y="9" width="2" height="5" fill={color ?? "#B0BECA"} />
            <rect x="14" width="2" height="3" fill={color ?? "#B0BECA"} />
            <path
                d="M2.00008 7.5C5.50008 7.5 9.83341 2.5 14.0001 2.5"
                stroke={color ?? "#B0BECA"}
                strokeOpacity="0.4"
            />
            <path
                d="M2 9.5C6.58333 9.5 9.83333 5.5 14 5.5"
                stroke={color ?? "#B0BECA"}
                strokeOpacity="0.4"
                strokeWidth="3"
            />
            <path
                d="M2 1C5.6 1 10.1 1 14 1"
                stroke={color ?? "#B0BECA"}
                strokeOpacity="0.4"
                strokeWidth="2"
            />
            <path
                d="M2 12.5C5.6 12.5 10.1 12.5 14 12.5"
                stroke={color ?? "#B0BECA"}
                strokeOpacity="0.4"
                strokeWidth="3"
            />
            <path
                d="M1.99992 3.99976C5.99992 3.99976 8.58326 9.99976 13.9999 9.99976"
                stroke={color ?? "#B0BECA"}
                strokeOpacity="0.4"
                strokeWidth="2"
            />
            <path
                d="M1.99992 2.50031C6.99992 2.50031 8.58326 7.50031 13.9999 7.50031"
                stroke={color ?? "#B0BECA"}
                strokeOpacity="0.4"
            />
        </svg>
    );
}
