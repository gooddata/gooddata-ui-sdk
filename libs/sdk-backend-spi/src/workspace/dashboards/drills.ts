// (C) 2020 GoodData Corporation

import { ObjRef, ObjRefInScope } from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty";

/**
 * Widget drill definition
 * @alpha
 */
export type DrillDefinition =
    | IDrillToInsight
    | IDrillToDashboard
    | IDrillToLegacyDashboard
    | IDrillToCustomUrl
    | IDrillToAttributeUrl;

/**
 * Drill origin type
 * @alpha
 */
export type DrillOriginType = "drillFromMeasure";

/**
 * Drill origin
 * @alpha
 */
export type DrillOrigin = IDrillFromMeasure;

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

    /**
     * Drill target
     */
    target: IDrillTarget;
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
export function isDrillToLegacyDashboard(obj: any): obj is IDrillToLegacyDashboard {
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
     * Target dashboard ref
     */
    target: ObjRef;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDrillToDashboard}.
 * @alpha
 */
export function isDrillToDashboard(obj: any): obj is IDrillToDashboard {
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
export function isDrillToInsight(obj: any): obj is IDrillToInsight {
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
export function isDrillToCustomUrl(obj: any): obj is IDrillToCustomUrl {
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
export function isDrillToAttributeUrl(obj: any): obj is IDrillToAttributeUrl {
    return !isEmpty(obj) && (obj as IDrillToAttributeUrl).type === "drillToAttributeUrl";
}
