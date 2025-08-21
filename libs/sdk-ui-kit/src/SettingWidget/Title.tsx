// (C) 2022-2025 GoodData Corporation

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
export function Title({ title, tooltip }: ITitleProps) {
    return (
        <>
            {title ? <span className="gd-widget-title">{title}</span> : null}
            {tooltip ? <TooltipIcon text={tooltip} iconClass="gd-icon-circle-question" /> : null}
        </>
    );
}
