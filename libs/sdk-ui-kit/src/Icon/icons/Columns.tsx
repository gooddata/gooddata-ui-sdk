// (C) 2023 GoodData Corporation
import React from "react";

import { Color, IIconProps } from "../typings.js";

/**
 * @internal
 */
export interface IColumnsIconProps extends IIconProps {
    colorPalette?: {
        normalColumn?: Color;
        totalColumn?: Color;
    };
}

/**
 * @internal
 */
export const Columns: React.FC<IColumnsIconProps> = ({ colorPalette, className, width, height }) => {
    const normalColumn = colorPalette?.normalColumn ?? "#CCD8E2";
    const totalColumn = colorPalette?.totalColumn ?? "#94A1AD";
    return (
        <svg
            className={className}
            width={width ?? 16}
            height={height ?? 16}
            viewBox="0 0 13 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g clipPath="url(#clip0_405_2499)">
                <path d="M1 13L1 1.03318e-07L3 0L3 13H1Z" fill={normalColumn} />
                <path d="M5 13L5 1.03318e-07L7 0L7 13H5Z" fill={normalColumn} />
                <rect x="9" y="13" width="13" height="2" transform="rotate(-90 9 13)" fill={totalColumn} />
            </g>
            <defs>
                <clipPath id="clip0_405_2499">
                    <rect width="13" height="13" fill="white" transform="translate(0 13) rotate(-90)" />
                </clipPath>
            </defs>
        </svg>
    );
};
