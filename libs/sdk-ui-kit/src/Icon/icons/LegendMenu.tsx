// (C) 2021-2025 GoodData Corporation

import { IIconProps } from "../typings.js";
import { combineIconClasses } from "../utils.js";

/**
 * @internal
 */
export function LegendMenu({ color, className, width, height }: IIconProps) {
    return (
        <svg
            className={combineIconClasses(className)}
            width={width ?? 9}
            height={height ?? 10}
            viewBox="0 0 11 10"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g
                    className="LegendMenuContent"
                    transform="translate(-5.500000, -6.000000)"
                    fill={color ?? "#6D7680"}
                >
                    <path d="M7.5,14 L7.5,16 L5.5,16 L5.5,14 L7.5,14 Z M16.5,14 L16.5,16 L9.5,16 L9.5,14 L16.5,14 Z M7.5,10 L7.5,12 L5.5,12 L5.5,10 L7.5,10 Z M16.5,10 L16.5,12 L9.5,12 L9.5,10 L16.5,10 Z M7.5,6 L7.5,8 L5.5,8 L5.5,6 L7.5,6 Z M16.5,6 L16.5,8 L9.5,8 L9.5,6 L16.5,6 Z"></path>
                </g>
            </g>
        </svg>
    );
}
