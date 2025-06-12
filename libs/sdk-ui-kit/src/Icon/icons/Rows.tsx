// (C) 2021-2023 GoodData Corporation
import React from "react";

import { Color, IIconProps } from "../typings.js";

/**
 * @internal
 */
export interface IRowsIconProps extends IIconProps {
    colorPalette?: {
        normalRow?: Color;
        totalRow?: Color;
    };
}

/**
 * @internal
 */
export const Rows: React.FC<IRowsIconProps> = ({ colorPalette, className, width, height }) => {
    const normalRow = colorPalette?.normalRow ?? "#CCD8E2";
    const totalRow = colorPalette?.totalRow ?? "#94A1AD";

    return (
        <svg
            className={className}
            width={width ?? 16}
            height={height ?? 16}
            viewBox="0 0 13 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M0 1H13V3H0V1Z" fill={normalRow} />
            <path d="M0 5H13V7H0V5Z" fill={normalRow} />
            <rect y="9" width="13" height="2" fill={totalRow} />
        </svg>
    );
};
