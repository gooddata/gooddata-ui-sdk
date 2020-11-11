// (C) 2020 GoodData Corporation
import React from "react";
import {
    IAnalyticalBackend,
    IDashboard,
    isLayoutWidget,
    isSectionHeader,
    IWidgetAlert,
} from "@gooddata/sdk-backend-spi";
import { areObjRefsEqual, IFilter } from "@gooddata/sdk-model";
import {
    IDrillableItem,
    IErrorProps,
    IHeaderPredicate,
    ILoadingProps,
    OnError,
    OnFiredDrillEvent,
} from "@gooddata/sdk-ui";
import { useThemeIsLoading } from "@gooddata/sdk-ui-theme-provider";
import { KpiView } from "../KpiView";
import { InsightRenderer } from "./InsightRenderer";

interface IDashboardRendererProps {
    dashboard: IDashboard;
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

export const DashboardRenderer: React.FC<IDashboardRendererProps> = ({
    dashboard,
    alerts,
    filters,
    backend,
    workspace,
    drillableItems,
    onDrill,
    ErrorComponent,
    LoadingComponent,
    onError,
}) => {
    const isThemeLoading = useThemeIsLoading();
    if (isThemeLoading) {
        // do not render the dashboard until you have the theme to avoid flash of un-styled content
        return <LoadingComponent />;
    }

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
                            if (!isLayoutWidget(column.content)) {
                                return <div key={columnIndex}>Not a widget</div>;
                            }

                            const { widget } = column.content;

                            if (widget.type === "insight") {
                                return (
                                    <InsightRenderer
                                        key={widget.identifier}
                                        insightWidget={widget}
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

                            const relevantAlert = alerts?.find((alert) =>
                                areObjRefsEqual(alert.widget, widget),
                            );

                            return (
                                <KpiView
                                    key={widget.identifier}
                                    kpiWidget={column.content.widget}
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
                        })}
                    </div>
                );
            })}
        </>
    );
};
