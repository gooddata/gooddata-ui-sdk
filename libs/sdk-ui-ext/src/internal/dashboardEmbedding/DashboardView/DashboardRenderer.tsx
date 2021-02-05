// (C) 2020 GoodData Corporation
import React, { memo } from "react";
import {
    FilterContextItem,
    IAnalyticalBackend,
    IFilterContext,
    ITempFilterContext,
    IWidget,
    isWidget,
    IDashboardLayoutContent,
    UnexpectedError,
    widgetId,
    widgetUri,
    ILegacyKpi,
} from "@gooddata/sdk-backend-spi";
import { ObjRef, IInsight, insightId, insightUri, areObjRefsEqual } from "@gooddata/sdk-model";
import {
    IDrillableItem,
    IErrorProps,
    IHeaderPredicate,
    ILoadingProps,
    OnError,
    OnFiredDrillEvent,
    VisType,
} from "@gooddata/sdk-ui";
import { useThemeIsLoading } from "@gooddata/sdk-ui-theme-provider";
import {
    DashboardLayout,
    DashboardViewLayoutWidgetClass,
    getDashboardLayoutContentHeightForRatioAndScreen,
    getDashboardLayoutMinimumWidgetHeight,
} from "../DashboardLayout";
import { IDashboardViewLayout } from "../DashboardLayout/interfaces/dashboardLayout";
import { IDashboardFilter } from "../types";
import { DashboardWidgetRenderer, IDashboardWidgetRendererProps } from "./DashboardWidgetRenderer";
import { IDashboardWidgetRenderer, IDashboardWidgetRenderProps, IWidgetPredicates } from "./types";
import { useAlerts } from "./DashboardAlertsContext";

interface IDashboardRendererProps {
    dashboardRef: ObjRef;
    dashboardViewLayout: IDashboardViewLayout<IDashboardLayoutContent>;
    backend?: IAnalyticalBackend;
    workspace?: string;
    filters?: FilterContextItem[];
    onFiltersChange?: (filters: IDashboardFilter[]) => void;
    filterContext?: IFilterContext | ITempFilterContext;
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;
    onDrill?: OnFiredDrillEvent;
    ErrorComponent: React.ComponentType<IErrorProps>;
    LoadingComponent: React.ComponentType<ILoadingProps>;
    onError?: OnError;
    className?: string;
    getDashboardViewLayoutWidgetClass: (widget: IWidget) => DashboardViewLayoutWidgetClass;
    getInsightByRef: (insightRef: ObjRef) => IInsight | undefined;
    widgetRenderer: IDashboardWidgetRenderer;
    areSectionHeadersEnabled?: boolean;
}

export const DashboardRenderer: React.FC<IDashboardRendererProps> = memo(function DashboardRenderer({
    dashboardViewLayout,
    filters,
    onFiltersChange,
    filterContext,
    backend,
    workspace,
    drillableItems,
    onDrill,
    ErrorComponent,
    onError,
    LoadingComponent,
    className,
    getDashboardViewLayoutWidgetClass,
    getInsightByRef,
    widgetRenderer,
    areSectionHeadersEnabled,
    dashboardRef,
}) {
    const { alerts } = useAlerts();
    const isThemeLoading = useThemeIsLoading();

    if (isThemeLoading) {
        // do not render the dashboard until you have the theme to avoid flash of un-styled content
        return <LoadingComponent />;
    }

    return (
        <DashboardLayout
            layout={dashboardViewLayout}
            contentRenderer={(renderProps) => {
                const { column, screen, DefaultContentRenderer } = renderProps;
                let widgetClass: DashboardViewLayoutWidgetClass;
                let insight: IInsight;
                const content = column.content();

                if (!isWidget(content)) {
                    throw new UnexpectedError("Custom dashboard view content is not yet supported.");
                }

                if (isWidget(content)) {
                    widgetClass = getDashboardViewLayoutWidgetClass(content);
                }
                if (content.type === "insight") {
                    insight = getInsightByRef(content.insight);
                }

                const alert = alerts?.find((alert) => areObjRefsEqual(alert.widget, content.ref));

                const currentSize = column.size()[screen];
                const minHeight = !currentSize.heightAsRatio
                    ? getDashboardLayoutMinimumWidgetHeight(widgetClass)
                    : undefined;
                const height = currentSize?.heightAsRatio
                    ? getDashboardLayoutContentHeightForRatioAndScreen(currentSize, screen)
                    : undefined;
                const allowOverflow = !!currentSize.heightAsRatio;

                const computedRenderProps = {
                    allowOverflow,
                    minHeight,
                    height,
                };

                const widgetRenderProps: IDashboardWidgetRendererProps = {
                    insight,
                    dashboardRef,
                    ErrorComponent,
                    LoadingComponent,
                    drillableItems,
                    filters,
                    onFiltersChange,
                    filterContext,
                    onDrill,
                    onError,
                    workspace,
                    backend,
                    widget: content,
                    screen,
                    alert,
                };

                const renderedWidget = <DashboardWidgetRenderer {...widgetRenderProps} />;

                const predicates: IWidgetPredicates = {
                    isWidgetWithRef: (ref: ObjRef) =>
                        areObjRefsEqual(ref, { identifier: widgetId(content), uri: widgetUri(content) }),
                    isWidgetWithKpiRef: (ref: ObjRef) =>
                        content.type === "kpi" &&
                        areObjRefsEqual(ref, { identifier: widgetId(content), uri: widgetUri(content) }),
                    isWidgetWithKpiType: (comparisonType: ILegacyKpi["comparisonType"]) =>
                        content.type === "kpi" && comparisonType === content.kpi.comparisonType,
                    isWidgetWithInsightRef: (ref: ObjRef) =>
                        content.type === "insight" &&
                        areObjRefsEqual(ref, { identifier: insightId(insight), uri: insightUri(insight) }),
                    isWidgetWithInsightType: (type: VisType) =>
                        content.type === "insight" && type === widgetClass,
                };

                const commonCustomWidgetRenderProps = {
                    ErrorComponent,
                    LoadingComponent,
                    predicates,
                    widget: content,
                    renderedWidget,
                    filters,
                };

                const customWidgetRendererProps: IDashboardWidgetRenderProps =
                    content.type === "insight"
                        ? {
                              ...commonCustomWidgetRenderProps,
                              insight,
                          }
                        : {
                              ...commonCustomWidgetRenderProps,
                              alert,
                          };

                return (
                    <DefaultContentRenderer {...renderProps} {...computedRenderProps}>
                        {widgetRenderer ? widgetRenderer(customWidgetRendererProps) : renderedWidget}
                    </DefaultContentRenderer>
                );
            }}
            className={className}
            // When section headers are enabled, use default DashboardLayout rowHeaderRenderer.
            // When turned off, render nothing.
            rowHeaderRenderer={areSectionHeadersEnabled ? undefined : () => null}
        />
    );
});
