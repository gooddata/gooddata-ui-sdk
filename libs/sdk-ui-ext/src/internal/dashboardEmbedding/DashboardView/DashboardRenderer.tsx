// (C) 2020 GoodData Corporation
import React from "react";
import { IAnalyticalBackend, IDashboard, isLayoutWidget, isSectionHeader } from "@gooddata/sdk-backend-spi";
import { IFilter } from "@gooddata/sdk-model";
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

interface IDashboardRendererProps {
    dashboard: IDashboard;
    backend?: IAnalyticalBackend;
    workspace?: string;
    filters?: IFilter[];
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;
    onDrill?: OnFiredDrillEvent;
    ErrorComponent: React.ComponentType<IErrorProps>;
    LoadingComponent: React.ComponentType<ILoadingProps>;
    onError?: OnError;
}

export const DashboardRenderer: React.FC<IDashboardRendererProps> = ({
    dashboard,
    filters,
    backend,
    workspace,
    drillableItems,
    onDrill,
    ErrorComponent,
    LoadingComponent,
    onError,
}) => {
    return (
        <>
            {dashboard.layout.fluidLayout.rows.map((row, rowIndex) => {
                return (
                    <div key={rowIndex}>
                        {row.header && (
                            <div>
                                {isSectionHeader(row.header) && <h2>{row.header.title}</h2>}
                                {!!row.header?.description && <div>{row.header.description}</div>}
                            </div>
                        )}
                        {row.columns.map((column, columnIndex) => {
                            return (
                                <div key={columnIndex}>
                                    {isLayoutWidget(column.content) ? (
                                        column.content.widget.type === "insight" ? (
                                            <InsightRenderer
                                                insightWidget={column.content.widget}
                                                backend={backend}
                                                workspace={workspace}
                                                filters={filters}
                                                drillableItems={drillableItems}
                                                onDrill={onDrill}
                                                onError={onError}
                                                ErrorComponent={ErrorComponent}
                                                LoadingComponent={LoadingComponent}
                                            />
                                        ) : (
                                            <KpiView
                                                kpiWidget={column.content.widget}
                                                backend={backend}
                                                workspace={workspace}
                                                filters={filters}
                                                drillableItems={drillableItems}
                                                onDrill={onDrill}
                                                onError={onError}
                                                ErrorComponent={ErrorComponent}
                                                LoadingComponent={LoadingComponent}
                                            />
                                        )
                                    ) : (
                                        "Not a widget"
                                    )}
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </>
    );
};
