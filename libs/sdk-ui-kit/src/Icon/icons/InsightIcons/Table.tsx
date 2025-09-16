// (C) 2022-2025 GoodData Corporation

import { IIconProps } from "../../typings.js";
import { combineIconClasses } from "../../utils.js";

/**
 * @internal
 */
export function Table({ color, className, width, height, ariaHidden }: IIconProps) {
    return (
        <svg
            width={width}
            height={height}
            className={combineIconClasses(className)}
            viewBox="0 0 25 19"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
        >
            <g fill={color ?? "#B0BECA"} fillRule="evenodd">
                <path d="M6 0h9v4H6zM16 0h9v4h-9z" />
                <path
                    fillOpacity=".45"
                    d="M6 5h9v4H6zM16 5h9v4h-9zM6 10h9v4H6zM16 10h9v4h-9zM6 15h9v4H6zM16 15h9v4h-9z"
                />
                <path d="M0 0h5v4H0zM0 5h5v4H0zM0 10h5v4H0zM0 15h5v4H0z" />
            </g>
        </svg>
    );
}
