// (C) 2007-2025 GoodData Corporation
import cx from "classnames";

import { IDashboardLayoutSectionRenderProps } from "./interfaces.js";

const isHiddenStyle = { height: 0, width: 0, overflow: "hidden", flex: 0 };
const defaultStyle = {};

export function ExportableDashboardLayoutSectionRenderer({
    children,
    className,
    debug,
    isHidden,
    exportData,
    exportStyles,
}: IDashboardLayoutSectionRenderProps<unknown>) {
    const style = isHidden ? isHiddenStyle : defaultStyle;

    return (
        <div
            className={cx(["gd-fluidlayout-row", "s-fluid-layout-row", className], {
                "gd-fluidlayout-row-debug": debug,
            })}
            style={{
                ...style,
                ...exportStyles,
            }}
            {...exportData}
        >
            {children}
        </div>
    );
}
