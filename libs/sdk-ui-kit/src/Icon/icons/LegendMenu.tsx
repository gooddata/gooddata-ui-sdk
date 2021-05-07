// (C) 2021 GoodData Corporation
import React from "react";

import { IIconProps } from "../typings";

/**
 * @internal
 */
export const LegendMenu: React.FC<IIconProps> = ({ color, className, width, height }) => {
    return (
        <svg
            className={className}
            width={width ?? 13}
            height={height ?? 10}
            viewBox="0 0 13 10"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g id="Legend" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g
                    id="LegendIcoContent"
                    transform="translate(-1697.000000, -375.000000)"
                    fill={color ?? "#6D7680"}
                >
                    <g transform="translate(1104.000000, 299.000000)">
                        <g transform="translate(588.000000, 70.000000)">
                            <path d="M17.4980391,13.9803909 L17.4980391,15.4803909 L8.49803912,15.4803909 L8.49803912,13.9803909 L17.4980391,13.9803909 Z M7.00196088,13.9803909 L7.00196088,15.4803909 L5.50196088,15.4803909 L5.50196088,13.9803909 L7.00196088,13.9803909 Z M17.4980391,10.2303909 L17.4980391,11.7303909 L8.49803912,11.7303909 L8.49803912,10.2303909 L17.4980391,10.2303909 Z M7.00196088,10.2303909 L7.00196088,11.7303909 L5.50196088,11.7303909 L5.50196088,10.2303909 L7.00196088,10.2303909 Z M17.4980391,6.48039088 L17.4980391,7.98039088 L8.49803912,7.98039088 L8.49803912,6.48039088 L17.4980391,6.48039088 Z M7.00196088,6.48039088 L7.00196088,7.98039088 L5.50196088,7.98039088 L5.50196088,6.48039088 L7.00196088,6.48039088 Z"></path>
                        </g>
                    </g>
                </g>
            </g>
        </svg>
    );
};
