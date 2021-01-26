// (C) 2020 GoodData Corporation
import React from "react";
import cx from "classnames";
import { areObjRefsEqual } from "@gooddata/sdk-model";
import { isWidget } from "@gooddata/sdk-backend-spi";
import { KpiView } from "./KpiView";
import { InsightRenderer } from "./InsightRenderer";
import { DashboardItemKpi } from "../DashboardItem/DashboardItemKpi";
import { DashboardItemHeadline } from "../DashboardItem/DashboardItemHeadline";
import { DashboardItemVisualization } from "../DashboardItem/DashboardItemVisualization";
import { DashboardItem } from "../DashboardItem/DashboardItem";
import { getVisTypeCssClass } from "./utils";
import { IDashboardWidgetRenderProps } from "./types";

export const DashboardWidgetRenderer: React.FC<IDashboardWidgetRenderProps> = (props) => {
    const {
        ErrorComponent,
        LoadingComponent,
        alerts,
        backend,
        drillableItems,
        filters,
        filterContext,
        onDrill,
        onError,
        workspace,
        screen,
        widgetClass,
        insight,
        widget,
    } = props;

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

        const relevantAlert = alerts?.find((alert) => areObjRefsEqual(alert.widget, widget.ref));

        return (
            <DashboardItem className="type-kpi" screen={screen}>
                <DashboardItemKpi renderHeadline={() => <DashboardItemHeadline title={widget.title} />}>
                    {({ clientWidth }) => (
                        <KpiView
                            kpiWidget={widget}
                            filterContext={filterContext}
                            alert={relevantAlert}
                            backend={backend}
                            workspace={workspace}
                            filters={filters}
                            drillableItems={drillableItems}
                            onDrill={onDrill}
                            onError={onError}
                            ErrorComponent={ErrorComponent}
                            LoadingComponent={LoadingComponent}
                            clientWidth={clientWidth}
                        />
                    )}
                </DashboardItemKpi>
            </DashboardItem>
        );
    }

    return <div>Unknown widget</div>;
};
