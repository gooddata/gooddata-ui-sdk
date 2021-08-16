// (C) 2020-2021 GoodData Corporation
import { ComponentType } from "react";
import { FilterContextItem } from "@gooddata/sdk-backend-spi";
import { IDrillableItem, IErrorProps, IHeaderPredicate, OnError } from "@gooddata/sdk-ui";

import { IDashboardFilter, OnFiredDashboardViewDrillEvent } from "../../types";

/**
 * @alpha
 */
export interface DashboardLayoutProps {
    ErrorComponent?: React.ComponentType<IErrorProps>;
    // TODO: connect to filter bar
    filters?: FilterContextItem[];
    // TODO: create context for drillableItems / put it to store ?
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;
    onFiltersChange?: (filters: IDashboardFilter[]) => void;
    onDrill?: OnFiredDashboardViewDrillEvent;
    onError?: OnError;
}

/**
 * @alpha
 */
export type CustomDashboardLayoutComponent = ComponentType;
