// (C) 2020 GoodData Corporation
import React from "react";
import cx from "classnames";
import { IInsight, ObjRef } from "@gooddata/sdk-model";
import {
    isWidget,
    isDashboardLayoutContent,
    UnexpectedError,
    IWidgetAlert,
    IAnalyticalBackend,
    IFilterContext,
    ITempFilterContext,
    ResponsiveScreenType,
    IWidget,
    FilterContextItem,
} from "@gooddata/sdk-backend-spi";
import {
    IDrillableItem,
    IHeaderPredicate,
    OnFiredDrillEvent,
    IErrorProps,
    ILoadingProps,
    OnError,
} from "@gooddata/sdk-ui";
import { KpiView } from "./KpiView";
import { InsightRenderer } from "./InsightRenderer/InsightRenderer";
import { DashboardItemHeadline } from "../DashboardItem/DashboardItemHeadline";
import { DashboardItemVisualization } from "../DashboardItem/DashboardItemVisualization";
import { DashboardItem } from "../DashboardItem/DashboardItem";
import { getVisTypeCssClass } from "./utils";
import { DashboardViewLayoutWidgetClass } from "../DashboardLayout";
import { IDashboardFilter } from "../types";

export type IDashboardWidgetRendererProps = {
    backend?: IAnalyticalBackend;
    workspace?: string;
    filters?: FilterContextItem[];
    filterContext: IFilterContext | ITempFilterContext;
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;
    onDrill?: OnFiredDrillEvent;
    ErrorComponent: React.ComponentType<IErrorProps>;
    LoadingComponent: React.ComponentType<ILoadingProps>;
    onError?: OnError;
    widgetClass?: DashboardViewLayoutWidgetClass;
    insight?: IInsight;
    widget?: IWidget;
    screen: ResponsiveScreenType;
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
        widgetClass,
        insight,
        screen,
        widget,
        alert,
        dashboardRef,
    } = props;

    if (!isDashboardLayoutContent) {
        throw new UnexpectedError(
            "Cannot render custom widget with DefaultWidgetRenderer! Please handle custom widget rendering in your widgetRenderer.",
        );
    }

    if (isWidget(widget)) {
        if (widget.type === "insight") {
            return (
                <DashboardItem
                    className={cx(
                        "type-visualization",
                        "gd-dashboard-view-widget",
                        getVisTypeCssClass(widgetClass),
                    )}
                    screen={screen}
                >
                    <DashboardItemVisualization
                        renderHeadline={() => <DashboardItemHeadline title={widget.title} />}
                    >
                        {() => (
                            <InsightRenderer
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
