// (C) 2007-2020 GoodData Corporation
import React, { useMemo } from "react";
import isEqual from "lodash/isEqual";
import { setConfiguration } from "react-grid-system";
import cx from "classnames";
import { isWidget, isWidgetDefinition } from "@gooddata/sdk-backend-spi";
import { FluidLayout } from "../FluidLayout";
import { IDashboardViewLayout, IDashboardViewLayoutContent } from "./interfaces/dashboardLayout";
import {
    IDashboardViewLayoutColumnRenderProps,
    IDashboardViewLayoutColumnKeyGetter,
    IDashboardViewLayoutColumnRenderer,
    IDashboardViewLayoutContentRenderProps,
    IDashboardViewLayoutRowKeyGetter,
    IDashboardViewLayoutRowRenderer,
    IDashboardViewLayoutRowRenderProps,
    IDashboardViewLayoutRowHeaderRenderer,
    IDashboardViewLayoutRowHeaderRenderProps,
} from "./interfaces/dashboardLayoutComponents";
import { DASHBOARD_LAYOUT_GRID_CONFIGURATION } from "./constants";
import { getResizedColumnPositions, unifyDashboardLayoutColumnHeights } from "./utils/sizing";
import { DashboardLayoutContentRenderer } from "./DashboardLayoutContentRenderer";
import { DashboardLayoutRowRenderer } from "./DashboardLayoutRowRenderer";
import { DashboardLayoutColumnRenderer } from "./DashboardLayoutColumnRenderer";
import { DashboardLayoutRowHeaderRenderer } from "./DashboardLayoutRowHeaderRenderer";

setConfiguration(DASHBOARD_LAYOUT_GRID_CONFIGURATION);

/**
 * @alpha
 */
export interface IDashboardViewLayoutProps<TCustomContent> {
    layout: IDashboardViewLayout<TCustomContent>;
    rowRenderer?: IDashboardViewLayoutRowRenderer<TCustomContent>;
    rowKeyGetter?: IDashboardViewLayoutRowKeyGetter<TCustomContent>;
    rowHeaderRenderer?: IDashboardViewLayoutRowHeaderRenderer<TCustomContent>;
    columnKeyGetter?: IDashboardViewLayoutColumnKeyGetter<TCustomContent>;
    columnRenderer?: IDashboardViewLayoutColumnRenderer<TCustomContent>;
    contentRenderer?: React.ComponentType<IDashboardViewLayoutContentRenderProps<TCustomContent>>;
    debug?: boolean;
    className?: string;
    onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void;
    layoutSizingStrategy?: (
        layout: IDashboardViewLayout<TCustomContent>,
    ) => IDashboardViewLayout<TCustomContent>;
}

export function DashboardLayout<TCustomContent = IDashboardViewLayoutContent>(
    props: IDashboardViewLayoutProps<TCustomContent>,
): JSX.Element {
    const {
        layout,
        rowRenderer: RowRenderer,
        rowHeaderRenderer: RowHeaderRenderer,
        rowKeyGetter,
        columnRenderer: ColumnRenderer,
        columnKeyGetter,
        contentRenderer: ContentRenderer,
        debug,
        className,
        onMouseLeave,
        layoutSizingStrategy = unifyDashboardLayoutColumnHeights,
    } = props;

    const resizedLayout = useMemo(() => layoutSizingStrategy(layout), [layout]);

    const rowRenderer = React.useCallback(
        (renderProps: IDashboardViewLayoutRowRenderProps<TCustomContent>) => {
            return RowRenderer ? (
                <RowRenderer {...renderProps} DefaultRenderer={DashboardLayoutRowRenderer} debug={debug} />
            ) : (
                <DashboardLayoutRowRenderer {...renderProps} />
            );
        },
        [RowRenderer, debug],
    );

    const rowHeaderRenderer = React.useCallback(
        (renderProps: IDashboardViewLayoutRowHeaderRenderProps<TCustomContent>) => {
            return RowHeaderRenderer ? (
                <RowHeaderRenderer
                    {...renderProps}
                    DefaultRenderer={DashboardLayoutRowHeaderRenderer}
                    debug={debug}
                />
            ) : (
                <DashboardLayoutRowHeaderRenderer {...renderProps} debug={debug} />
            );
        },
        [RowHeaderRenderer, debug],
    );

    const columnRenderer = React.useCallback(
        (renderProps: IDashboardViewLayoutColumnRenderProps<TCustomContent>) => {
            return ColumnRenderer ? (
                <ColumnRenderer
                    {...renderProps}
                    DefaultRenderer={DashboardLayoutColumnRenderer}
                    debug={debug}
                />
            ) : (
                <DashboardLayoutColumnRenderer {...renderProps} debug={debug} />
            );
        },
        [ColumnRenderer, debug],
    );

    const contentRenderer = React.useCallback(
        (renderProps: IDashboardViewLayoutColumnRenderProps<TCustomContent>) => {
            const content = renderProps.column.content();
            let isResizedByLayoutSizingStrategy: boolean;
            if (isWidget(content) || isWidgetDefinition(content)) {
                const resizedColumnPosition = getResizedColumnPositions(layout, resizedLayout);
                isResizedByLayoutSizingStrategy = resizedColumnPosition.some((position) =>
                    isEqual(position, [renderProps.column.row().index(), renderProps.column.index()]),
                );
            }

            return ContentRenderer ? (
                <ContentRenderer
                    {...renderProps}
                    debug={debug}
                    isResizedByLayoutSizingStrategy={isResizedByLayoutSizingStrategy}
                    DefaultRenderer={DashboardLayoutContentRenderer}
                />
            ) : (
                <DashboardLayoutContentRenderer
                    {...renderProps}
                    debug={debug}
                    isResizedByLayoutSizingStrategy={isResizedByLayoutSizingStrategy}
                />
            );
        },
        [ContentRenderer, debug, layout, resizedLayout],
    );

    return (
        <FluidLayout
            className={cx("gd-fluidlayout-container", "s-fluid-layout-container", "gd-dashboards", className)}
            containerClassName="gd-fluidlayout-layout s-fluid-layout"
            layout={resizedLayout}
            rowKeyGetter={rowKeyGetter}
            rowRenderer={rowRenderer}
            rowHeaderRenderer={rowHeaderRenderer}
            columnKeyGetter={columnKeyGetter}
            columnRenderer={columnRenderer}
            contentRenderer={contentRenderer}
            onMouseLeave={onMouseLeave}
        />
    );
}
