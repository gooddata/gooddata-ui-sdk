// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function ScatterView({ color, className, width = 17, height = 17, ariaHidden }: IIconProps) {
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
            <g clipPath="url(#bucket-icon-scatter-view-clip-1)">
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M2.43958 6.60303H6.43958V10.603H2.43958V6.60303ZM9.43958 1.60303H13.4396V5.60303H9.43958V1.60303Z"
                    fill={color ?? "#B0BECA"}
                />
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12.4396 12.603H16.4396V16.603H12.4396V12.603Z"
                    fill={color ?? "#B0BECA"}
                />
            </g>
            <defs>
                <clipPath id="bucket-icon-scatter-view-clip-1">
                    <rect width="16" height="16" fill="white" transform="translate(0.439575 0.603027)" />
                </clipPath>
            </defs>
        </svg>
    );
}
