// (C) 2007-2025 GoodData Corporation
import React from "react";

import { IDashboardLayoutSectionRenderer } from "./interfaces.js";
import { GridLayoutElement } from "./GridLayoutElement.js";
import { useSlideSizeStyle } from "../../dashboardContexts/index.js";

const isHiddenStyle = { height: 0, width: 0, overflow: "hidden", flex: 0 };
const defaultStyle = {};

export const ExportableDashboardLayoutSectionRenderer: IDashboardLayoutSectionRenderer<unknown> = ({
    children,
    parentLayoutItemSize,
    parentLayoutPath,
    className,
    isHidden,
    exportData,
}) => {
    const style = isHidden ? isHiddenStyle : defaultStyle;
    const type = "section";
    const exportStyles = useSlideSizeStyle("export", type, parentLayoutPath);

    return (
        <GridLayoutElement
            type={type}
            layoutItemSize={parentLayoutItemSize}
            className={className}
            style={style}
            exportData={exportData}
            exportStyles={exportStyles}
        >
            {children}
        </GridLayoutElement>
    );
};
