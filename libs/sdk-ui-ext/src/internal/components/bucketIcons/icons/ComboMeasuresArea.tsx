// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function ComboMeasuresArea({ color, className, width = 16, height = 16, ariaHidden }: IIconProps) {
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
                    points="15.3401959 15.0562744 15.3401959 10.1227095 13.3435059 12.9912109 8.00641907 3.66171098 2.45704463 12.9912109 0.825927734 11.0456446 0.825927734 15.0562744"
                />
            </g>
        </svg>
    );
}
