// (C) 2020 GoodData Corporation
import React, { useMemo, useCallback } from "react";
import {
    IAnalyticalBackend,
    IDashboard,
    IWidgetAlert,
    FluidLayoutTransforms,
    isWidget,
    isWidgetDefinition,
    UnexpectedError,
} from "@gooddata/sdk-backend-spi";
import { IFilter } from "@gooddata/sdk-model";
import {
    IDrillableItem,
    IErrorProps,
    IHeaderPredicate,
    ILoadingProps,
    OnError,
    OnFiredDrillEvent,
} from "@gooddata/sdk-ui";
import { useThemeIsLoading } from "@gooddata/sdk-ui-theme-provider";
import { DashboardLayout, DashboardLayoutColumnRenderer, DashboardLayoutRowHeader } from "../DashboardLayout";
import { IDashboardViewLayout } from "../DashboardLayout/interfaces/dashboardLayout";
import { DashboardContentRenderer } from "./DashboardContentRenderer";
import { IDashboardViewLayoutColumnRenderProps } from "../DashboardLayout/interfaces/dashboardLayoutComponents";

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
    onError,
    LoadingComponent,
}) => {
    const isThemeLoading = useThemeIsLoading();
    if (isThemeLoading) {
        // do not render the dashboard until you have the theme to avoid flash of un-styled content
        return <LoadingComponent />;
    }

    // Convert current layout model to "legacy" layout model,
    // to keep it backward compatible with KD
    const emptyLayout: IDashboardViewLayout = {
        ...dashboard.layout,
        rows: [],
    };

    const layout = useMemo(
        () =>
            FluidLayoutTransforms.for(dashboard.layout).reduceColumns(
                (acc: IDashboardViewLayout, { column, columnIndex, row, rowIndex }) => {
                    if (!acc.rows[rowIndex]) {
                        acc.rows[rowIndex] = {
                            ...row,
                            columns: [],
                        };
                    }
                    const currentContent = column.content;
                    if (isWidget(currentContent) || isWidgetDefinition(currentContent)) {
                        acc.rows[rowIndex].columns[columnIndex] = {
                            ...column,
                            content: {
                                type: "widget",
                                widget: currentContent,
                            },
                        };
                    } else {
                        throw new UnexpectedError("Unknown widget");
                    }

                    return acc;
                },
                emptyLayout,
            ),
        [dashboard.layout],
    );

    const contentWithProps = useCallback(
        (props: IDashboardViewLayoutColumnRenderProps) => {
            const { column } = props;
            return (
                <DashboardContentRenderer
                    {...props}
                    content={column.content}
                    ErrorComponent={ErrorComponent}
                    LoadingComponent={LoadingComponent}
                    alerts={alerts}
                    drillableItems={drillableItems}
                    filters={filters}
                    onDrill={onDrill}
                    onError={onError}
                    workspace={workspace}
                    backend={backend}
                />
            );
        },
        [
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

    return (
        <DashboardLayout
            layout={layout}
            contentRenderer={contentWithProps}
            columnRenderer={(props) => {
                return (
                    <>
                        {props.columnIndex === 0 && props.row.header && (
                            <DashboardLayoutColumnRenderer
                                {...props}
                                column={{ size: { xl: { widthAsGridColumnsCount: 12 } } }}
                            >
                                <DashboardLayoutRowHeader
                                    title={props.row.header.title}
                                    description={props.row.header.description}
                                />
                            </DashboardLayoutColumnRenderer>
                        )}
                        <DashboardLayoutColumnRenderer {...props} />
                    </>
                );
            }}
        />
    );
};
