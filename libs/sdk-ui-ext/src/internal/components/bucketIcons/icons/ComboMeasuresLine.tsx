// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function ComboMeasuresLine({ color, className, width = 16, height = 16, ariaHidden }: IIconProps) {
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
                <polygon
                    fill={color ?? "#B0BECA"}
                    fillRule="nonzero"
                    points="13.3435059 13.7066778 16 9.69873047 15.3401959 8.46099849 13.3435059 11.3295 8.00641907 2 2.45704463 11.3295 0.825927734 9.38393364 0 10.6126506 2.77026367 13.7066778 8 4.63330078"
                />
            </g>
        </svg>
    );
}
