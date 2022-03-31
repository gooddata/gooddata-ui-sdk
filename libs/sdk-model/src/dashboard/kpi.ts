// (C) 2020-2022 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { ObjRef } from "../objRef";

/**
 * Legacy kpi type - will be removed in the future
 * @public
 */
export type ILegacyKpi = ILegacyKpiWithComparison | ILegacyKpiWithoutComparison;

/**
 * Type-guard testing whether the provided object is an instance of {@link ILegacyKpi}.
 * @public
 */
export function isLegacyKpi(obj: unknown): obj is ILegacyKpi {
    return isLegacyKpiWithComparison(obj) || isLegacyKpiWithoutComparison(obj);
}

/**
 * Common kpi properties
 * @public
 */
export interface ILegacyKpiBase {
    comparisonType: ILegacyKpiComparisonTypeComparison;
    comparisonDirection?: ILegacyKpiComparisonDirection;
    metric: ObjRef;
}

/**
 * Kpi with comparison
 * @public
 */
export type ILegacyKpiWithComparison = ILegacyKpiWithPreviousPeriodComparison | ILegacyKpiWithPopComparison;

/**
 * Kpi with previous period comparison
 * @public
 */
export interface ILegacyKpiWithPreviousPeriodComparison extends ILegacyKpiBase {
    comparisonType: "previousPeriod";
    comparisonDirection: ILegacyKpiComparisonDirection;
}

/**
 * Kpi with period over period comparison
 * @public
 */
export interface ILegacyKpiWithPopComparison extends ILegacyKpiBase {
    comparisonType: "lastYear";
    comparisonDirection: ILegacyKpiComparisonDirection;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link ILegacyKpiWithComparison}.
 * @public
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
 * @public
 */
export interface ILegacyKpiWithoutComparison extends ILegacyKpiBase {
    comparisonType: "none";
}

/**
 * Type-guard testing whether the provided object is an instance of {@link ILegacyKpiWithoutComparison}.
 * @public
 */
export function isLegacyKpiWithoutComparison(obj: unknown): obj is ILegacyKpiWithoutComparison {
    return !isEmpty(obj) && (obj as ILegacyKpiWithoutComparison).comparisonType === "none";
}

/**
 * Kpi comparison type
 * @public
 */
export type ILegacyKpiComparisonTypeComparison =
    | ILegacyKpiWithPreviousPeriodComparison["comparisonType"]
    | ILegacyKpiWithPopComparison["comparisonType"]
    | ILegacyKpiWithoutComparison["comparisonType"];

/**
 * Kpi comparison direction
 * @public
 */
export type ILegacyKpiComparisonDirection = "growIsGood" | "growIsBad";
