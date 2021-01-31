// (C) 2007-2020 GoodData Corporation
import React from "react";
import isEqual from "lodash/isEqual";
import { setConfiguration } from "react-grid-system";
import cx from "classnames";
import { FluidLayout } from "../FluidLayout";
import { IDashboardViewLayout, IDashboardViewLayoutContent } from "./interfaces/dashboardLayout";
import {
    IDashboardViewLayoutColumnKeyGetter,
    IDashboardViewLayoutColumnRenderer,
    IDashboardViewLayoutRowKeyGetter,
    IDashboardViewLayoutRowRenderer,
    IDashboardViewLayoutRowHeaderRenderer,
    IDashboardViewLayoutContentRenderer,
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
    contentRenderer?: IDashboardViewLayoutContentRenderer<TCustomContent>;
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
        rowRenderer = DashboardLayoutRowRenderer,
        rowHeaderRenderer,
        rowKeyGetter,
        columnRenderer = DashboardLayoutColumnRenderer,
        columnKeyGetter,
        contentRenderer = DashboardLayoutContentRenderer,
        debug,
        className,
        onMouseLeave,
        layoutSizingStrategy = unifyDashboardLayoutColumnHeights,
    } = props;

    const resizedLayout = layoutSizingStrategy(layout);
    const resizedColumnPosition = getResizedColumnPositions(layout, resizedLayout);

    return (
        <FluidLayout
            className={cx("gd-fluidlayout-container", "s-fluid-layout-container", "gd-dashboards", className)}
            containerClassName="gd-fluidlayout-layout s-fluid-layout"
            layout={resizedLayout}
            rowKeyGetter={rowKeyGetter}
            rowRenderer={(renderProps) =>
                rowRenderer({ ...renderProps, debug, DefaultRowRenderer: DashboardLayoutRowRenderer })
            }
            rowHeaderRenderer={(renderProps) =>
                rowHeaderRenderer({
                    ...renderProps,
                    debug,
                    DefaultRowHeaderRenderer: DashboardLayoutRowHeaderRenderer,
                })
            }
            columnKeyGetter={columnKeyGetter}
            columnRenderer={(renderProps) =>
                columnRenderer({
                    ...renderProps,
                    debug,
                    DefaultColumnRenderer: DashboardLayoutColumnRenderer,
                })
            }
            contentRenderer={(renderProps) => {
                const isResizedByLayoutSizingStrategy = resizedColumnPosition.some((position) =>
                    isEqual(position, [renderProps.column.row().index(), renderProps.column.index()]),
                );

                return contentRenderer({
                    ...renderProps,
                    debug,
                    DefaultContentRenderer: DashboardLayoutContentRenderer,
                    isResizedByLayoutSizingStrategy: isResizedByLayoutSizingStrategy,
                });
            }}
            onMouseLeave={onMouseLeave}
        />
    );
}
