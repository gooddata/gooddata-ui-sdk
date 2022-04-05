// (C) 2020-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-empty-interface, import/namespace */
import {
    IKpi,
    isKpi,
    IKpiBase,
    IKpiWithComparison,
    IKpiWithPreviousPeriodComparison,
    IKpiWithPopComparison,
    isKpiWithComparison,
    IKpiWithoutComparison,
    isKpiWithoutComparison,
    IKpiComparisonTypeComparison,
    IKpiComparisonDirection,
} from "@gooddata/sdk-model";

/**
 * Legacy kpi type - will be removed in the future
 * @deprecated Use {@link @gooddata/sdk-model#IKpi}
 * @alpha
 */
export type ILegacyKpi = IKpi;

/**
 * Type-guard testing whether the provided object is an instance of {@link ILegacyKpi}.
 * @deprecated Use {@link @gooddata/sdk-model#isKpi}
 * @alpha
 */
export const isLegacyKpi = isKpi;

/**
 * Common kpi properties
 * @deprecated Use {@link @gooddata/sdk-model#IKpiBase}
 * @alpha
 */
export interface ILegacyKpiBase extends IKpiBase {}

/**
 * Kpi with comparison
 * @deprecated Use {@link @gooddata/sdk-model#IKpiWithComparison}
 * @alpha
 */
export type ILegacyKpiWithComparison = IKpiWithComparison;

/**
 * Kpi with previous period comparison
 * @deprecated Use {@link @gooddata/sdk-model#IKpiWithPreviousPeriodComparison}
 * @alpha
 */
export interface ILegacyKpiWithPreviousPeriodComparison extends IKpiWithPreviousPeriodComparison {}

/**
 * Kpi with period over period comparison
 * @deprecated Use {@link @gooddata/sdk-model#IKpiWithPopComparison}
 * @alpha
 */
export interface ILegacyKpiWithPopComparison extends IKpiWithPopComparison {}

/**
 * Type-guard testing whether the provided object is an instance of {@link ILegacyKpiWithComparison}.
 * @deprecated Use {@link @gooddata/sdk-model#isKpiWithComparison}
 * @alpha
 */
export const isLegacyKpiWithComparison = isKpiWithComparison;

/**
 * Kpi without comparison
 * @deprecated Use {@link @gooddata/sdk-model#IKpiWithoutComparison}
 * @alpha
 */
export interface ILegacyKpiWithoutComparison extends IKpiWithoutComparison {}

/**
 * Type-guard testing whether the provided object is an instance of {@link ILegacyKpiWithoutComparison}.
 * @deprecated Use {@link @gooddata/sdk-model#isKpiWithoutComparison}
 * @alpha
 */
export const isLegacyKpiWithoutComparison = isKpiWithoutComparison;

/**
 * Kpi comparison type
 * @deprecated Use {@link @gooddata/sdk-model#IKpiComparisonTypeComparison}
 * @alpha
 */
export type ILegacyKpiComparisonTypeComparison = IKpiComparisonTypeComparison;

/**
 * Kpi comparison direction
 * @deprecated Use {@link @gooddata/sdk-model#IKpiComparisonDirection}
 * @alpha
 */
export type ILegacyKpiComparisonDirection = IKpiComparisonDirection;
