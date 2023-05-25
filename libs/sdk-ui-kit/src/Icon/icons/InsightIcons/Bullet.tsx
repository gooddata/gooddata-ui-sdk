// (C) 2022 GoodData Corporation
import React from "react";
import { IIconProps } from "../../typings.js";

/**
 * @internal
 */
export const Bullet: React.FC<IIconProps> = ({ className, width, height, color }) => {
    return (
        <svg
            width={width}
            height={height}
            className={className}
            viewBox="0 0 26 26"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g stroke="none" strokeWidth="1" fill={color ?? "#B0BECA"} fillRule="evenodd">
                <path
                    d="M0,9.75 L21,9.75 L21,16.25 L0,16.25 L0,9.75 Z M0,19.5 L18,19.5 L18,26 L0,26 L0,19.5 Z M0,0 L26,0 L26,6.5 L0,6.5 L0,0 Z"
                    fillOpacity=".45"
                ></path>
                <path d="M20,2.16666667 L20,1.08333333 L21,1.08333333 L21,2.16666667 L24,2.16666667 L24,4.33333333 L21,4.33333333 L21,5.41666667 L20,5.41666667 L20,4.33333333 L5.32907052e-15,4.33333333 L5.32907052e-15,2.16666667 L20,2.16666667 Z M5.32907052e-15,11.9166667 L12,11.9166667 L12,14.0833333 L5.32907052e-15,14.0833333 L5.32907052e-15,11.9166667 Z M15,10.8333333 L16,10.8333333 L16,15.1666667 L15,15.1666667 L15,10.8333333 Z M5.32907052e-15,21.6666667 L8,21.6666667 L8,23.8333333 L5.32907052e-15,23.8333333 L5.32907052e-15,21.6666667 Z M11,20.5833333 L12,20.5833333 L12,24.9166667 L11,24.9166667 L11,20.5833333 Z"></path>
            </g>
        </svg>
    );
};
