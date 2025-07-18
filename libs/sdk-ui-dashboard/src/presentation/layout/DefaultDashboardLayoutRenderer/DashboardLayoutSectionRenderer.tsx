// (C) 2007-2025 GoodData Corporation
import { IDashboardLayoutSectionRenderProps } from "./interfaces.js";
import cx from "classnames";

const isHiddenStyle = { height: 0, width: 0, overflow: "hidden", flex: 0 };
const defaultStyle = {};

export function DashboardLayoutSectionRenderer({
    children,
    className,
    debug,
    isHidden,
}: IDashboardLayoutSectionRenderProps<unknown>) {
    const style = isHidden ? isHiddenStyle : defaultStyle;

    return (
        <div
            className={cx(["gd-fluidlayout-row", "s-fluid-layout-row", className], {
                "gd-fluidlayout-row-debug": debug,
            })}
            style={style}
        >
            {children}
        </div>
    );
}
