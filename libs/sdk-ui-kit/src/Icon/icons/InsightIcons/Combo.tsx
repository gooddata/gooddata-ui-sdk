// (C) 2022-2025 GoodData Corporation
import React from "react";
import { IIconProps } from "../../typings.js";

/**
 * @internal
 */
export const Combo: React.FC<IIconProps> = ({ className, width, height, color, ariaHidden }) => {
    return (
        <svg
            width={width}
            height={height}
            className={className}
            viewBox="11 16 26 20"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
        >
            <g fill={color ?? "#B0BECA"}>
                <path
                    fillOpacity=".45"
                    d="M12 31h6v6h-6zm18 2h6v4h-6zm-8.9328613 3.958252h5.9603564V26.0699443l-2.9164111-2.9897441-3.046875 2.973999zM21.05896 16.02868652l-.0367432 4.1856684 2.9934082-2.90661566 2.9658203 3.05414631.0275879-4.32343342z"
                />
                <path d="M33.1717889 30.513756l3.7971224-4.3227442-1.0715959-.92293511-2.7255265 3.18196631-9.1853496-9.6429648-9.01280649 9.3295-3.0487394-2.1232674-.94177665 1.406418 3.99051605 2.8275246L24 21.13719175z" />
            </g>
        </svg>
    );
};
