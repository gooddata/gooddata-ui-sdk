// (C) 2020-2021 GoodData Corporation
import { ComponentType } from "react";
import { IErrorProps, OnError } from "@gooddata/sdk-ui";

import { IDashboardFilter, OnFiredDashboardViewDrillEvent } from "../../types";

/**
 * @alpha
 */
export interface DashboardLayoutProps {
    ErrorComponent?: React.ComponentType<IErrorProps>;
    // TODO: is this necessary? (there are events for it)
    onFiltersChange?: (filters: IDashboardFilter[]) => void;
    onDrill?: OnFiredDashboardViewDrillEvent;
    onError?: OnError;
}

/**
 * @alpha
 */
export type CustomDashboardLayoutComponent = ComponentType;
