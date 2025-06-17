// (C) 2021-2025 GoodData Corporation

import React from "react";

import { IIconProps } from "../typings.js";

/**
 * @internal
 */
export const Coin: React.FC<IIconProps> = ({ className, width = 32, height = 32 }) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 32 34"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <g filter="url(#filter0_di_74_3458)">
                <circle cx="16" cy="16" r="16" fill="#F39E09" />
                <circle cx="16" cy="16" r="15" stroke="#FDD835" strokeWidth="2" />
            </g>
            <g filter="url(#filter1_d_74_3458)">
                <path
                    d="M23.9986 18.5488C23.9402 16.06 22.567 14.0849 20.4703 13.3127V8.98106C19.942 8.64298 19.3783 8.36343 18.7893 8.14735V17.4659C18.7893 19.3118 17.9334 20.1362 16.5572 20.1362C15.2179 20.1362 14.0972 19.1241 14.0972 17.4321C14.0972 15.5431 15.5689 14.3895 17.4962 14.3895C17.6765 14.3854 17.8567 14.3967 18.035 14.4233V12.7743C17.8572 12.7431 17.6768 12.7286 17.4962 12.7312C14.636 12.7312 12.3947 14.4848 12.3947 17.4351C12.3947 20.2716 14.4174 21.7852 16.6711 21.7852C17.7394 21.7852 18.6631 21.4222 19.3004 20.7977C19.9377 20.1732 20.4765 19.2718 20.4765 17.6874V15.1063C21.6403 15.6877 22.3423 17.0967 22.3453 18.7088C22.3392 21.7452 19.5221 24.311 16.2185 24.311C16.1416 24.311 16.0831 24.311 16.0061 24.3078C14.9133 24.3203 13.8294 24.1107 12.8201 23.6919C11.8109 23.273 10.8973 22.6537 10.1348 21.8714C8.97339 20.7094 8.18178 19.2301 7.85959 17.6197C7.53855 16.0084 7.70357 14.338 8.33372 12.8205C8.96258 11.3026 10.0275 10.0051 11.394 9.09183C12.7608 8.17871 14.3681 7.69154 16.0122 7.69204V6C14.6981 5.99993 13.3967 6.25812 12.1822 6.75988C10.9682 7.26266 9.86467 7.99848 8.93409 8.92569C8.00406 9.85359 7.26622 10.9556 6.76276 12.1687C6.2593 13.3818 6.00011 14.6821 6 15.9954C5.99991 18.6474 7.05295 21.1911 8.92794 23.0681C9.85655 23.9974 10.9594 24.7347 12.1734 25.2378C13.3874 25.7409 14.6887 25.9999 16.003 26H16.2154C17.033 25.9989 17.8458 25.8744 18.6261 25.6308C18.6292 25.6308 18.6323 25.6277 18.6354 25.6277C19.7636 25.2776 20.7996 24.6806 21.668 23.8802C23.1674 22.4959 23.9926 20.6654 23.9986 18.718C24.0017 18.7119 23.9986 18.5519 23.9986 18.5488Z"
                    fill="#FDD835"
                />
            </g>
            <defs>
                <filter
                    id="filter0_di_74_3458"
                    x="0"
                    y="0"
                    width="32"
                    height="33.5"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <feOffset dy="1.5" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.909804 0 0 0 0 0.505882 0 0 0 0 0.00784314 0 0 0 1 0"
                    />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_74_3458" />
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="effect1_dropShadow_74_3458"
                        result="shape"
                    />
                    <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <feOffset dy="3.5" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.909804 0 0 0 0 0.505882 0 0 0 0 0.00784314 0 0 0 1 0"
                    />
                    <feBlend mode="normal" in2="shape" result="effect2_innerShadow_74_3458" />
                </filter>
                <filter
                    id="filter1_d_74_3458"
                    x="6"
                    y="6"
                    width="18"
                    height="21.5"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <feOffset dy="1.5" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.909804 0 0 0 0 0.505882 0 0 0 0 0.00784314 0 0 0 1 0"
                    />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_74_3458" />
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="effect1_dropShadow_74_3458"
                        result="shape"
                    />
                </filter>
            </defs>
        </svg>
    );
};
