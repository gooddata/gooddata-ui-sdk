// (C) 2022 GoodData Corporation
import React from "react";
import { IIconProps } from "../../typings.js";

/**
 * @internal
 */
export const StackedArea: React.FC<IIconProps> = ({ className, width, height, color }) => {
    return (
        <svg
            width={width}
            height={height}
            className={className}
            viewBox="0 0 24 20"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g fill={color ?? "#B0BECA"} fillRule="evenodd">
                <path
                    fillOpacity=".45"
                    d="M0 6.94820644l3.5797762 1.76574182L11.9059481 0l7.0831473 5.01009834L24 .23762245V14.2857143H0z"
                />
                <path
                    fillRule="nonzero"
                    d="M0 12.6624922l3.5797762-.9993195 8.3261719-5.94888699 7.0831473 6.85347249L24 5.95190816V20H0z"
                />
            </g>
        </svg>
    );
};
