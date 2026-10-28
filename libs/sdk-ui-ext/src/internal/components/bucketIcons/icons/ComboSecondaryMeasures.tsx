// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function ComboSecondaryMeasures({
    color,
    className,
    width = 16,
    height = 16,
    ariaHidden,
}: IIconProps) {
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
                fill={color ?? "#B0BECA"}
                d="M4.13533422 11.34076l-4.1469752-1.91638669.4336761-.90106883 3.44175529 1.57697082 4.1352283-4.88402024 3.55789309 3.17367626 3.9484823-2.07856539L16 7.18048332 11.3226572 9.6738358 8 6.78374494z"
            />
        </svg>
    );
}
