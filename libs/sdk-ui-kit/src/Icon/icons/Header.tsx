// (C) 2021-2024 GoodData Corporation
import React from "react";

import { IIconProps } from "../typings.js";

/**
 * @internal
 */
export const Header: React.FC<IIconProps> = ({ className, color, width, height }) => {
    return (
        <svg
            className={className}
            width={width ?? "28"}
            height={height ?? "28"}
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M6 6.5V6H10V15H8.5C8.22386 15 8 15.2239 8 15.5C8 15.7761 8.22386 16 8.5 16H12.5C12.7761 16 13 15.7761 13 15.5C13 15.2239 12.7761 15 12.5 15H11V6H15V6.5C15 6.77614 15.2239 7 15.5 7C15.7761 7 16 6.77614 16 6.5V5.5C16 5.22386 15.7761 5 15.5 5L5.5 5C5.22386 5 5 5.22386 5 5.5V6.5C5 6.77614 5.22386 7 5.5 7C5.77614 7 6 6.77614 6 6.5Z"
                fill={color ?? "#464E56"}
            />
            <path
                d="M5 20.5C5 20.2239 5.22386 20 5.5 20H22.5C22.7761 20 23 20.2239 23 20.5C23 20.7761 22.7761 21 22.5 21H5.5C5.22386 21 5 20.7761 5 20.5Z"
                fill={color ?? "#464E56"}
            />
            <path
                d="M5 23.5C5 23.2239 5.22386 23 5.5 23H18.5C18.7761 23 19 23.2239 19 23.5C19 23.7761 18.7761 24 18.5 24H5.5C5.22386 24 5 23.7761 5 23.5Z"
                fill={color ?? "#464E56"}
            />
        </svg>
    );
};
