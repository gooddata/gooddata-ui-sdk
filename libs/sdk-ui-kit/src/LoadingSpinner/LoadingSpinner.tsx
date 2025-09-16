// (C) 2021-2025 GoodData Corporation

import cx from "classnames";

/**
 * @internal
 */
export interface ILoadingSpinner {
    className?: string;
    color?: string;
}

/**
 * @internal
 */
export function LoadingSpinner({ className, color }: ILoadingSpinner) {
    const strokeColor = color ?? "#363636";

    return (
        <span className={cx("gd-loading-spinner s-loading-spinner", className)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="128px" height="128px" viewBox="0 0 128 128">
                <path
                    fill="none"
                    stroke={strokeColor}
                    strokeOpacity="1"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeMiterlimit="10"
                    d="M64 8.125v19.637"
                />
                <path
                    fill="none"
                    stroke={strokeColor}
                    strokeOpacity="0.916"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeMiterlimit="10"
                    d="M36.062 15.61L45.88 32.62"
                />
                <path
                    fill="none"
                    stroke={strokeColor}
                    strokeOpacity="0.833"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeMiterlimit="10"
                    d="M15.61 36.062l17.008 9.82"
                />
                <path
                    fill="none"
                    stroke={strokeColor}
                    strokeOpacity="0.75"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeMiterlimit="10"
                    d="M8.126 64h19.638"
                />
                <path
                    fill="none"
                    stroke={strokeColor}
                    strokeOpacity="0.666"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeMiterlimit="10"
                    d="M15.612 91.938l17.007-9.82"
                />
                <path
                    fill="none"
                    stroke={strokeColor}
                    strokeOpacity="0.583"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeMiterlimit="10"
                    d="M36.064 112.39l9.82-17.01"
                />
                <path
                    fill="none"
                    stroke={strokeColor}
                    strokeOpacity="0.5"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeMiterlimit="10"
                    d="M64 119.873v-19.636"
                />
                <path
                    fill="none"
                    stroke={strokeColor}
                    strokeOpacity="0.416"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeMiterlimit="10"
                    d="M91.94 112.387L82.12 95.38"
                />
                <path
                    fill="none"
                    stroke={strokeColor}
                    strokeOpacity="0.333"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeMiterlimit="10"
                    d="M112.39 91.935l-17.004-9.82"
                />
                <path
                    fill="none"
                    stroke={strokeColor}
                    strokeOpacity="0.25"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeMiterlimit="10"
                    d="M119.875 63.997H100.24"
                />
                <path
                    fill="none"
                    stroke={strokeColor}
                    strokeOpacity="0.166"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeMiterlimit="10"
                    d="M112.39 36.06l-17.006 9.817"
                />
                <path
                    fill="none"
                    strokeOpacity="0.083"
                    stroke={strokeColor}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeMiterlimit="10"
                    d="M91.937 15.61l-9.82 17.004"
                />
            </svg>
        </span>
    );
}
