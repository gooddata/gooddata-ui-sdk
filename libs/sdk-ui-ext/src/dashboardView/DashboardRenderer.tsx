// (C) 2020 GoodData Corporation
import React, { memo } from "react";
import {
    FilterContextItem,
    IAnalyticalBackend,
    IFilterContext,
    ITempFilterContext,
    IWidget,
    isWidget,
    UnexpectedError,
    widgetId,
    widgetUri,
    ILegacyKpi,
    isDashboardLayout,
    isDashboardWidget,
    isInsightWidget,
    IDashboardLayout,
    widgetType as getWidgetType,
    WidgetType,
} from "@gooddata/sdk-backend-spi";
import {
    ObjRef,
    IInsight,
    insightId,
    insightUri,
    areObjRefsEqual,
    objRefToString,
} from "@gooddata/sdk-model";
import {
    IDrillableItem,
    IErrorProps,
    IHeaderPredicate,
    ILoadingProps,
    OnError,
    VisType,
} from "@gooddata/sdk-ui";
import { useThemeIsLoading } from "@gooddata/sdk-ui-theme-provider";
import {
    IDashboardFilter,
    IDashboardWidgetRenderer,
    IDashboardWidgetRenderProps,
    IWidgetPredicates,
    DashboardLayoutTransform,
    OnFiredDashboardViewDrillEvent,
} from "./types";
import {
    DashboardLayout,
    getDashboardLayoutItemHeightForRatioAndScreen,
    getDashboardLayoutWidgetDefaultHeight,
    DashboardLayoutBuilder,
    DashboardLayoutItemModifications,
    useAlertsContext,
    DashboardWidgetRenderer,
    IDashboardWidgetRendererProps,
} from "../internal/dashboardEmbedding";

interface IDashboardRendererProps {
    dashboardRef: ObjRef;
    dashboardLayout: IDashboardLayout;
    backend?: IAnalyticalBackend;
    workspace?: string;
    filters?: FilterContextItem[];
    onFiltersChange?: (filters: IDashboardFilter[]) => void;
    filterContext?: IFilterContext | ITempFilterContext;
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;
    onDrill?: OnFiredDashboardViewDrillEvent;
    ErrorComponent: React.ComponentType<IErrorProps>;
    LoadingComponent: React.ComponentType<ILoadingProps>;
    onError?: OnError;
    className?: string;
    getVisType: (widget: IWidget) => VisType;
    getInsightByRef: (insightRef: ObjRef) => IInsight | undefined;
    widgetRenderer: IDashboardWidgetRenderer;
    areSectionHeadersEnabled?: boolean;
    transformLayout?: DashboardLayoutTransform<any>;
}

/**
 * Ensure that areObjRefsEqual() and other predicates will be working with uncontrolled user ref inputs.
 */
const polluteWidgetRefsWithBothIdAndUri = (
    getInsightByRef: (insightRef: ObjRef) => IInsight | undefined,
): DashboardLayoutItemModifications => (item) =>
    item.widget((c) => {
        const updatedContent = { ...c };
        if (isWidget(updatedContent)) {
            updatedContent.ref = {
                ...updatedContent.ref,
                uri: widgetUri(updatedContent),
                identifier: widgetId(updatedContent),
            };
        }
        if (isInsightWidget(updatedContent)) {
            const insight = getInsightByRef(updatedContent.insight);
            updatedContent.insight = {
                ...updatedContent.insight,
                uri: insightUri(insight),
                identifier: insightId(insight),
            };
        }

        return updatedContent;
    });

