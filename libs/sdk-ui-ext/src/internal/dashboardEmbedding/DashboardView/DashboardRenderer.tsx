// (C) 2020 GoodData Corporation
import React, { useCallback } from "react";
import { IAnalyticalBackend, IWidgetAlert } from "@gooddata/sdk-backend-spi";
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
    dashboardViewLayout: IDashboardViewLayout;
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
    dashboardViewLayout,
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
            layout={dashboardViewLayout}
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
