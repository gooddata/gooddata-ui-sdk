// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function ComboViewColumnArea({ color, className, width = 16, height = 16, ariaHidden }: IIconProps) {
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
                    points="16 14.3502197 16 10.4609985 13.7989217 13.3295 7.91551182 4 1.79808379 13.3295 0 11.3839336 0 14.3502197"
                />
                <polygon
                    fillOpacity="0.4"
                    fill={color ?? "#B0BECA"}
                    points="5.91693818 5.97473145 7.91693818 2.66171098 9.91693818 5.97473145 9.91693818 2.77836293e-15 5.91693818 3.55271368e-15"
                />
                <polygon
                    fillOpacity="0.4"
                    fill={color ?? "#B0BECA"}
                    points="12 6 12 8.99560547 13.9169382 11.9912109 16 9.12270948 16 6"
                />
                <polygon
                    fillOpacity="0.4"
                    fill={color ?? "#B0BECA"}
                    points="1.83472382 11.9912109 2.55414521 11.0043945 0.752509467 11.0043945"
                />
            </g>
        </svg>
    );
}
