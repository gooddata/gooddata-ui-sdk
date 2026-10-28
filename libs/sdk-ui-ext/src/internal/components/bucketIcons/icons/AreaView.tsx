// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function AreaView({ color, className, width = 16, height = 13, ariaHidden }: IIconProps) {
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
                <g transform="translate(-26.000000, -49.000000)">
                    <g transform="translate(26.000000, 49.000000)">
                        <rect fill={color ?? "#94A1AD"} x="0" y="11" width="16" height="2" />
                        <polygon
                            fill={color ?? "#D7DCE1"}
                            points="0 4.63213763 2.38651747 3.96592469 7.93729872 0 12.6593969 4.56898166 16 0.158414966 16 10.5238095 0 10.5238095"
                        />
                    </g>
                </g>
            </g>
        </svg>
    );
}
