// (C) 2007-2020 GoodData Corporation
import React from "react";
import cx from "classnames";
import { IDashboardViewLayoutRowRenderProps } from "./interfaces/dashboardLayoutComponents";
import { FluidLayoutRowRenderer } from "../FluidLayout";

export function DashboardLayoutRowRenderer<TCustomContent>(
    props: IDashboardViewLayoutRowRenderProps<TCustomContent>,
): JSX.Element {
    const { debug, className, children } = props;
    return (
        <FluidLayoutRowRenderer
            {...props}
            className={cx(["gd-fluidlayout-row", "s-fluid-layout-row", className], {
                "gd-fluidlayout-row-debug": debug,
            })}
        >
            {children}
        </FluidLayoutRowRenderer>
    );
}
