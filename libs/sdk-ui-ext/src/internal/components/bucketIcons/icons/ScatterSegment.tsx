// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function ScatterSegment({ color, className, width = 17, height = 17, ariaHidden }: IIconProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 17 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
        >
            <g clipPath="url(#bucket-icon-scatter-segment-clip-1)">
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.43958 1.48975H13.4396V5.48975H9.43958V1.48975Z"
                    fill={color ?? "#B0BECA"}
                />
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12.4396 12.4897H16.4396V16.4897H12.4396V12.4897Z"
                    fill={color ?? "#B0BECA"}
                    fillOpacity="0.4"
                />
                <path
                    d="M6.43958 6.48975H2.43958V10.4897H6.43958V6.48975Z"
                    fill={color ?? "#B0BECA"}
                    fillOpacity="0.4"
                />
            </g>
            <defs>
                <clipPath id="bucket-icon-scatter-segment-clip-1">
                    <rect width="16" height="16" fill="white" transform="translate(0.439575 0.489746)" />
                </clipPath>
            </defs>
        </svg>
    );
}
