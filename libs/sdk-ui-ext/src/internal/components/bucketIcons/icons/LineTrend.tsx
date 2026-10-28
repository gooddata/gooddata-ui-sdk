// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function LineTrend({ color, className, width = 18, height = 15, ariaHidden }: IIconProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 18 15"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
        >
            <g fill="none" fillRule="evenodd">
                <path fill={color ?? "#94A1AD"} d="M0 13h17v2H0z" />
                <path
                    d="M1 8.00998727s.47424014 4.08540873 2.6883672 2.70527234C5.13755177 9.81193637 4.95142631 1.00000097 7.26399368 1 8.67694187.9999994 9 1.80842011 9.90364303 4.71431676c.90364307 2.90589665 1.89006247 5.12735359 3.89193077 4.76503645C15.797442 9.11703608 17 4.71431676 17 4.71431676"
                    stroke={color ?? "#D9E0E5"}
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </g>
        </svg>
    );
}
