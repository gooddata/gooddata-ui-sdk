// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function LineSegment({ color, className, width = 18, height = 14, ariaHidden }: IIconProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 18 14"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
        >
            <g strokeLinecap="round" strokeWidth="2" fill="none" fillRule="evenodd">
                <path
                    d="M1.94117647 11.6665365c2.03900541 1.3100794 3.31053736 1.8564028 5.40877324.7052563C11.3820703 10.15966727 11.1936315 6.32972132 17 5"
                    stroke={color ?? "#B0BECA"}
                />
                <path
                    d="M1.94117647 8.79994457S4.238238 2.55149694 7.03769613 3.02568579c2.79945814.47418885 2.61495293 6.37229659 4.98180757 7.48138572 2.3668546 1.10908909 4.9804963-4e-8 4.9804963-4e-8"
                    strokeOpacity=".6"
                    stroke={color ?? "#B0BECA"}
                />
                <path
                    d="M1 3.87905569C3.21555116 6.77450464 3.86214196 7.00000072 6.56857933 7c2.03532479-5.5e-7 4.49929797-3.05930358 6.78707367-4.82965379C15.6434286.39999599 17 1.16393701 17 1.16393701"
                    stroke={color ?? "#94A1AD"}
                />
            </g>
        </svg>
    );
}
