// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function ComboViewLineArea({ color, className, width = 16, height = 16, ariaHidden }: IIconProps) {
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
                    points="16.0830618 14.3502197 16.0830618 10.3395899 13.7505127 13.2039795 7.9914975 4 2.2530709 12.8397217 0.0830618216 10.6373291 0.0830618216 14.3502197"
                />
                <polygon
                    fillOpacity="0.4"
                    fill={color ?? "#B0BECA"}
                    points="13.8819835 11.7066778 16.0830618 9.17510986 16.0830618 7.26220703 14.1538738 9.50518799 7.99857364 0 1.98642865 9.50518799 0.0830618216 7.38393364 0.0830618216 9.32949995 2.22642686 11.7066778 7.9914975 2.63330078"
                />
            </g>
        </svg>
    );
}
