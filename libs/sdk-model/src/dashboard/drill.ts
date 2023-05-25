// (C) 2020-2022 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import { ObjRef, ObjRefInScope } from "../objRef/index.js";

/**
 * Insight widget drill definition
 * @alpha
 */
export type InsightDrillDefinition =
    | IDrillToInsight
    | IDrillToDashboard
    | IDrillToCustomUrl
    | IDrillToAttributeUrl;

/**
 * Kpi widget drill definition
 * @alpha
 */
export type KpiDrillDefinition = IDrillToLegacyDashboard;

/**
 * Widget drill definition
 * @alpha
 */
export type DrillDefinition = InsightDrillDefinition | KpiDrillDefinition;

/**
 * Drill origin type
 * @alpha
 */
export type DrillOriginType = "drillFromMeasure" | "drillFromAttribute";

/**
 * Drill origin
 * @alpha
 */
export type DrillOrigin = IDrillFromMeasure | IDrillFromAttribute;

/**
 * Drill transition
 * @alpha
 */
export type DrillTransition = "pop-up" | "in-place" | "new-window";

/**
 * Drill type
 * @alpha
 */
export type DrillType =
    | "drillToInsight"
    | "drillToDashboard"
    | "drillToLegacyDashboard"
    | "drillToCustomUrl"
    | "drillToAttributeUrl";

/**
 * Drill origin base type
 * @alpha
 */
export interface IDrillOrigin {
    /**
     * Drill origin type
     */
    type: DrillOriginType;
}

/**
 * Drill to custom url target
 * @alpha
 */
export interface IDrillToCustomUrlTarget {
    /**
     * Custom url to drill to
     */
    url: string;
}

/**
 * Drill to attribute url target
 * @alpha
 */
export interface IDrillToAttributeUrlTarget {
    /**
     * Original attribute display form on the insight
     */
    displayForm: ObjRef;

    /**
     * Target attribute display form (must be of type `Hyperlink`), which contains elements with destination URL
     */
    hyperlinkDisplayForm: ObjRef;
}

/**
 * Drill target
 * @alpha
 */
export type IDrillTarget = ObjRef | IDrillToCustomUrlTarget | IDrillToAttributeUrlTarget;

/**
 * Drill from measure
 * @alpha
 */
export interface IDrillFromMeasure extends IDrillOrigin {
    /**
     * Drill origin type
     */
    type: "drillFromMeasure";

    /**
     * Measure object ref
     */
    measure: ObjRefInScope;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDrillFromMeasure}.
 * @alpha
 */
export function isDrillFromMeasure(obj: DrillOrigin): obj is IDrillFromMeasure {
    return !isEmpty(obj) && (obj as IDrillFromMeasure).type === "drillFromMeasure";
}

/**
 * Drill from attribute
 * @alpha
 */
export interface IDrillFromAttribute extends IDrillOrigin {
    /**
     * Drill origin type
     */
    type: "drillFromAttribute";

    /**
     * Attribute object ref
     */
    attribute: ObjRefInScope;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDrillFromAttribute}.
 * @alpha
 */
export function isDrillFromAttribute(obj: DrillOrigin): obj is IDrillFromAttribute {
    return !isEmpty(obj) && (obj as IDrillFromAttribute).type === "drillFromAttribute";
}

/**
 * Drill base type
 * @alpha
 */
export interface IDrill {
    /**
     * Drill type
     */
    type: DrillType;

    /**
     * Drill transition
     */
    transition: DrillTransition;

    /**
     * Drill origin
     */
    origin: DrillOrigin;
}

/**
 * Drill to PP dashboard
 * @alpha
 */
export interface IDrillToLegacyDashboard extends IDrill {
    /**
     * Drill type
     */
    type: "drillToLegacyDashboard";

    /**
     * Drill transition
     */
    transition: "in-place";

    /**
     * Target dashboard tab
     */
    tab: string;

    /**
     * Target legacy dashboard ref
     */
    target: ObjRef;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDrillToLegacyDashboard}.
 * @alpha
 */
export function isDrillToLegacyDashboard(obj: unknown): obj is IDrillToLegacyDashboard {
    return !isEmpty(obj) && (obj as IDrillToLegacyDashboard).type === "drillToLegacyDashboard";
}

/**
 * Drill to dashboard
 * @alpha
 */
export interface IDrillToDashboard extends IDrill {
    /**
     * Drill type
     */
    type: "drillToDashboard";

    /**
     * Drill transition
     */
    transition: "in-place";

    /**
     * Target dashboard ref. If not specified, then this is a drill to self - activating such
     * drill will not switch to a different dashboard but will instead set dashboard filters to
     * 'focus' on the drilled attribute element IF a filter for that attribute is defined for
     * the dashboard.
     *
     * Example: dashboard shows several for company departments. It is possible to filter the entire
     * dashboard by department. A column chart showing cost by department has drill to dashboard set
     * without 'target'. When user clicks a column, the dashboard's department filter will be set
     * to the department that the clicked column represents.
     */
    target?: ObjRef;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDrillToDashboard}.
 * @alpha
 */
export function isDrillToDashboard(obj: unknown): obj is IDrillToDashboard {
    return !isEmpty(obj) && (obj as IDrillToDashboard).type === "drillToDashboard";
}

/**
 * Drill to insight
 * @alpha
 */
export interface IDrillToInsight extends IDrill {
    /**
     * Drill type
     */
    type: "drillToInsight";

    /**
     * Drill transition
     */
    transition: "pop-up";

    /**
     * Target insight ref
     */
    target: ObjRef;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDrillToInsight}.
 * @alpha
 */
export function isDrillToInsight(obj: unknown): obj is IDrillToInsight {
    return !isEmpty(obj) && (obj as IDrillToInsight).type === "drillToInsight";
}

/**
 * Drill to custom url
 * @alpha
 */
export interface IDrillToCustomUrl extends IDrill {
    /**
     * Drill type
     */
    type: "drillToCustomUrl";

    /**
     * Drill transition
     */
    transition: "new-window";

    /**
     * Target url
     */
    target: IDrillToCustomUrlTarget;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDrillToCustomUrl}.
 * @alpha
 */
export function isDrillToCustomUrl(obj: unknown): obj is IDrillToCustomUrl {
    return !isEmpty(obj) && (obj as IDrillToCustomUrl).type === "drillToCustomUrl";
}

/**
 * Drill to attribute url
 * @alpha
 */
export interface IDrillToAttributeUrl extends IDrill {
    /**
     * Drill type
     */
    type: "drillToAttributeUrl";

    /**
     * Drill transition
     */
    transition: "new-window";

    /**
     * Target display form and hyperlink display form
     */
    target: IDrillToAttributeUrlTarget;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDrillToAttributeUrl}.
 * @alpha
 */
export function isDrillToAttributeUrl(obj: unknown): obj is IDrillToAttributeUrl {
    return !isEmpty(obj) && (obj as IDrillToAttributeUrl).type === "drillToAttributeUrl";
}
