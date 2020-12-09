// (C) 2020 GoodData Corporation
import React from "react";
import cx from "classnames";
import { IFilter, areObjRefsEqual } from "@gooddata/sdk-model";
import {
    IDrillableItem,
    IErrorProps,
    IHeaderPredicate,
    ILoadingProps,
    OnError,
    OnFiredDrillEvent,
} from "@gooddata/sdk-ui";
import { KpiView } from "./KpiView";
import { InsightRenderer } from "./InsightRenderer";
import {
    IWidget,
    IWidgetAlert,
    IAnalyticalBackend,
    IFilterContext,
    ITempFilterContext,
} from "@gooddata/sdk-backend-spi";
import {
    DashboardLayoutContentRenderer,
    IDashboardViewLayoutContent,
    IDashboardViewLayoutColumn,
    IDashboardViewLayoutRow,
} from "../DashboardLayout";
import { IFluidLayoutContentRenderer } from "../FluidLayout";
import { DashboardItemKpi } from "../DashboardItem/DashboardItemKpi";
import { DashboardItemHeadline } from "../DashboardItem/DashboardItemHeadline";
import { DashboardItemVisualization } from "../DashboardItem/DashboardItemVisualization";
import { DashboardItem } from "../DashboardItem/DashboardItem";
import { getVisTypeCssClass } from "./utils";

export type IDashboardContentRenderer = IFluidLayoutContentRenderer<
    IDashboardViewLayoutContent,
    IDashboardViewLayoutColumn,
    IDashboardViewLayoutRow,
    {
        debug?: boolean;
        layoutContentRef?: React.RefObject<HTMLDivElement>;
        style?: React.CSSProperties;
        className?: string;
        content: IDashboardViewLayoutContent;
        alerts: IWidgetAlert[];
        backend?: IAnalyticalBackend;
        workspace?: string;
        filters?: IFilter[];
        filterContext: IFilterContext | ITempFilterContext;
        drillableItems?: Array<IDrillableItem | IHeaderPredicate>;
        onDrill?: OnFiredDrillEvent;
        ErrorComponent: React.ComponentType<IErrorProps>;
        LoadingComponent: React.ComponentType<ILoadingProps>;
        onError?: OnError;
    }
>;

export const DashboardContentRenderer: IDashboardContentRenderer = (props) => {
    const { column, columnIndex, row, rowIndex, screen, className, debug, layoutContentRef, style } = props;

    return (
        <DashboardLayoutContentRenderer
            column={column}
            columnIndex={columnIndex}
            row={row}
            rowIndex={rowIndex}
            screen={screen}
            className={className}
            layoutContentRef={layoutContentRef}
            debug={debug}
            style={style}
        >
            <DashboardWidgetRenderer {...props} />
        </DashboardLayoutContentRenderer>
    );
};

export const DashboardWidgetRenderer: IDashboardContentRenderer = (props) => {
    const {
        content,
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
        screen,
    } = props;
    switch (content.type) {
        case "rowHeader": {
            return (
                <div>
                    {content.title && <h2>{content.title}</h2>}
                    {content.description && <div>{content.description}</div>}
                </div>
            );
        }
        case "widget": {
            if (content.widget.type === "insight") {
                return (
                    <DashboardItem
                        className={cx("type-visualization", getVisTypeCssClass(content.widgetClass))}
                        screen={screen}
                    >
                        <DashboardItemVisualization
                            renderHeadline={() => <DashboardItemHeadline title={content.widget.title} />}
                        >
                            {() => (
                                <InsightRenderer
                                    insight={content.insight}
                                    insightWidget={content.widget as IWidget}
                                    backend={backend}
                                    workspace={workspace}
                                    filters={filters}
                                    filterContext={filterContext}
                                    drillableItems={drillableItems}
                                    onDrill={onDrill}
                                    onError={onError}
                                    ErrorComponent={ErrorComponent}
                                    LoadingComponent={LoadingComponent}
                                />
                            )}
                        </DashboardItemVisualization>
                    </DashboardItem>
                );
            }

            const relevantAlert = alerts?.find((alert) => areObjRefsEqual(alert.widget, content.widget.ref));

            return (
                <DashboardItem className="type-kpi" screen={screen}>
                    <DashboardItemKpi
                        renderHeadline={() => <DashboardItemHeadline title={content.widget.title} />}
                    >
                        {({ clientWidth }) => (
                            <KpiView
                                kpiWidget={content.widget as IWidget}
                                filterContext={filterContext}
                                alert={relevantAlert}
                                backend={backend}
                                workspace={workspace}
                                filters={filters}
                                drillableItems={drillableItems}
                                onDrill={onDrill}
                                onError={onError}
                                ErrorComponent={ErrorComponent}
                                LoadingComponent={LoadingComponent}
                                clientWidth={clientWidth}
                            />
                        )}
                    </DashboardItemKpi>
                </DashboardItem>
            );
        }
        case "custom": {
            throw new Error("Custom widgets are not supported");
        }
        default: {
            return <div>Unknown widget</div>;
        }
    }
};
