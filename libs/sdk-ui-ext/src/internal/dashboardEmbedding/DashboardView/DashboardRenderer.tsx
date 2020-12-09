// (C) 2020 GoodData Corporation
import React, { useCallback } from "react";
import {
    IAnalyticalBackend,
    IFilterContext,
    ITempFilterContext,
    IWidgetAlert,
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
    dashboardViewLayout: IDashboardViewLayout;
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
}

export const DashboardRenderer: React.FC<IDashboardRendererProps> = ({
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
}) => {
    const isThemeLoading = useThemeIsLoading();

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
                    filterContext={filterContext}
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

    if (isThemeLoading) {
        // do not render the dashboard until you have the theme to avoid flash of un-styled content
        return <LoadingComponent />;
    }

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
            className={className}
        />
    );
};
