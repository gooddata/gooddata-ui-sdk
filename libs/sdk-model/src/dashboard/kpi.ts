// (C) 2020-2022 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { ObjRef } from "../objRef";

/**
 * Kpi
 * @public
 */
export type IKpi = IKpiWithComparison | IKpiWithoutComparison;

/**
 * Type-guard testing whether the provided object is an instance of {@link IKpi}.
 * @public
 */
export function isKpi(obj: unknown): obj is IKpi {
    return isKpiWithComparison(obj) || isKpiWithoutComparison(obj);
}

/**
 * Common kpi properties
 * @public
 */
export interface IKpiBase {
    comparisonType: IKpiComparisonTypeComparison;
    comparisonDirection?: IKpiComparisonDirection;
    metric: ObjRef;
}

/**
 * Kpi with comparison
 * @public
 */
export type IKpiWithComparison = IKpiWithPreviousPeriodComparison | IKpiWithPopComparison;

/**
 * Kpi with previous period comparison
 * @public
 */
export interface IKpiWithPreviousPeriodComparison extends IKpiBase {
    comparisonType: "previousPeriod";
    comparisonDirection: IKpiComparisonDirection;
}

/**
 * Kpi with period over period comparison
 * @public
 */
export interface IKpiWithPopComparison extends IKpiBase {
    comparisonType: "lastYear";
    comparisonDirection: IKpiComparisonDirection;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IKpiWithComparison}.
 * @public
 */
export function isKpiWithComparison(obj: unknown): obj is IKpiWithComparison {
    return (
        !isEmpty(obj) &&
        ((obj as IKpiWithComparison).comparisonType === "previousPeriod" ||
            (obj as IKpiWithComparison).comparisonType === "lastYear")
    );
}

/**
 * Kpi without comparison
 * @public
 */
export interface IKpiWithoutComparison extends IKpiBase {
    comparisonType: "none";
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IKpiWithoutComparison}.
 * @public
 */
export function isKpiWithoutComparison(obj: unknown): obj is IKpiWithoutComparison {
    return !isEmpty(obj) && (obj as IKpiWithoutComparison).comparisonType === "none";
}

/**
 * Kpi comparison type
 * @public
 */
export type IKpiComparisonTypeComparison =
    | IKpiWithPreviousPeriodComparison["comparisonType"]
    | IKpiWithPopComparison["comparisonType"]
    | IKpiWithoutComparison["comparisonType"];

/**
 * Kpi comparison direction
 * @public
 */
export type IKpiComparisonDirection = "growIsGood" | "growIsBad";
