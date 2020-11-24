// (C) 2007-2020 GoodData Corporation
import React from "react";
import cx from "classnames";
import { FluidLayoutRowRenderer } from "../FluidLayout";
import { IDashboardViewLayoutRowRenderer } from "./interfaces/dashboardLayoutComponents";

export const DashboardLayoutRowRenderer: IDashboardViewLayoutRowRenderer = (props) => {
    const { rowIndex, debug, style, children, className } = props;

    const updatedStyle = React.useMemo(() => {
        const debugStyle = debug
            ? {
                  backgroundColor: rowIndex % 2 === 0 ? "#F2F2F2" : "#FFFFFF",
              }
            : {};

        return {
            ...debugStyle,
            ...style,
        };
    }, [style, debug, rowIndex]);

    return (
        <FluidLayoutRowRenderer
            {...props}
            className={cx(["gd-fluidlayout-row", "s-fluid-layout-row", className])}
            style={updatedStyle}
        >
            {children}
        </FluidLayoutRowRenderer>
    );
};
