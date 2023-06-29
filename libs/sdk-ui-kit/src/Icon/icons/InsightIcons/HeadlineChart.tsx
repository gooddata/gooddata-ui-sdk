// (C) 2022 GoodData Corporation
import React from "react";
import { IIconProps } from "../../typings.js";

/**
 * @internal
 */
export const HeadlineChart: React.FC<IIconProps> = ({ className, width, height, color }) => {
    return (
        <svg
            width={width}
            height={height}
            className={className}
            viewBox="1 2 22 20"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g fill={color ?? "#B0BECA"} fillRule="evenodd">
                <path fillOpacity=".45" d="M1 18h10v4H1zM13 18h10v4H13z" />
                <path d="M10.05367232 8.20621469L5.75706215 2H9.3559322l2.7725989 4.55367232L14.7909605 2h3.4703389l-4.2048022 6.15112994L18.7570621 15h-3.59887l-3.1765537-5.23305085L8.89689266 15H5.5z" />
            </g>
        </svg>
    );
};
