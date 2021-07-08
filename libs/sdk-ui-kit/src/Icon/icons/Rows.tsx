// (C) 2021 GoodData Corporation
import React from "react";

import { Color, IIconProps } from "../typings";

/**
 * @internal
 */
export interface IRowsIconProps extends IIconProps {
    colorPalette?: {
        odd?: Color;
        even?: Color;
    };
}

/**
 * @internal
 */
export const Rows: React.FC<IRowsIconProps> = ({ colorPalette, className, width, height }) => {
    const odd = colorPalette?.odd ?? "#D7DCE1";
    const even = colorPalette?.even ?? "#798795";

    return (
        <svg
            className={className}
            width={width ?? 16}
            height={height ?? 16}
            viewBox="0 0 12 11"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g transform="translate(-519.000000, -212.000000)">
                    <g transform="translate(244.000000, 165.000000)">
                        <g transform="translate(259.500000, 33.000000)">
                            <g transform="translate(15.500000, 14.000000)">
                                <g>
                                    <rect fill={odd} x="0" y="2.26485497e-14" width="12" height="2.2"></rect>
                                    <rect fill={even} x="0" y="2.93333333" width="12" height="2.2"></rect>
                                    <rect fill={odd} x="0" y="5.86666667" width="12" height="2.2"></rect>
                                    <rect fill={even} x="0" y="8.8" width="12" height="2.2"></rect>
                                </g>
                            </g>
                        </g>
                    </g>
                </g>
            </g>
        </svg>
    );
};
