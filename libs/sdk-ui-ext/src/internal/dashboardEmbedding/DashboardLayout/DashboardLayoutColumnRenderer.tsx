// (C) 2007-2020 GoodData Corporation
import React from "react";
import cx from "classnames";
import isNil from "lodash/isNil";
import { FluidLayoutColumnRenderer } from "../FluidLayout";
import { IDashboardViewLayoutColumnRenderer } from "./interfaces/dashboardLayoutComponents";

// Override default grid style
const defaultStyle = { minHeight: 0 };

export const DashboardLayoutColumnRenderer: IDashboardViewLayoutColumnRenderer = (props) => {
    const { children, className, column, screen, style } = props;
    const currentScreenSizeConfiguration = column.size[screen];
    const ratio = currentScreenSizeConfiguration?.heightAsRatio;
    const width = currentScreenSizeConfiguration?.widthAsGridColumnsCount;

    const updatedStyle = React.useMemo(() => {
        return {
            ...defaultStyle,
            ...style,
        };
    }, [style]);

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
            style={updatedStyle}
        >
            {children}
        </FluidLayoutColumnRenderer>
    );
};
