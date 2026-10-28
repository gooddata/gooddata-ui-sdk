// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function HeadlineMeasures({ color, className, width = 16, height = 16, ariaHidden }: IIconProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
        >
            <g fill="none" fillRule="evenodd">
                <path
                    fill={color ?? "#B0BECA"}
                    d="M6.50282486 5.7740113L3.19774011 1h2.76836158l2.13276837 3.50282486L10.14689266 1h2.66949154L9.5819209 5.73163842 13.1977401 11h-2.76836157L7.98587571 6.97457627 5.61299435 11H3z"
                />
                <path fill={color ?? "#D7DCE1"} d="M1 13h6v3H1zm8 0h6v3H9z" />
            </g>
        </svg>
    );
}
