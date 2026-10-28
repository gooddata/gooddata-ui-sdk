// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function ComboViewColumnLine({ color, className, width = 16, height = 16, ariaHidden }: IIconProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
        >
            <g fill={color ?? "#B0BECA"} fillRule="evenodd">
                <path
                    fillOpacity=".4"
                    d="M0 7.58954157V15h4v-4.0154693zm16 .04062464V15h-4v-3.9330277zM6 12.8867139V15h4v-2.1132861l-2 1.690884zM6 5v4.50671359L8 11.317278l2-1.81056441V5z"
                />
                <path
                    fillOpacity=".4"
                    fillRule="nonzero"
                    d="M0 5.0000005v2l8 6.8537635 8-6.8537635v-2l-8 7.07253156z"
                />
                <path d="M0 15h16v1H0z" />
                <path fillOpacity=".4" d="M4 0v8L0 4.41234175V0zm8 0v7.87534045l4-3.58765825V0z" />
            </g>
        </svg>
    );
}
