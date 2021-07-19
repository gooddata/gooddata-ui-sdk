// (C) 2020 GoodData Corporation
import React from "react";
import cx from "classnames";
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

import { selectAlerts, selectInsights, useDashboardSelector } from "../../../model";
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
                <DashboardItem
                    className={cx(
                        "type-visualization",
                        "gd-dashboard-view-widget",
                        getVisTypeCssClass(widget.type, visType!),
                    )}
                    screen={screen}
                >
                    <DashboardItemVisualization
                        renderHeadline={(clientHeight) => (
                            <DashboardItemHeadline title={widget.title} clientHeight={clientHeight} />
                        )}
                    >
                        {({ clientHeight }) => (
                            <DashboardInsightPropsProvider
                                clientHeight={clientHeight}
                                insight={insight!}
                                widget={widget}
                            >
                                <DashboardInsight />
                            </DashboardInsightPropsProvider>
                        )}
                    </DashboardItemVisualization>
                </DashboardItem>
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
