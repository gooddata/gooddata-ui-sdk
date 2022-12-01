// (C) 2020-2022 GoodData Corporation
import React from "react";
import { GD_COLOR_HIGHLIGHT, GD_COLOR_WHITE, INFO_TEXT_COLOR } from "@gooddata/sdk-ui-kit";

export interface IDashboardEditLayoutSectionBorderMarkerProps {
    active?: boolean;
    className?: string;
}

export const DashboardEditLayoutSectionBorderMarker: React.FC<
    IDashboardEditLayoutSectionBorderMarkerProps
> = (props) => {
    const { active, className } = props;

    const background = active ? `var(--gd-palette-primary-base, ${GD_COLOR_HIGHLIGHT})` : "#E6E6E6";
    const color = active ? GD_COLOR_WHITE : INFO_TEXT_COLOR;

    return (
        <svg
            width="20"
            height="20"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            className={className}
        >
            <g fill="none" fillRule="evenodd">
                <circle cx="10" cy="10" r="10" fill={background} />
                <path
                    d="M6.5 9.5H14c.2761424 0 .5.22385763.5.5 0 .2761424-.2238576.5-.5.5H6.5V14c0 .2761424-.22385763.5-.5.5-.27614237 0-.5-.2238576-.5-.5V6c0-.27614237.22385763-.5.5-.5.27614237 0 .5.22385763.5.5v3.5z"
                    fill={color}
                    fillRule="nonzero"
                />
            </g>
        </svg>
    );
};
