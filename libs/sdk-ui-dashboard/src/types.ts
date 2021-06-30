// (C) 2007-2021 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { DrillDefinition } from "@gooddata/sdk-backend-spi";
import { LocalIdRef, ObjRef } from "@gooddata/sdk-model";
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

/**
 * Implicit drill down context
 *
 * @alpha
 */
export interface IDrillDownContext {
    drillDefinition: IDrillDownDefinition;
    event: IDrillEvent;
}

/**
 * Information about the DrillDown interaction - the attribute that is next in the drill down hierarchy.
 * @beta
 */
export interface IDrillDownDefinition {
    type: "drillDown";

    /**
     * Local identifier of the attribute that triggered the drill down.
     */
    origin: LocalIdRef;

    /**
     * Target attribute display form for drill down.
     */
    target: ObjRef;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDrillDownDefinition}.
 * @beta
 */
export function isDrillDownDefinition(obj: unknown): obj is IDrillDownDefinition {
    return !isEmpty(obj) && (obj as IDrillDownDefinition).type === "drillDown";
}
