// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function ComboViewLineLine({ color, className, width = 16, height = 16, ariaHidden }: IIconProps) {
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
                <rect fill={color ?? "#B0BECA"} x="0" y="15" width="16" height="1" />
                <polygon
                    fillOpacity="0.4"
                    fill={color ?? "#B0BECA"}
                    points="13.3435059 13.7066778 15.7113647 9.9732666 15.7113647 7.85333888 13.3435059 11.3295 8.00641907 2 2.48626709 11.5430908 0.303710937 8.98773193 0.303710937 10.8045044 2.77026367 13.7066778 8 4.63330078"
                />
            </g>
        </svg>
    );
}
