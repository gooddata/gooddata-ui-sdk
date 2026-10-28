// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function AreaStack({ color, className, width = 16, height = 13, ariaHidden }: IIconProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 16 13"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
        >
            <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g transform="translate(-26.000000, -74.000000)">
                    <g transform="translate(26.000000, 74.000000)">
                        <polygon
                            fill={color ?? "#D7DCE1"}
                            points="0 4.37737006 2.38651747 5.4897874 7.93729872 0 12.6593969 3.15636195 16 0.149702143 16 9 0 9"
                        />
                        <polygon
                            fill={color ?? "#B0BECA"}
                            points="0 8.37737006 2.38651747 7.74779883 7.93729872 4 12.6593969 8.31768767 16 4.14970214 16 13 0 13"
                        />
                    </g>
                </g>
            </g>
        </svg>
    );
}
