// (C) 2022 GoodData Corporation
import React from "react";
import { IIconProps } from "../typings";

/**
 * @internal
 */
export const Chart: React.FC<IIconProps> = ({ className, width = 12, height = 12, color }) => {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 24 20"
            fill={color ?? "#94A1AD"}
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0 13.5H6V19.5H0V13.5ZM9 0.5H15V19.5H9V0.5ZM18 15.5H24V19.5H18V15.5Z"
            />
        </svg>
    );
};
