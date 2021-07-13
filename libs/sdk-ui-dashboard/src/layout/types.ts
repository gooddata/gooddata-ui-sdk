// (C) 2020-2021 GoodData Corporation
import { ComponentType } from "react";
import { FilterContextItem, IAnalyticalBackend, IWidget, ScreenSize } from "@gooddata/sdk-backend-spi";
import { IDrillableItem, IErrorProps, IHeaderPredicate, ILoadingProps, OnError } from "@gooddata/sdk-ui";
import { IDashboardFilter, OnFiredDashboardViewDrillEvent } from "../types";

/**
 * @internal
 */
export interface DashboardLayoutProps {
    ErrorComponent?: React.ComponentType<IErrorProps>;
    // TODO: connect to filter bar
    filters?: FilterContextItem[];
    // TODO: create context for drillableItems / put it to store ?
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;
    // TODO: replace with relevant commands
    onFiltersChange?: (filters: IDashboardFilter[]) => void;
    onDrill?: OnFiredDashboardViewDrillEvent;
    onError?: OnError;
}

/**
 * @internal
 */
export interface DashboardWidgetProps {
    widget?: IWidget;
    screen: ScreenSize;

    backend?: IAnalyticalBackend;
    workspace?: string;

    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;
    onDrill?: OnFiredDashboardViewDrillEvent;

    onError?: OnError;
    onFiltersChange?: (filters: IDashboardFilter[]) => void;

    ErrorComponent?: ComponentType<IErrorProps>;
    LoadingComponent?: ComponentType<ILoadingProps>;
}

///
/// Custom component types
///

/**
 * @internal
 */
export type CustomDashboardWidgetComponent = ComponentType;
