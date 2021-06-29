// (C) 2007-2021 GoodData Corporation

import { DrillDefinition } from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import {
    IAbsoluteDateFilter,
    IRelativeDateFilter,
    IPositiveAttributeFilter,
    INegativeAttributeFilter,
} from "@gooddata/sdk-model";
import { OnFiredDrillEvent, IDrillEvent } from "@gooddata/sdk-ui";

/**
 * Supported dashboard filter type.
 * @beta
 */
export type IDashboardFilter =
    | IAbsoluteDateFilter
    | IRelativeDateFilter
    | IPositiveAttributeFilter
    | INegativeAttributeFilter;

/**
 * Information about the DrillDown interaction - the attribute that is next in the drill down hierarchy.
 * @beta
 */
export interface IDrillDownDefinition {
    type: "drillDown";
    target: ObjRef;
}

/**
 * A {@link @gooddata/sdk-ui#IDrillEvent} with added information about the drill event specific to the DashboardView context.
 * @beta
 */
export interface IDashboardDrillEvent extends IDrillEvent {
    /**
     * All the drilling interactions set in KPI dashboards that are relevant to the given drill event (including drill downs).
     */
    drillDefinitions?: Array<DrillDefinition | IDrillDownDefinition>;

    /**
     * Reference to the widget that triggered the drill event.
     */
    widgetRef?: ObjRef;
}

/**
 * Callback called when a drill event occurs.
 * @beta
 */
export type OnFiredDashboardViewDrillEvent = (event: IDashboardDrillEvent) => ReturnType<OnFiredDrillEvent>;
