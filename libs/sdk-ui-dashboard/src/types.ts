// (C) 2007-2021 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { DrillDefinition, IInsightWidget } from "@gooddata/sdk-backend-spi";
import {
    IAbsoluteDateFilter,
    IInsight,
    INegativeAttributeFilter,
    IPositiveAttributeFilter,
    IRelativeDateFilter,
    LocalIdRef,
    ObjRef,
} from "@gooddata/sdk-model";
import { IDrillEvent, OnFiredDrillEvent } from "@gooddata/sdk-ui";

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

/**
 * @alpha
 */
export interface DashboardDrillContext {
    /**
     * Particular insight that triggered the drill event.
     */
    insight?: IInsight;

    /**
     * Particular widget that triggered the drill event.
     */
    widget?: IInsightWidget;
}
