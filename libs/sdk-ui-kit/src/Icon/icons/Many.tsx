// (C) 2022 GoodData Corporation

import React from "react";

import { IIconProps } from "../typings.js";

/**
 * @internal
 */
export const Many: React.FC<IIconProps> = ({ color, className, width, height }) => {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0.5 0.5 19 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke={color ?? "#B0BECA"}
        >
            <path d="M10.4118 7H1.58824C1.26336 7 1 7.27552 1 7.61538V14.3846C1 14.7245 1.26336 15 1.58824 15H10.4118C10.7366 15 11 14.7245 11 14.3846V7.61538C11 7.27552 10.7366 7 10.4118 7Z" />
            <path d="M11 12H14.4118C14.7366 12 15 11.7245 15 11.3846V4.61538C15 4.27552 14.7366 4 14.4118 4H5.58824C5.26336 4 5 4.27552 5 4.61538V7" />
            <path d="M15 9H18.4118C18.7366 9 19 8.72448 19 8.38462V1.61538C19 1.27552 18.7366 1 18.4118 1H9.58824C9.26336 1 9 1.27552 9 1.61538V4" />
        </svg>
    );
};