export const DashboardRenderer: React.FC<IDashboardRendererProps> = memo(function DashboardRenderer({
    dashboardLayout,
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
    getVisType,
    getInsightByRef,
    widgetRenderer,
    areSectionHeadersEnabled,
    dashboardRef,
    transformLayout,
}) {
    const { alerts } = useAlertsContext();
    const isThemeLoading = useThemeIsLoading();

    if (isThemeLoading) {
        // do not render the dashboard until you have the theme to avoid flash of un-styled content
        return <LoadingComponent />;
    }

    const getWidgetAlert = (widgetRef: ObjRef) =>
        alerts?.find((alert) => areObjRefsEqual(alert.widget, widgetRef));

    const transformedLayout = transformLayout
        ? transformLayout(
              DashboardLayoutBuilder.for(dashboardLayout).modifySections((section) =>
                  section.modifyItems(polluteWidgetRefsWithBothIdAndUri(getInsightByRef)),
              ),
              {
                  getWidgetAlert,
                  getInsight: getInsightByRef,
                  filters,
              },
          ).build()
        : dashboardLayout;

    return (
        <DashboardLayout
            layout={transformedLayout}
            itemKeyGetter={(keyGetterProps) => {
                const widget = keyGetterProps.item.widget();
                if (isWidget(widget)) {
                    return objRefToString(widget.ref);
                }
                return keyGetterProps.item.index().toString();
            }}
            widgetRenderer={(renderProps) => {
                const { item, screen, DefaultWidgetRenderer } = renderProps;
                let visType: VisType;
                let widgetType: WidgetType;
                let insight: IInsight;
                const widget = item.widget();
                if (isDashboardLayout(widget)) {
                    throw new UnexpectedError("Nested layouts not yet supported.");
                }

                if (isWidget(widget)) {
                    visType = getVisType(widget);
                    widgetType = getWidgetType(widget);
                }
                if (isInsightWidget(widget)) {
                    insight = getInsightByRef(widget.insight);
                }

                const currentSize = item.size()[screen];
                const minHeight = !currentSize.heightAsRatio
                    ? getDashboardLayoutWidgetDefaultHeight(widgetType, visType)
                    : undefined;
                const height = currentSize?.heightAsRatio
                    ? getDashboardLayoutItemHeightForRatioAndScreen(currentSize, screen)
                    : undefined;
                const allowOverflow = !!currentSize.heightAsRatio;

                const computedRenderProps = {
                    allowOverflow,
                    minHeight,
                    height,
                };

                const alert = isWidget(widget)
                    ? alerts?.find((alert) => areObjRefsEqual(alert.widget, widget.ref))
                    : undefined;

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
                    widget: isWidget(widget) ? widget : undefined,
                    visType,
                    screen,
                    alert,
                };

                const renderedWidget = isWidget(widget) ? (
                    <DashboardWidgetRenderer {...widgetRenderProps} />
                ) : null;

                const predicates: IWidgetPredicates = {
                    isCustomWidget: () => !isDashboardWidget(widget),
                    isWidgetWithRef: (ref: ObjRef) => isWidget(widget) && areObjRefsEqual(ref, widget.ref),
                    isWidgetWithKpiRef: (ref: ObjRef) =>
                        isWidget(widget) && widget.type === "kpi" && areObjRefsEqual(ref, widget.ref),
                    isWidgetWithKpiType: (comparisonType: ILegacyKpi["comparisonType"]) =>
                        isWidget(widget) &&
                        widget.type === "kpi" &&
                        comparisonType === widget.kpi.comparisonType,
                    isWidgetWithInsightRef: (ref: ObjRef) =>
                        isWidget(widget) && widget.type === "insight" && areObjRefsEqual(ref, widget.insight),
                    isWidgetWithInsightType: (type: VisType) =>
                        isWidget(widget) && widget.type === "insight" && type === visType,
                };

                const commonCustomWidgetRenderProps = {
                    ErrorComponent,
                    LoadingComponent,
                    predicates,
                    widget: isWidget(widget) ? widget : undefined,
                    renderedWidget,
                    filters,
                    customWidget: !isDashboardWidget(widget) ? widget : undefined,
                };

                const customWidgetRendererProps: IDashboardWidgetRenderProps = {
                    ...commonCustomWidgetRenderProps,
                    insight,
                    alert,
                };

                return (
                    <DefaultWidgetRenderer {...renderProps} {...computedRenderProps}>
                        {widgetRenderer ? widgetRenderer(customWidgetRendererProps) : renderedWidget}
                    </DefaultWidgetRenderer>
                );
            }}
            className={className}
            // When section headers are enabled, use default DashboardLayout rowHeaderRenderer.
            // When turned off, render nothing.
            sectionHeaderRenderer={areSectionHeadersEnabled ? undefined : () => null}
        />
    );
});
