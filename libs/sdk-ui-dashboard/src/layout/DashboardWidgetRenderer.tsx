// (C) 2020 GoodData Corporation
import React, { CSSProperties } from "react";
import cx from "classnames";
import Measure from "react-measure";
import { areObjRefsEqual, IInsight, insightVisualizationUrl, ObjRef } from "@gooddata/sdk-model";
import {
    isWidget,
    isDashboardWidget,
    UnexpectedError,
    ScreenSize,
    IWidget,
    isDashboardLayout,
    isInsightWidget,
} from "@gooddata/sdk-backend-spi";

import { IDrillableItem, IHeaderPredicate, OnError, VisType } from "@gooddata/sdk-ui";
import { selectAlerts, selectInsights, useDashboardSelector } from "../model";
import { IDashboardFilter, OnFiredDashboardViewDrillEvent } from "../types";
import { DashboardItem, DashboardItemHeadline, DashboardItemVisualization } from "../presentationComponents";
import { DashboardInsight, DashboardKpi, DashboardKpiPropsProvider } from "../widget";

import { getVisTypeCssClass } from "./utils";
import { DashboardInsightPropsProvider } from "../widget/insight/DashboardInsightPropsContext";

const dashboardStyle: CSSProperties = { height: "100%", width: "100%" };

/**
 * @internal
 */
export type IDashboardWidgetRendererProps = {
    widget?: IWidget;
    screen: ScreenSize;
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;
    onDrill?: OnFiredDashboardViewDrillEvent;
    onError?: OnError;
    onFiltersChange?: (filters: IDashboardFilter[]) => void;
};

/**
 * @internal
 */
export const DashboardWidgetRenderer: React.FC<IDashboardWidgetRendererProps> = (props) => {
    const { onError, onFiltersChange, screen, widget } = props;
    const insights = useDashboardSelector(selectInsights);
    const alerts = useDashboardSelector(selectAlerts);

    const getInsightByRef = (insightRef: ObjRef): IInsight | undefined => {
        return insights.find((i) => areObjRefsEqual(i.insight.ref, insightRef));
    };

    const getVisType = (widget: IWidget): VisType => {
        if (widget.type === "kpi") {
            return undefined as any;
        }
        const insight = getInsightByRef(widget.insight);
        return insightVisualizationUrl(insight!).split(":")[1] as VisType;
    };

    let visType: VisType;
    let insight: IInsight;
    if (isDashboardLayout(widget)) {
        throw new UnexpectedError("Nested layouts not yet supported.");
    }

    if (isWidget(widget)) {
        visType = getVisType(widget);
    }
    if (isInsightWidget(widget)) {
        insight = getInsightByRef(widget.insight)!;
    }
    const alert = isWidget(widget)
        ? alerts?.find((alert) => areObjRefsEqual(alert.widget, widget.ref))
        : undefined;

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
                                        renderHeadline={() => (
                                            <DashboardItemHeadline
                                                title={widget.title}
                                                clientHeight={contentRect.client?.height}
                                            />
                                        )}
                                    >
                                        {() => (
                                            <DashboardInsightPropsProvider
                                                clientHeight={contentRect.client?.height}
                                                insight={insight!}
                                                widget={widget}
                                            >
                                                <DashboardInsight />
                                            </DashboardInsightPropsProvider>
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
                <DashboardKpiPropsProvider
                    kpiWidget={widget}
                    alert={alert}
                    onFiltersChange={onFiltersChange}
                    onError={onError}
                >
                    <DashboardKpi />
                </DashboardKpiPropsProvider>
            </DashboardItem>
        );
    }

    return <div>Unknown widget</div>;
};
