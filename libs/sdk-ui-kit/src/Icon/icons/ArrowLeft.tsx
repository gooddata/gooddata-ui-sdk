// (C) 2021-2025 GoodData Corporation

import React from "react";

import { IIconProps } from "../typings.js";
import { combineIconClasses } from "../utils.js";

/**
 * @internal
 */
export function ArrowLeft({ color = "#6D7680", className, width = 11, height = 19, ariaHidden }: IIconProps) {
    return (
        <svg
            className={combineIconClasses(className)}
            width={width}
            height={height}
            viewBox="0 0 11 19"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
        >
            <path
                d="M10.0039 18.9961C9.9388 18.9961 9.8737 18.9831 9.80859 18.957C9.75 18.9375 9.69466 18.9017 9.64258 18.8496L0.648438 9.85547C0.550781 9.75781 0.501953 9.64062 0.501953 9.50391C0.501953 9.36068 0.550781 9.24023 0.648438 9.14258L9.64258 0.148438C9.74023 0.0507812 9.85742 0.00195312 9.99414 0.00195312C10.1374 0.00195312 10.2578 0.0507812 10.3555 0.148438C10.4531 0.246094 10.502 0.363281 10.502 0.5C10.502 0.636719 10.4531 0.753906 10.3555 0.851562L1.70312 9.50391L10.3555 18.1465C10.4531 18.2441 10.502 18.3613 10.502 18.498C10.502 18.6348 10.4531 18.752 10.3555 18.8496C10.3034 18.9017 10.2448 18.9375 10.1797 18.957C10.1211 18.9831 10.0625 18.9961 10.0039 18.9961Z"
                fill={color}
            />
        </svg>
    );
}
