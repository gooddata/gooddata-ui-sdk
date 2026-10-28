// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function AreaMeasures({ color, className, width = 16, height = 12, ariaHidden }: IIconProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 16 12"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
        >
            <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g transform="translate(-26.000000, -26.000000)" fill={color ?? "#B0BECA"}>
                    <g transform="translate(26.000000, 26.000000)">
                        <polygon points="0 5.39404239 2.38651747 4.72782945 7.93729872 0.761904762 12.6593969 5.33088642 16 0.920319728 16 11.2857143 0 11.2857143" />
                    </g>
                </g>
            </g>
        </svg>
    );
}
