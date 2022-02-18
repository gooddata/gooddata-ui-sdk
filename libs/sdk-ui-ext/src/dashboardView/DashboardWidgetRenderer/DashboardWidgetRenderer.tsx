// (C) 2020-2022 GoodData Corporation
import React, { CSSProperties } from "react";
import cx from "classnames";
import Measure from "react-measure";
import { IInsight, ObjRef } from "@gooddata/sdk-model";
import {
    isWidget,
    isDashboardWidget,
    UnexpectedError,
    IWidgetAlert,
    IAnalyticalBackend,
    IFilterContext,
    ITempFilterContext,
    ScreenSize,
    IWidget,
    FilterContextItem,
} from "@gooddata/sdk-backend-spi";
import { ExplicitDrill, IErrorProps, ILoadingProps, OnError, VisType } from "@gooddata/sdk-ui";
import { KpiView } from "./KpiView";
import { InsightRenderer } from "./InsightRenderer/InsightRenderer";
import { DashboardItem, DashboardItemHeadline, DashboardItemVisualization } from "../../internal";
import { getVisTypeCssClass } from "./utils";
import { IDashboardFilter, OnFiredDashboardViewDrillEvent } from "../types";

const dashboardStyle: CSSProperties = { height: "100%", width: "100%" };

export type IDashboardWidgetRendererProps = {
    backend?: IAnalyticalBackend;
    workspace?: string;
    filters?: FilterContextItem[];
    filterContext: IFilterContext | ITempFilterContext;
    drillableItems?: ExplicitDrill[];
    onDrill?: OnFiredDashboardViewDrillEvent;
    ErrorComponent: React.ComponentType<IErrorProps>;
    LoadingComponent: React.ComponentType<ILoadingProps>;
    onError?: OnError;
    visType?: VisType;
    insight?: IInsight;
    widget?: IWidget;
    screen: ScreenSize;
    dashboardRef: ObjRef;
    alert?: IWidgetAlert;
    onFiltersChange?: (filters: IDashboardFilter[]) => void;
};

export const DashboardWidgetRenderer: React.FC<IDashboardWidgetRendererProps> = (props) => {
    const {
        ErrorComponent,
        LoadingComponent,
        backend,
        drillableItems,
        filters,
        onFiltersChange,
        filterContext,
        onDrill,
        onError,
        workspace,
        visType,
        insight,
        screen,
        widget,
        alert,
        dashboardRef,
    } = props;

    if (!isDashboardWidget) {
        throw new UnexpectedError(
            "Cannot render custom widget with DefaultWidgetRenderer! Please handle custom widget rendering in your widgetRenderer.",
        );
    }

    if (isWidget(widget)) {
        if (widget.type === "insight") {
            return (
                <Measure client>
                    {({ measureRef, contentRect }) => {
                        return (
                            <div style={dashboardStyle} ref={measureRef}>
                                <DashboardItem
                                    className={cx(
                                        "type-visualization",
                                        "gd-dashboard-view-widget",
                                        getVisTypeCssClass(widget.type, visType),
                                    )}
                                    screen={screen}
                                >
                                    <DashboardItemVisualization
                                        renderHeadline={() =>
                                            !widget.configuration.hideTitle && (
                                                <DashboardItemHeadline
                                                    title={widget.title}
                                                    clientHeight={contentRect.client?.height}
                                                />
                                            )
                                        }
                                    >
                                        {() => (
                                            <InsightRenderer
                                                clientHeight={contentRect.client?.height}
                                                insight={insight}
                                                insightWidget={widget}
                                                backend={backend}
                                                workspace={workspace}
                                                filters={filters}
                                                filterContext={filterContext}
                                                drillableItems={drillableItems}
                                                onDrill={onDrill}
                                                onError={onError}
                                                ErrorComponent={ErrorComponent}
                                                LoadingComponent={LoadingComponent}
                                            />
                                        )}
                                    </DashboardItemVisualization>
                                </DashboardItem>
                            </div>
                        );
                    }}
                </Measure>
            );
        }

        return (
            <DashboardItem className="type-kpi" screen={screen}>
                <KpiView
                    dashboardRef={dashboardRef}
                    kpiWidget={widget}
                    filterContext={filterContext}
                    alert={alert}
                    backend={backend}
                    workspace={workspace}
                    filters={filters}
                    onFiltersChange={onFiltersChange}
                    drillableItems={drillableItems}
                    onDrill={onDrill}
                    onError={onError}
                    ErrorComponent={ErrorComponent}
                    LoadingComponent={LoadingComponent}
                />
            </DashboardItem>
        );
    }

    return <div>Unknown widget</div>;
};
