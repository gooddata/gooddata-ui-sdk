// (C) 2007-2025 GoodData Corporation

import { GridLayoutElement } from "./GridLayoutElement.js";
import { type IDashboardLayoutSectionRenderProps } from "./interfaces.js";

const isHiddenStyle = { height: 0, width: 0, overflow: "hidden", flex: 0 };
const defaultStyle = {};

export function DashboardLayoutSectionRenderer({
    children,
    parentLayoutItemSize,
    className,
    isHidden,
    exportStyles,
}: IDashboardLayoutSectionRenderProps<unknown> & object) {
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
}
