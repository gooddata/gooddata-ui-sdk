// (C) 2020 GoodData Corporation
import React, { CSSProperties } from "react";
import cx from "classnames";
import Measure from "react-measure";
import { areObjRefsEqual, IInsight, insightVisualizationUrl, ObjRef } from "@gooddata/sdk-model";
import {
    isWidget,
    isDashboardWidget,
    UnexpectedError,
    IWidget,
    isDashboardLayout,
    isInsightWidget,
} from "@gooddata/sdk-backend-spi";
import { VisType } from "@gooddata/sdk-ui";

import { selectAlerts, selectInsights, useDashboardSelector } from "../../model";
import {
    DashboardItem,
    DashboardItemHeadline,
    DashboardItemVisualization,
    getVisTypeCssClass,
} from "../../presentationComponents";

import { DashboardWidgetProps } from "./types";
import { DashboardWidgetPropsProvider, useDashboardWidgetProps } from "./DashboardWidgetPropsContext";
import { DashboardInsightPropsProvider } from "../insight/DashboardInsightPropsContext";
import { DashboardInsight } from "../insight/DashboardInsight";
import { DashboardKpiPropsProvider } from "../kpi/DashboardKpiPropsContext";
import { DashboardKpi } from "../kpi/DashboardKpi";

const dashboardStyle: CSSProperties = { height: "100%", width: "100%" };

/**
 * @internal
 */
export const DefaultDashboardWidgetInner = (): JSX.Element => {
    const { onError, onFiltersChange, screen, widget } = useDashboardWidgetProps();
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

/**
 * @internal
 */
export const DefaultDashboardWidget = (props: DashboardWidgetProps): JSX.Element => {
    return (
        <DashboardWidgetPropsProvider {...props}>
            <DefaultDashboardWidgetInner />
        </DashboardWidgetPropsProvider>
    );
};
