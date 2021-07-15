// (C) 2020-2021 GoodData Corporation
import { ComponentType } from "react";
import { IAnalyticalBackend, IWidget, ScreenSize } from "@gooddata/sdk-backend-spi";
import { IDrillableItem, IErrorProps, IHeaderPredicate, ILoadingProps, OnError } from "@gooddata/sdk-ui";

import { IDashboardFilter, OnFiredDashboardViewDrillEvent } from "../../types";

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
