// (C) 2019-2020 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";
import { IFilterContext, IFilterContextDefinition } from "./filterContext";
import { IDashboardObjectIdentity } from "./common";

/**
 * Common widget alert properties
 * @alpha
 */
export interface IWidgetAlertBase {
    /**
     * Kpi ref (currently only kpi widget alerts are supported)
     */
    readonly insight: ObjRef;

    /**
     * KPI can be on more dashboards - we need to distinguish
     * which dashboard can be used as link in dashboard alerting email
     */
    readonly dashboard: ObjRef;

    /**
     * Threshold
     */
    readonly threshold: number;

    /**
     * Is alert triggered?
     */
    readonly isTriggered: boolean;

    /**
     * Rule to apply
     */
    readonly whenTriggered: "underThreshold" | "aboveThreshold";
}

/**
 * With widget alert, user can be notified to his email according to provided rules
 * (e.g. when some measure exceeds/drops below the set value)
 * @alpha
 */
export interface IWidgetAlertDefinition extends IWidgetAlertBase, Partial<IDashboardObjectIdentity> {
    /**
     * Alert filter context
     */
    readonly filterContext?: IFilterContext | IFilterContextDefinition;
}

/**
 * See {@link IWidgetAlertDefinition}
 * @alpha
 */
export interface IWidgetAlert extends IWidgetAlertBase, IDashboardObjectIdentity {
    /**
     * Alert filter context
     */
    readonly filterContext?: IFilterContext;
}
