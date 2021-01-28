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
        DefaultRenderer,
        isResizedByLayoutSizingStrategy,
        widgetClass,
        widgetRenderer: WidgetRenderer,
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

    // TODO: RAIL-2869
    const currentSize = column.size()[screen];
    const minHeight = getDashboardLayoutMinimumWidgetHeight(widgetClass);
    const height = currentSize && getDashboardLayoutContentHeightForRatioAndScreen(currentSize, screen);

    return WidgetRenderer ? (
        <WidgetRenderer
            column={column}
            ErrorComponent={ErrorComponent}
            LoadingComponent={LoadingComponent}
            alerts={alerts}
            filterContext={filterContext}
            screen={screen}
            widget={content}
            backend={backend}
            drillableItems={drillableItems}
            filters={filters}
            insight={insight}
            onDrill={onDrill}
            onError={onError}
            widgetClass={widgetClass}
            workspace={workspace}
            DefaultRenderer={WidgetRenderer}
            // TODO: RAIL-2869 Unify props for DefaultRenderer & WidgetRenderer
            minHeight={minHeight}
            height={height}
        />
    ) : (
        <DefaultRenderer
            DefaultRenderer={DefaultRenderer}
            column={column}
            screen={screen}
            className={className}
            contentRef={contentRef}
            debug={debug}
            // TODO: RAIL-2869 how to solve it inside DashboardViewLayoutContentRenderer?
            height={currentSize.heightAsRatio ? height : undefined}
            minHeight={!currentSize.heightAsRatio ? minHeight : undefined}
            allowOverflow={!!currentSize.heightAsRatio}
            isResizedByLayoutSizingStrategy={isResizedByLayoutSizingStrategy}
        >
            <DashboardWidgetRenderer {...props} DefaultRenderer={DashboardWidgetRenderer} widget={content} />
        </DefaultRenderer>
    );
};
