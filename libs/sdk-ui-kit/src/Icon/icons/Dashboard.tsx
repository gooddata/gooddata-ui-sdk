// (C) 2022 GoodData Corporation
import React from "react";
import { IIconProps } from "../typings.js";

/**
 * @internal
 */
export const Dashboard: React.FC<IIconProps> = ({ color, className, width, height }) => {
    return (
        <svg
            width={width}
            height={height}
            className={className}
            viewBox="0.5 0.5 18 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke={color ?? "#B0BECA"}
        >
            <path d="M17 1H2C1.44772 1 1 1.44772 1 2V13C1 13.5523 1.44772 14 2 14H17C17.5523 14 18 13.5523 18 13V2C18 1.44772 17.5523 1 17 1Z" />
            <path d="M15 12H4C3.44772 12 3 12.4477 3 13C3 13.5523 3.44772 14 4 14H15C15.5523 14 16 13.5523 16 13C16 12.4477 15.5523 12 15 12Z" />
            <path d="M15 7H14C13.4477 7 13 7.44772 13 8V9C13 9.55228 13.4477 10 14 10H15C15.5523 10 16 9.55228 16 9V8C16 7.44772 15.5523 7 15 7Z" />
            <path d="M10 7H9C8.44772 7 8 7.44772 8 8V9C8 9.55228 8.44772 10 9 10H10C10.5523 10 11 9.55228 11 9V8C11 7.44772 10.5523 7 10 7Z" />
            <path d="M5 7H4C3.44772 7 3 7.44772 3 8V9C3 9.55228 3.44772 10 4 10H5C5.55228 10 6 9.55228 6 9V8C6 7.44772 5.55228 7 5 7Z" />
            <path d="M18 3H1" strokeLinecap="square" />
            <path d="M9 5H3" strokeLinecap="square" />
        </svg>
    );
};
