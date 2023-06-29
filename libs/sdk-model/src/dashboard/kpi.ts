// (C) 2020-2022 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import { ObjRef } from "../objRef/index.js";

/**
 * Kpi
 * @alpha
 */
export type IKpi = IKpiWithComparison | IKpiWithoutComparison;

/**
 * Type-guard testing whether the provided object is an instance of {@link IKpi}.
 * @alpha
 */
export function isKpi(obj: unknown): obj is IKpi {
    return isKpiWithComparison(obj) || isKpiWithoutComparison(obj);
}

/**
 * Common kpi properties
 * @alpha
 */
export interface IKpiBase {
    comparisonType: IKpiComparisonTypeComparison;
    comparisonDirection?: IKpiComparisonDirection;
    metric: ObjRef;
}

/**
 * Kpi with comparison
 * @alpha
 */
export type IKpiWithComparison = IKpiWithPreviousPeriodComparison | IKpiWithPopComparison;

/**
 * Kpi with previous period comparison
 * @alpha
 */
export interface IKpiWithPreviousPeriodComparison extends IKpiBase {
    comparisonType: "previousPeriod";
    comparisonDirection: IKpiComparisonDirection;
}

/**
 * Kpi with period over period comparison
 * @alpha
 */
export interface IKpiWithPopComparison extends IKpiBase {
    comparisonType: "lastYear";
    comparisonDirection: IKpiComparisonDirection;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IKpiWithComparison}.
 * @alpha
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
 * @alpha
 */
export interface IKpiWithoutComparison extends IKpiBase {
    comparisonType: "none";
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IKpiWithoutComparison}.
 * @alpha
 */
export function isKpiWithoutComparison(obj: unknown): obj is IKpiWithoutComparison {
    return !isEmpty(obj) && (obj as IKpiWithoutComparison).comparisonType === "none";
}

/**
 * Kpi comparison type
 * @alpha
 */
export type IKpiComparisonTypeComparison =
    | IKpiWithPreviousPeriodComparison["comparisonType"]
    | IKpiWithPopComparison["comparisonType"]
    | IKpiWithoutComparison["comparisonType"];

/**
 * Kpi comparison direction
 * @alpha
 */
export type IKpiComparisonDirection = "growIsGood" | "growIsBad";
