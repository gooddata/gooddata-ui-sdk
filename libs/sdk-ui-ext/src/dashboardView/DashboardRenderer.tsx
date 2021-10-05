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
    AnalyticalWidgetType,
    isKpiWidget,
} from "@gooddata/sdk-backend-spi";
import {
    ObjRef,
    IInsight,
    insightId,
    insightUri,
    areObjRefsEqual,
    objRefToString,
} from "@gooddata/sdk-model";
import { ExplicitDrill, IErrorProps, ILoadingProps, OnError, VisType } from "@gooddata/sdk-ui";
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
    getDashboardLayoutWidgetDefaultHeight,
    DashboardLayoutBuilder,
    DashboardLayoutItemModifications,
    getDashboardLayoutItemHeight,
    getDashboardLayoutItemHeightForRatioAndScreen,
    DashboardLayoutItemsSelector,
    validateDashboardLayoutWidgetSize,
} from "../internal";
import {
    DashboardWidgetRenderer,
    IDashboardWidgetRendererProps,
} from "./DashboardWidgetRenderer/DashboardWidgetRenderer";
import { useAlerts, useUserWorkspaceSettings } from "./contexts";

interface IDashboardRendererProps {
    dashboardRef: ObjRef;
    dashboardLayout: IDashboardLayout;
    backend?: IAnalyticalBackend;
    workspace?: string;
    filters?: FilterContextItem[];
    onFiltersChange?: (filters: IDashboardFilter[]) => void;
    filterContext?: IFilterContext | ITempFilterContext;
    drillableItems?: ExplicitDrill[];
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
 * Ensure that areObjRefsEqual() and other predicates will be working with uncontrolled user ref inputs in custom layout transformation and/or custom widget/item renderers
 */
const polluteWidgetRefsWithBothIdAndUri =
    (getInsightByRef: (insightRef: ObjRef) => IInsight | undefined): DashboardLayoutItemModifications =>
    (item) =>
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

const validateItemsSize =
    (
        getInsightByRef: (insightRef: ObjRef) => IInsight | undefined,
        enableKDWidgetCustomHeight: boolean,
    ): DashboardLayoutItemModifications =>
    (item) => {
        const widget = item.facade().widget();
        if (isInsightWidget(widget)) {
            const insight = getInsightByRef(widget.insight);
            const currentWidth = item.facade().size().xl.gridWidth;
            const currentHeight = item.facade().size().xl.gridHeight;
            const { validWidth, validHeight } = validateDashboardLayoutWidgetSize(
                currentWidth,
                currentHeight,
                "insight",
                insight,
                { enableKDWidgetCustomHeight },
            );
            let validatedItem = item;
            if (currentWidth !== validWidth) {
                validatedItem = validatedItem.size({
                    xl: {
                        ...validatedItem.facade().size().xl,
                        gridWidth: validWidth,
                    },
                });
            }
            if (currentHeight !== validHeight) {
                validatedItem = validatedItem.size({
                    xl: {
                        ...validatedItem.facade().size().xl,
                        gridHeight: validHeight,
                    },
                });
            }

            return validatedItem;
        }
    };

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
    const { alerts } = useAlerts();
    const isThemeLoading = useThemeIsLoading();

    if (isThemeLoading) {
        // do not render the dashboard until you have the theme to avoid flash of un-styled content
        return <LoadingComponent />;
    }

    const userWorkspaceSettings = useUserWorkspaceSettings();

    const getWidgetAlert = (widgetRef: ObjRef) =>
        alerts?.find((alert) => areObjRefsEqual(alert.widget, widgetRef));

    const selectAllItemsWithInsights: DashboardLayoutItemsSelector = (items) =>
        items.filter((item) => item.isInsightWidgetItem());

    const commonLayoutBuilder = DashboardLayoutBuilder.for(dashboardLayout).modifySections((section) =>
        section
            .modifyItems(polluteWidgetRefsWithBothIdAndUri(getInsightByRef))
            .modifyItems(
                validateItemsSize(getInsightByRef, userWorkspaceSettings.enableKDWidgetCustomHeight),
                selectAllItemsWithInsights,
            ),
    );

    const transformedLayout = transformLayout
        ? transformLayout(commonLayoutBuilder, {
              getWidgetAlert,
              getInsight: getInsightByRef,
              filters,
          }).build()
        : commonLayoutBuilder.build();

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
                let widgetType: AnalyticalWidgetType;
                let insight: IInsight;
                let content: IInsight | ILegacyKpi;
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
                    content = insight;
                }
                if (isKpiWidget(widget)) {
                    content = widget.kpi;
                }

                const currentSize = item.size()[screen];

                const minHeight =
                    getDashboardLayoutItemHeight(currentSize) ||
                    (!currentSize.heightAsRatio
                        ? getDashboardLayoutWidgetDefaultHeight(userWorkspaceSettings, widgetType, content)
                        : undefined);
                const height =
                    currentSize.heightAsRatio && !currentSize.gridHeight
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

                const className = userWorkspaceSettings.enableKDWidgetCustomHeight
                    ? "custom-height"
                    : undefined;

                return (
                    <DefaultWidgetRenderer {...renderProps} {...computedRenderProps} className={className}>
                        {widgetRenderer ? widgetRenderer(customWidgetRendererProps) : renderedWidget}
                    </DefaultWidgetRenderer>
                );
            }}
            className={className}
            // When section headers are enabled, use default DashboardLayout rowHeaderRenderer.
            // When turned off, render nothing.
            sectionHeaderRenderer={areSectionHeadersEnabled ? undefined : () => null}
            enableCustomHeight={userWorkspaceSettings.enableKDWidgetCustomHeight}
        />
    );
});
