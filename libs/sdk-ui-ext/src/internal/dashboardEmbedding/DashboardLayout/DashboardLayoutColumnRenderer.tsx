// (C) 2007-2020 GoodData Corporation
import React from "react";
import cx from "classnames";
import isNil from "lodash/isNil";
import { IDashboardViewLayoutColumnRenderProps } from "./interfaces/dashboardLayoutComponents";
import { FluidLayoutColumnRenderer } from "../FluidLayout";

export function DashboardLayoutColumnRenderer<TCustomContent>(
    props: IDashboardViewLayoutColumnRenderProps<TCustomContent>,
): JSX.Element {
    const { children, className, column, screen, minHeight = 0 } = props;
    const currentScreenSizeConfiguration = column.size()[screen];
    const ratio = currentScreenSizeConfiguration?.heightAsRatio;
    const width = currentScreenSizeConfiguration?.widthAsGridColumnsCount;

    return (
        <FluidLayoutColumnRenderer
            {...props}
            className={cx(
                "gd-fluidlayout-column",
                "s-fluid-layout-column",
                `s-fluid-layout-screen-${screen}`,
                `s-fluid-layout-column-width-${width}`,
                {
                    [`s-fluid-layout-column-ratio-${ratio}`]: !isNil(ratio),
                },
                className,
            )}
            minHeight={minHeight}
        >
            {children}
        </FluidLayoutColumnRenderer>
    );
}
