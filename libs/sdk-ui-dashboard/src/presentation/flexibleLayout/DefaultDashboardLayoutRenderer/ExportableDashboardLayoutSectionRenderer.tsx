// (C) 2007-2026 GoodData Corporation

import { GridLayoutElement } from "./GridLayoutElement.js";
import { type IDashboardLayoutSectionRenderProps } from "./interfaces.js";

const isHiddenStyle = { height: 0, width: 0, overflow: "hidden", flex: 0 };
const defaultStyle = {};

export function ExportableDashboardLayoutSectionRenderer({
    children,
    parentLayoutItemSize,
    className,
    isHidden,
    exportData,
    exportStyles,
}: IDashboardLayoutSectionRenderProps<unknown> & object) {
    const style = isHidden ? isHiddenStyle : defaultStyle;

    return (
        <GridLayoutElement
            type="section"
            layoutItemSize={parentLayoutItemSize}
            className={className}
            style={style}
            exportData={exportData}
            exportStyles={exportStyles}
        >
            {children}
        </GridLayoutElement>
    );
}
