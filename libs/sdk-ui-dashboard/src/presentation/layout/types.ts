// (C) 2020-2022 GoodData Corporation
import { ComponentType } from "react";
import { IErrorProps, OnError } from "@gooddata/sdk-ui";
import { FilterContextItem } from "@gooddata/sdk-model";

import { IDashboardFilter, OnFiredDashboardDrillEvent } from "../../types.js";

/**
 * @alpha
 */
export interface IDashboardLayoutProps {
    ErrorComponent?: React.ComponentType<IErrorProps>;
    // TODO: is this necessary? (there are events for it)
    onFiltersChange?: (filters: (IDashboardFilter | FilterContextItem)[], resetOthers?: boolean) => void;
    onDrill?: OnFiredDashboardDrillEvent;
    onError?: OnError;
}

/**
 * @alpha
 */
export type CustomDashboardLayoutComponent = ComponentType<IDashboardLayoutProps>;

/**
 * @internal
 */
export type CustomEmptyLayoutDropZoneBodyComponent = ComponentType;
