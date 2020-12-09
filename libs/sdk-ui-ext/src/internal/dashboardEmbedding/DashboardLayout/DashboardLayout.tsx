// (C) 2007-2020 GoodData Corporation
import React from "react";
import { setConfiguration } from "react-grid-system";
import cx from "classnames";
import { FluidLayout } from "../FluidLayout";
import { IDashboardViewLayout } from "./interfaces/dashboardLayout";
import {
    IDashboardViewLayoutColumnRenderProps,
    IDashboardViewLayoutColumnKeyGetter,
    IDashboardViewLayoutColumnRenderer,
    IDashboardViewLayoutContentRenderer,
    IDashboardViewLayoutRowKeyGetter,
    IDashboardViewLayoutRowRenderer,
} from "./interfaces/dashboardLayoutComponents";
import { DASHBOARD_LAYOUT_GRID_CONFIGURATION } from "./constants";
import { unifyDashboardLayoutColumnHeights } from "./utils/sizing";
import { DashboardLayoutContentRenderer } from "./DashboardLayoutContentRenderer";
import { DashboardLayoutRowRenderer } from "./DashboardLayoutRowRenderer";
import { DashboardLayoutColumnRenderer } from "./DashboardLayoutColumnRenderer";

setConfiguration(DASHBOARD_LAYOUT_GRID_CONFIGURATION);

export interface IDashboardViewLayoutProps {
    layout: IDashboardViewLayout;
    rowRenderer?: IDashboardViewLayoutRowRenderer;
    rowKeyGetter?: IDashboardViewLayoutRowKeyGetter;
    columnKeyGetter?: IDashboardViewLayoutColumnKeyGetter;
    columnRenderer?: IDashboardViewLayoutColumnRenderer;
    contentRenderer?: IDashboardViewLayoutContentRenderer;
    debug?: boolean;
    className?: string;
    onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const DashboardLayout: React.FC<IDashboardViewLayoutProps> = (props) => {
    const {
        layout,
        rowRenderer: RowRenderer = DashboardLayoutRowRenderer,
        rowKeyGetter,
        columnRenderer: ColumnRenderer = DashboardLayoutColumnRenderer,
        columnKeyGetter,
        contentRenderer: ContentRenderer = DashboardLayoutContentRenderer,
        debug,
        className,
        onMouseLeave,
    } = props;

    const dashboardLayout: IDashboardViewLayout = unifyDashboardLayoutColumnHeights(layout);

    const rowRenderer = React.useCallback(
        (renderProps: IDashboardViewLayoutColumnRenderProps) => (
            <RowRenderer {...renderProps} debug={debug} />
        ),
        [RowRenderer, debug],
    );

    const contentRenderer = React.useCallback(
        (renderProps: IDashboardViewLayoutColumnRenderProps) => (
            <ContentRenderer {...renderProps} debug={debug} />
        ),
        [ContentRenderer, debug],
    );

    return (
        <FluidLayout
            className={cx("gd-fluidlayout-container", "s-fluid-layout-container", "gd-dashboards", className)}
            containerClassName="gd-fluidlayout-layout s-fluid-layout"
            layout={dashboardLayout}
            rowKeyGetter={rowKeyGetter}
            rowRenderer={rowRenderer}
            columnKeyGetter={columnKeyGetter}
            columnRenderer={ColumnRenderer}
            contentRenderer={contentRenderer}
            onMouseLeave={onMouseLeave}
        />
    );
};
