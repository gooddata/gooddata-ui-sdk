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
    isFluidLayout,
    isDashboardLayoutContent,
    isInsightWidget,
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
import {
    IDashboardWidgetRenderer,
    IDashboardWidgetRenderProps,
    IWidgetPredicates,
    DashboardViewLayoutTransform,
} from "./types";
import { useAlerts } from "./DashboardAlertsContext";
import { DashboardViewLayoutBuilder } from "../DashboardLayout/builder/layout";
import { DashboardViewLayoutColumnModifications } from "../DashboardLayout/builder/interfaces";

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
    transformLayout?: DashboardViewLayoutTransform<any>;
}

/**
 * Do this to ensure areObjRefsEqual() and other predicates are working with uncontrolled user ref inputs.
 */
const polluteWidgetRefsWithBothIdAndUri = (
    getInsightByRef: (insightRef: ObjRef) => IInsight | undefined,
): DashboardViewLayoutColumnModifications<IDashboardLayoutContent> => (column) =>
    column.content((c) => {
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
    transformLayout,
}) {
    const { alerts } = useAlerts();
    const isThemeLoading = useThemeIsLoading();

    if (isThemeLoading) {
        // do not render the dashboard until you have the theme to avoid flash of un-styled content
        return <LoadingComponent />;
    }

    const getWidgetAlert = (widgetRef: ObjRef) =>
        alerts?.find((alert) => areObjRefsEqual(alert.widget, widgetRef));

    const transformedLayout = transformLayout
        ? transformLayout(
              DashboardViewLayoutBuilder.for(dashboardViewLayout).modifyRows((row) =>
                  row.modifyColumns(polluteWidgetRefsWithBothIdAndUri(getInsightByRef)),
              ),
              {
                  getWidgetAlert,
                  getInsight: getInsightByRef,
                  filters,
              },
          ).build()
        : dashboardViewLayout;

    return (
        <DashboardLayout
            layout={transformedLayout}
            columnKeyGetter={(keyGetterProps) => {
                const content = keyGetterProps.column.content();
                if (isWidget(content)) {
                    return objRefToString(content.ref);
                }
                {
                    return keyGetterProps.column.index().toString();
                }
            }}
            contentRenderer={(renderProps) => {
                const { column, screen, DefaultContentRenderer } = renderProps;
                let widgetClass: DashboardViewLayoutWidgetClass;
                let insight: IInsight;
                const content = column.content();
                if (isFluidLayout(content)) {
                    throw new UnexpectedError("Nested layouts not yet supported.");
                }

                if (isWidget(content)) {
                    widgetClass = getDashboardViewLayoutWidgetClass(content);
                }
                if (content.type === "insight") {
                    insight = getInsightByRef(content.insight);
                }

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

                const alert = isWidget(content)
                    ? alerts?.find((alert) => areObjRefsEqual(alert.widget, content.ref))
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
                    widget: isWidget(content) ? content : undefined,
                    screen,
                    alert,
                };

                const renderedWidget = isWidget(content) ? (
                    <DashboardWidgetRenderer {...widgetRenderProps} />
                ) : null;

                const predicates: IWidgetPredicates = {
                    isCustomWidget: () => !isDashboardLayoutContent(content),
                    isWidgetWithRef: (ref: ObjRef) => isWidget(content) && areObjRefsEqual(ref, content.ref),
                    isWidgetWithKpiRef: (ref: ObjRef) =>
                        isWidget(content) && content.type === "kpi" && areObjRefsEqual(ref, content.ref),
                    isWidgetWithKpiType: (comparisonType: ILegacyKpi["comparisonType"]) =>
                        isWidget(content) &&
                        content.type === "kpi" &&
                        comparisonType === content.kpi.comparisonType,
                    isWidgetWithInsightRef: (ref: ObjRef) =>
                        isWidget(content) &&
                        content.type === "insight" &&
                        areObjRefsEqual(ref, content.insight),
                    isWidgetWithInsightType: (type: VisType) =>
                        isWidget(content) && content.type === "insight" && type === widgetClass,
                };

                const commonCustomWidgetRenderProps = {
                    ErrorComponent,
                    LoadingComponent,
                    predicates,
                    widget: isWidget(content) ? content : undefined,
                    renderedWidget,
                    filters,
                    customWidget: !isDashboardLayoutContent(content) ? content : undefined,
                };

                const customWidgetRendererProps: IDashboardWidgetRenderProps = {
                    ...commonCustomWidgetRenderProps,
                    insight,
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
