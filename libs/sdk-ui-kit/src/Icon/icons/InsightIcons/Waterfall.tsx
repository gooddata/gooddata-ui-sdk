// (C) 2023 GoodData Corporation
import React from "react";
import { IIconProps } from "../../typings";

/**
 * @internal
 */
export const Waterfall: React.FC<IIconProps> = ({ className, width, height, color }) => {
    return (
        <svg
            width={width}
            height={height}
            className={className}
            viewBox="0 0 24 19"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect x="5" y="18" width="4" height="8" fill={color ?? "#B0BECA"} fillOpacity="0.6" />
            <rect x="11" y="12" width="4" height="6" fill={color ?? "#B0BECA"} fillOpacity="0.6" />
            <rect x="17" y="4" width="4" height="8" fill={color ?? "#B0BECA"} fillOpacity="0.6" />
            <rect x="23" y="4" width="4" height="22" fill={color ?? "#B0BECA"} />
        </svg>
    );
};
