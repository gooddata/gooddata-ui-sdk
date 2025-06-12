// (C) 2021-2022 GoodData Corporation

import React from "react";

import { IIconProps } from "../typings.js";

/**
 * @internal
 */
export const Label: React.FC<IIconProps> = ({ color, className, width = 18, height = 16 }) => {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 18 16"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
        >
            <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <path
                    d="M13.5,2.99953224 L13.5,5.99953224 L12.5,5.99953224 L12.5,4.49953224 C12.5,4.22338987 12.2761424,3.99953224 12,3.99953224 L10,3.99953224 C9.72385763,3.99953224 9.5,4.22338987 9.5,4.49953224 L9.5,11.5004678 L9.50805567,11.5903434 C9.55039163,11.8235926 9.75454011,12.0004678 10,12.0004678 L11.5,12.0004678 L11.5,13.0004678 L6.5,13.0004678 L6.5,12.0004678 L8,12.0004678 C8.27614237,12.0004678 8.5,11.7766102 8.5,11.5004678 L8.5,4.49953224 C8.5,4.22338987 8.27614237,3.99953224 8,3.99953224 L6,3.99953224 L5.91012437,4.00758791 C5.67687516,4.04992387 5.5,4.25407235 5.5,4.49953224 L5.5,5.99953224 L4.5,5.99953224 L4.5,2.99953224 L13.5,2.99953224 Z"
                    fill={color ?? "#EF8600"}
                    fillRule="nonzero"
                />
            </g>
        </svg>
    );
};
