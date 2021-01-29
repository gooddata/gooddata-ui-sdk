// (C) 2020 GoodData Corporation
import React, { memo } from "react";
import {
    IAnalyticalBackend,
    IFilterContext,
    ITempFilterContext,
    IWidget,
    isWidget,
    IDashboardLayoutContent,
    UnexpectedError,
} from "@gooddata/sdk-backend-spi";
import { IFilter, ObjRef, IInsight } from "@gooddata/sdk-model";
import {
    IDrillableItem,
    IErrorProps,
    IHeaderPredicate,
    ILoadingProps,
    OnError,
    OnFiredDrillEvent,
} from "@gooddata/sdk-ui";
import { useThemeIsLoading } from "@gooddata/sdk-ui-theme-provider";
import {
    DashboardLayout,
    DashboardViewLayoutWidgetClass,
    getDashboardLayoutContentHeightForRatioAndScreen,
    getDashboardLayoutMinimumWidgetHeight,
} from "../DashboardLayout";
import { IDashboardViewLayout } from "../DashboardLayout/interfaces/dashboardLayout";
import { IDashboardWidgetRenderer, IDashboardWidgetRenderProps } from "./types";
import { DashboardWidgetRenderer } from "./DashboardWidgetRenderer";

interface IDashboardRendererProps {
    dashboardRef: ObjRef;
    dashboardViewLayout: IDashboardViewLayout<IDashboardLayoutContent>;
    backend?: IAnalyticalBackend;
    workspace?: string;
    filters?: IFilter[];
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

                const widgetRenderProps: IDashboardWidgetRenderProps = {
                    ...renderProps,
                    ...computedRenderProps,
                    widgetClass,
                    insight,
                    dashboardRef,
                    ErrorComponent,
                    LoadingComponent,
                    drillableItems,
                    filters,
                    filterContext,
                    onDrill,
                    onError,
                    workspace,
                    backend,
                    widget: content,
                    DefaultWidgetRenderer: DashboardWidgetRenderer,
                };

                return (
                    <DefaultContentRenderer {...renderProps} {...computedRenderProps}>
                        {widgetRenderer ? (
                            widgetRenderer(widgetRenderProps)
                        ) : (
                            <DashboardWidgetRenderer {...widgetRenderProps} />
                        )}
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
