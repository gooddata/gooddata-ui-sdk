// (C) 2022 GoodData Corporation

import React from "react";

import { IIconProps } from "../typings";

/**
 * @internal
 */
export const Widget: React.FC<IIconProps> = ({ color, className, width, height }) => {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M10 3.33333V16H6V3.33333H10ZM16 0V16H12V0H16ZM4 8V16H0V8H4ZM9.06667 4.26667H6.93333V15.0667H9.06667V4.26667ZM15.0667 0.933333H12.9333V15.0667H15.0667V0.933333ZM3.06667 8.93333H0.933333V15.0667H3.06667V8.93333Z"
                fill={color ?? "#B0BECA"}
            />
        </svg>
    );
};
