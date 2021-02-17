// (C) 2020-2021 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { ObjRef } from "@gooddata/sdk-model";

/**
 * Legacy kpi type - will be removed in the future
 * @alpha
 */
export type ILegacyKpi = ILegacyKpiWithComparison | ILegacyKpiWithoutComparison;

/**
 * Common kpi properties
 * @alpha
 */
export interface ILegacyKpiBase {
    comparisonType: ILegacyKpiComparisonTypeComparison;
    comparisonDirection?: ILegacyKpiComparisonDirection;
    metric: ObjRef;
}

/**
 * @alpha
 */
export type ILegacyKpiWithComparison = ILegacyKpiWithPreviousPeriodComparison | ILegacyKpiWithPopComparison;

/**
 * Kpi with previous period comparison
 * @alpha
 */
export interface ILegacyKpiWithPreviousPeriodComparison extends ILegacyKpiBase {
    comparisonType: "previousPeriod";
    comparisonDirection: ILegacyKpiComparisonDirection;
}

/**
 * Kpi with period over period comparison
 * @alpha
 */
export interface ILegacyKpiWithPopComparison extends ILegacyKpiBase {
    comparisonType: "lastYear";
    comparisonDirection: ILegacyKpiComparisonDirection;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link ILegacyKpiWithComparison}.
 * @alpha
 */
export function isLegacyKpiWithComparison(obj: unknown): obj is ILegacyKpiWithComparison {
    return (
        !isEmpty(obj) &&
        ((obj as ILegacyKpiWithComparison).comparisonType === "previousPeriod" ||
            (obj as ILegacyKpiWithComparison).comparisonType === "lastYear")
    );
}

/**
 * Kpi without comparison
 * @alpha
 */
export interface ILegacyKpiWithoutComparison extends ILegacyKpiBase {
    comparisonType: "none";
}

/**
 * Type-guard testing whether the provided object is an instance of {@link ILegacyKpiWithoutComparison}.
 * @alpha
 */
export function isLegacyKpiWithoutComparison(obj: unknown): obj is ILegacyKpiWithoutComparison {
    return !isEmpty(obj) && (obj as ILegacyKpiWithoutComparison).comparisonType === "none";
}

/**
 * Kpi comparison type
 * @alpha
 */
export type ILegacyKpiComparisonTypeComparison = "previousPeriod" | "lastYear" | "none";

/**
 * Kpi comparison direction
 * @alpha
 */
export type ILegacyKpiComparisonDirection = "growIsGood" | "growIsBad";
