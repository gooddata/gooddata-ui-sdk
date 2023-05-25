// (C) 2022 GoodData Corporation
import React from "react";
import { IIconProps } from "../../typings.js";

/**
 * @internal
 */
export const Pie: React.FC<IIconProps> = ({ className, width, height, color }) => {
    return (
        <svg
            width={width}
            height={height}
            className={className}
            viewBox="0.5 0 21.5 21.5"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g fill={color ?? "#B0BECA"} fillRule="evenodd">
                <path
                    fillOpacity=".45"
                    d="M15.2245949 1.06505244L9.81738281 12.1812029H21.7085541c-.6593226 5.1938331-5.0942822 9.2096017-10.4671748 9.2096017-5.82755632 0-10.55172413-4.7241678-10.55172413-10.5517241 0-5.82755637 4.72416781-10.55172418 10.55172413-10.55172418 1.4093442 0 2.7541543.27630358 3.9832156.77769612z"
                />
                <path d="M21.7930282 11.1287126h-10.23358l4.6503159-9.27089149c3.311636 1.77076573 5.5682631 5.25660198 5.5832641 9.27089149z" />
            </g>
        </svg>
    );
};
