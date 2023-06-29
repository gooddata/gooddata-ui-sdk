// (C) 2021-2022 GoodData Corporation

import React from "react";

import { IIconProps } from "../typings.js";

/**
 * @internal
 */
export const Dataset: React.FC<IIconProps> = ({ color, className, width = 13, height = 11 }) => {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 13 11"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
        >
            <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <path
                    d="M0 11H13V0H0V11ZM9.00391 7.99609H12.0039V9.99609H9.00391V7.99609ZM8.00391 7.99609H5.00391V9.99609H8.00391V7.99609ZM1.00418 7.99673L4.00391 7.99609V9.99609H1.00391L1.00418 7.99673ZM12.0039 4.99609H9.00391V6.99609H12.0039V4.99609ZM5.00391 4.99609H8.00391V6.99609H5.00391V4.99609ZM4.00391 4.99609L1.00391 4.99673V6.99609L4.00391 6.99545V4.99609ZM1.00391 1.99609H4.00391V3.99545L1.00418 3.99609L1.00391 1.99609ZM8.00391 1.99609H5.00391V3.99609H8.00391V1.99609ZM9.00391 1.99609H12.0039V3.99609H9.00391V1.99609Z"
                    fill={color ?? "#952F8E"}
                />
            </g>
        </svg>
    );
};
