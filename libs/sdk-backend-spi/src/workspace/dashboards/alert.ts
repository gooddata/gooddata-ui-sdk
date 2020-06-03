// (C) 2019-2020 GoodData Corporation
import { ObjRef, isObjRef } from "@gooddata/sdk-model";
import { IFilterContext, IFilterContextDefinition, isFilterContextDefinition } from "./filterContext";
import { IDashboardObjectIdentity } from "./common";
import isEmpty from "lodash/isEmpty";

/**
 * Common widget alert properties
 * @alpha
 */
export interface IWidgetAlertBase {
    /**
     * Kpi alert title
     */
    readonly title: string;

    /**
     * Kpi alert description
     */
    readonly description: string;

    /**
     * Kpi ref (currently only kpi widget alerts are supported)
     */
    readonly widget: ObjRef;

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
 * Type-guard testing whether the provided object is an instance of {@link IWidgetAlertDefinition}.
 * @alpha
 */
export function isWidgetAlertDefinition(obj: any): obj is IWidgetAlertDefinition {
    return (
        hasWidgetAlertBaseProps(obj) &&
        (!isObjRef(obj.ref) || isFilterContextDefinition((obj as IWidgetAlertDefinition).filterContext))
    );
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

/**
 * Pair of the widget and it's alert count
 * @alpha
 */
export interface IWidgetAlertCount {
    /**
     * Widget reference
     */
    readonly ref: ObjRef;

    /**
     * Number of alerts for the referenced widget
     */
    readonly alertCount: number;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IWidgetAlert}.
 * @alpha
 */
export function isWidgetAlert(obj: any): obj is IWidgetAlert {
    return hasWidgetAlertBaseProps(obj) && !isWidgetAlertDefinition(obj);
}

/**
 * @internal
 */
function hasWidgetAlertBaseProps(obj: any): boolean {
    return (
        !isEmpty(obj) &&
        ((obj as IWidgetAlertBase).whenTriggered === "underThreshold" ||
            (obj as IWidgetAlertBase).whenTriggered === "aboveThreshold")
    );
}
