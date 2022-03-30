// (C) 2020-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-empty-interface, import/namespace */
import * as m from "@gooddata/sdk-model";

/**
 * Legacy kpi type - will be removed in the future
 * @deprecated Use {@link @gooddata/sdk-model#ILegacyKpi}
 * @alpha
 */
export type ILegacyKpi = m.ILegacyKpi;

/**
 * Type-guard testing whether the provided object is an instance of {@link ILegacyKpi}.
 * @deprecated Use {@link @gooddata/sdk-model#isLegacyKpi}
 * @alpha
 */
export const isLegacyKpi = m.isLegacyKpi;

/**
 * Common kpi properties
 * @deprecated Use {@link @gooddata/sdk-model#ILegacyKpiBase}
 * @alpha
 */
export interface ILegacyKpiBase extends m.ILegacyKpiBase {}

/**
 * Kpi with comparison
 * @deprecated Use {@link @gooddata/sdk-model#ILegacyKpiWithComparison}
 * @alpha
 */
export type ILegacyKpiWithComparison = m.ILegacyKpiWithComparison;

/**
 * Kpi with previous period comparison
 * @deprecated Use {@link @gooddata/sdk-model#ILegacyKpiWithPreviousPeriodComparison}
 * @alpha
 */
export interface ILegacyKpiWithPreviousPeriodComparison extends m.ILegacyKpiWithPreviousPeriodComparison {}

/**
 * Kpi with period over period comparison
 * @deprecated Use {@link @gooddata/sdk-model#ILegacyKpiWithPopComparison}
 * @alpha
 */
export interface ILegacyKpiWithPopComparison extends m.ILegacyKpiWithPopComparison {}

/**
 * Type-guard testing whether the provided object is an instance of {@link ILegacyKpiWithComparison}.
 * @deprecated Use {@link @gooddata/sdk-model#isLegacyKpiWithComparison}
 * @alpha
 */
export const isLegacyKpiWithComparison = m.isLegacyKpiWithComparison;

/**
 * Kpi without comparison
 * @deprecated Use {@link @gooddata/sdk-model#ILegacyKpiWithoutComparison}
 * @alpha
 */
export interface ILegacyKpiWithoutComparison extends m.ILegacyKpiWithoutComparison {}

/**
 * Type-guard testing whether the provided object is an instance of {@link ILegacyKpiWithoutComparison}.
 * @deprecated Use {@link @gooddata/sdk-model#isLegacyKpiWithoutComparison}
 * @alpha
 */
export const isLegacyKpiWithoutComparison = m.isLegacyKpiWithoutComparison;

/**
 * Kpi comparison type
 * @deprecated Use {@link @gooddata/sdk-model#ILegacyKpiComparisonTypeComparison}
 * @alpha
 */
export type ILegacyKpiComparisonTypeComparison = m.ILegacyKpiComparisonTypeComparison;

/**
 * Kpi comparison direction
 * @deprecated Use {@link @gooddata/sdk-model#ILegacyKpiComparisonDirection}
 * @alpha
 */
export type ILegacyKpiComparisonDirection = m.ILegacyKpiComparisonDirection;
