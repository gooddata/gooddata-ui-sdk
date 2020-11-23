// (C) 2020 GoodData Corporation
import React from "react";
import { IFilter, areObjRefsEqual } from "@gooddata/sdk-model";
import {
    IDrillableItem,
    IErrorProps,
    IHeaderPredicate,
    ILoadingProps,
    OnError,
    OnFiredDrillEvent,
} from "@gooddata/sdk-ui";
import { KpiView } from "../KpiView";
import { InsightRenderer } from "./InsightRenderer";
import { IWidget, IWidgetAlert, IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    DashboardLayoutContentRenderer,
    IDashboardViewLayoutContent,
    IDashboardViewLayoutColumn,
    IDashboardViewLayoutRow,
} from "../DashboardLayout";
import { IFluidLayoutContentRenderer } from "../FluidLayout";

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
        onDrill,
        onError,
        workspace,
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
                    <InsightRenderer
                        insightWidget={content.widget as IWidget}
                        backend={backend}
                        workspace={workspace}
                        filters={filters}
                        drillableItems={drillableItems}
                        onDrill={onDrill}
                        onError={onError}
                        ErrorComponent={ErrorComponent}
                        LoadingComponent={LoadingComponent}
                    />
                );
            }

            const relevantAlert = alerts?.find((alert) => areObjRefsEqual(alert.widget, content.widget.ref));

            return (
                <KpiView
                    kpiWidget={content.widget as IWidget}
                    alert={relevantAlert}
                    backend={backend}
                    workspace={workspace}
                    filters={filters}
                    drillableItems={drillableItems}
                    onDrill={onDrill}
                    onError={onError}
                    ErrorComponent={ErrorComponent}
                    LoadingComponent={LoadingComponent}
                />
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
