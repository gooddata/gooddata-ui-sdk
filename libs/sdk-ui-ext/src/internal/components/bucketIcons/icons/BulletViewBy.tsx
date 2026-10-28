// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function BulletViewBy({ color, className, width = 16, height = 16, ariaHidden }: IIconProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
        >
            <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g transform="translate(-0.500000, -0.500000)" />
                <g />
                <path
                    d="M13,1.01063601 L13,0.0106360099 L14,0.0106360099 L14,1.01063601 L16,1.01063601 L16,3.01063601 L14,3.01063601 L14,4.01063601 L13,4.01063601 L13,3.01063601 L8.17124146e-13,3.01063601 L8.17124146e-13,1.01063601 L13,1.01063601 Z M8.0380147e-13,7.2063946 L8,7.2063946 L8,9.2063946 L8.0380147e-13,9.2063946 L8.0380147e-13,7.2063946 Z M11,6.2063946 L12,6.2063946 L12,10.2063946 L11,10.2063946 L11,6.2063946 Z M6.2558847e-12,13.0259896 L4,13.0259896 L4,15.0259896 L6.2558847e-12,15.0259896 L6.2558847e-12,13.0259896 Z M6,12.0259896 L7,12.0259896 L7,16.0259896 L6,16.0259896 L6,12.0259896 Z"
                    fillOpacity="0.45"
                    fill={color ?? "#B0BECA"}
                />
                <path
                    d="M0.734773169,0.62683604 L0.734773169,15.2229485"
                    stroke={color ?? "#94A1AD"}
                    strokeWidth="1.5"
                    strokeLinecap="square"
                />
            </g>
        </svg>
    );
}
