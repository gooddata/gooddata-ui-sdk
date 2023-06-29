// (C) 2022 GoodData Corporation

import React from "react";
import { TooltipIcon } from "./TooltipIcon.js";

/**
 * @internal
 */
export interface ITitleProps {
    title?: string;
    tooltip?: string;
}

/**
 * @internal
 */
export const Title: React.FC<ITitleProps> = ({ title, tooltip }) => {
    return (
        <>
            {title ? <span className="gd-widget-title">{title}</span> : null}
            {tooltip ? <TooltipIcon text={tooltip} iconClass="gd-icon-circle-question" /> : null}
        </>
    );
};
