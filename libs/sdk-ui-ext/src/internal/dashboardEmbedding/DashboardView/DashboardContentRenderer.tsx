// (C) 2020 GoodData Corporation
import React from "react";
import { isWidget, UnexpectedError } from "@gooddata/sdk-backend-spi";
import {
    getDashboardLayoutContentHeightForRatioAndScreen,
    getDashboardLayoutMinimumWidgetHeight,
} from "../DashboardLayout";
import { DashboardWidgetRenderer } from "./DashboardWidgetRenderer";
import { IDashboardContentRenderProps } from "./types";

export const DashboardContentRenderer: React.FC<IDashboardContentRenderProps> = (props) => {
    const {
        column,
        screen,
        className,
        debug,
        contentRef,
        DefaultContentRenderer,
        isResizedByLayoutSizingStrategy,
        widgetClass,
        widgetRenderer,
        insight,
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
    } = props;

    const content = column.content();

    if (!isWidget(content)) {
        throw new UnexpectedError("Custom dashboard view content is not yet supported.");
    }

    const currentSize = column.size()[screen];
    const minHeight = !currentSize.heightAsRatio
        ? getDashboardLayoutMinimumWidgetHeight(widgetClass)
        : undefined;
    const height = currentSize?.heightAsRatio
        ? getDashboardLayoutContentHeightForRatioAndScreen(currentSize, screen)
        : undefined;

    return widgetRenderer ? (
        widgetRenderer({
            column,
            ErrorComponent,
            LoadingComponent,
            alerts,
            filterContext,
            screen,
            backend,
            drillableItems,
            filters,
            insight,
            onDrill,
            onError,
            widgetClass,
            workspace,
            minHeight,
            height,
            widget: content,
            DefaultWidgetRenderer: DashboardWidgetRenderer,
        })
    ) : (
        <DefaultContentRenderer
            {...{
                DefaultContentRenderer,
                column,
                screen,
                className,
                contentRef,
                debug,
                height,
                minHeight,
                isResizedByLayoutSizingStrategy,
                allowOverflow: !!currentSize.heightAsRatio,
            }}
        >
            <DashboardWidgetRenderer
                {...props}
                DefaultWidgetRenderer={DashboardWidgetRenderer}
                widget={content}
            />
        </DefaultContentRenderer>
    );
};
