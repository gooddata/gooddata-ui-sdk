// (C) 2020 GoodData Corporation
import React, { memo, useCallback } from "react";
import {
    IAnalyticalBackend,
    IFilterContext,
    ITempFilterContext,
    IWidgetAlert,
    IDashboardLayoutContent,
    IWidget,
    isWidget,
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
import { DashboardLayout, DashboardViewLayoutWidgetClass } from "../DashboardLayout";
import { IDashboardViewLayout } from "../DashboardLayout/interfaces/dashboardLayout";
import { DashboardContentRenderer } from "./DashboardContentRenderer";
import { IDashboardViewLayoutContentRenderProps } from "../DashboardLayout/interfaces/dashboardLayoutComponents";
import { IDashboardWidgetRenderer } from "./types";

interface IDashboardRendererProps {
    dashboardViewLayout: IDashboardViewLayout<IDashboardLayoutContent>;
    alerts: IWidgetAlert[];
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
}

export const DashboardRenderer: React.FC<IDashboardRendererProps> = memo(function DashboardRenderer({
    dashboardViewLayout,
    alerts,
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
}) {
    const isThemeLoading = useThemeIsLoading();

    const contentWithProps = useCallback(
        (props: IDashboardViewLayoutContentRenderProps<IDashboardLayoutContent>) => {
            const { column } = props;
            let widgetClass: DashboardViewLayoutWidgetClass;
            let insight: IInsight;
            const content = column.content();
            if (isWidget(content)) {
                widgetClass = getDashboardViewLayoutWidgetClass(content);
            }
            if (content.type === "insight") {
                insight = getInsightByRef(content.insight);
            }

            return (
                <DashboardContentRenderer
                    {...props}
                    widgetClass={widgetClass}
                    insight={insight}
                    ErrorComponent={ErrorComponent}
                    LoadingComponent={LoadingComponent}
                    alerts={alerts}
                    drillableItems={drillableItems}
                    filters={filters}
                    filterContext={filterContext}
                    onDrill={onDrill}
                    onError={onError}
                    workspace={workspace}
                    backend={backend}
                    widgetRenderer={widgetRenderer}
                />
            );
        },
        [
            widgetRenderer,
            ErrorComponent,
            LoadingComponent,
            alerts,
            backend,
            drillableItems,
            filters,
            onDrill,
            onError,
            workspace,
        ],
    );

    if (isThemeLoading) {
        // do not render the dashboard until you have the theme to avoid flash of un-styled content
        return <LoadingComponent />;
    }

    return (
        <DashboardLayout
            layout={dashboardViewLayout}
            contentRenderer={contentWithProps}
            className={className}
        />
    );
});
