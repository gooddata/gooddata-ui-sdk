// (C) 2007-2025 GoodData Corporation
import React from "react";

import { GridLayoutElement } from "./GridLayoutElement.js";
import { IDashboardLayoutSectionRenderer } from "./interfaces.js";

const isHiddenStyle = { height: 0, width: 0, overflow: "hidden", flex: 0 };
const defaultStyle = {};

export const DashboardLayoutSectionRenderer: IDashboardLayoutSectionRenderer<unknown> = ({
    children,
    parentLayoutItemSize,
    className,
    isHidden,
    exportStyles,
}) => {
    const style = isHidden ? isHiddenStyle : defaultStyle;
    return (
        <GridLayoutElement
            type="section"
            layoutItemSize={parentLayoutItemSize}
            className={className}
            style={style}
            exportStyles={exportStyles}
        >
            {children}
        </GridLayoutElement>
    );
};
