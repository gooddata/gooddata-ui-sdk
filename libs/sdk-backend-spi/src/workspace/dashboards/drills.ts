// (C) 2020 GoodData Corporation

import { ObjRef, ObjRefInScope } from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty";

/**
 * Widget drill definition
 * @alpha
 */
export type DrillDefinition = IDrillToInsight | IDrillToDashboard | IDrillToLegacyDashboard;

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
export type DrillTransition = "pop-up" | "in-place";

/**
 * Drill type
 * @alpha
 */
export type DrillType = "drillToInsight" | "drillToDashboard" | "drillToLegacyDashboard";

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
     * Drill target object ref
     */
    target: ObjRef;
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
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDrillToInsight}.
 * @alpha
 */
export function isDrillToInsight(obj: any): obj is IDrillToInsight {
    return !isEmpty(obj) && (obj as IDrillToInsight).type === "drillToInsight";
}
