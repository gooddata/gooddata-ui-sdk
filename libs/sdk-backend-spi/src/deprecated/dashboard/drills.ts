// (C) 2020-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-empty-interface, import/namespace */
import * as m from "@gooddata/sdk-model";
export { getAttributeIdentifiersPlaceholdersFromUrl } from "./drillUrls";

/**
 * Insight widget drill definition
 * @deprecated Use {@link @gooddata/sdk-model#InsightDrillDefinition}
 * @alpha
 */
export type InsightDrillDefinition = m.InsightDrillDefinition;

/**
 * Kpi widget drill definition
 * @deprecated Use {@link @gooddata/sdk-model#KpiDrillDefinition}
 * @alpha
 */
export type KpiDrillDefinition = m.KpiDrillDefinition;

/**
 * Widget drill definition
 * @deprecated Use {@link @gooddata/sdk-model#DrillDefinition}
 * @alpha
 */
export type DrillDefinition = m.DrillDefinition;

/**
 * Drill origin type
 * @deprecated Use {@link @gooddata/sdk-model#DrillOriginType}
 * @alpha
 */
export type DrillOriginType = m.DrillOriginType;

/**
 * Drill origin
 * @deprecated Use {@link @gooddata/sdk-model#DrillOrigin}
 * @alpha
 */
export type DrillOrigin = m.DrillOrigin;

/**
 * Drill transition
 * @deprecated Use {@link @gooddata/sdk-model#DrillTransition}
 * @alpha
 */
export type DrillTransition = m.DrillTransition;

/**
 * Drill type
 * @deprecated Use {@link @gooddata/sdk-model#DrillType}
 * @alpha
 */
export type DrillType = m.DrillType;

/**
 * Drill origin base type
 * @deprecated Use {@link @gooddata/sdk-model#IDrillOrigin}
 * @alpha
 */
export interface IDrillOrigin extends m.IDrillOrigin {}

/**
 * Drill to custom url target
 * @deprecated Use {@link @gooddata/sdk-model#IDrillToCustomUrlTarget}
 * @alpha
 */
export interface IDrillToCustomUrlTarget extends m.IDrillToCustomUrlTarget {}

/**
 * Drill to attribute url target
 * @deprecated Use {@link @gooddata/sdk-model#IDrillToAttributeUrlTarget}
 * @alpha
 */
export interface IDrillToAttributeUrlTarget extends m.IDrillToAttributeUrlTarget {}

/**
 * Drill target
 * @deprecated Use {@link @gooddata/sdk-model#IDrillTarget}
 * @alpha
 */
export type IDrillTarget = m.IDrillTarget;

/**
 * Drill from measure
 * @deprecated Use {@link @gooddata/sdk-model#IDrillFromMeasure}
 * @alpha
 */
export interface IDrillFromMeasure extends m.IDrillFromMeasure {}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDrillFromMeasure}.
 * @deprecated Use {@link @gooddata/sdk-model#isDrillFromMeasure}
 * @alpha
 */
export const isDrillFromMeasure = m.isDrillFromMeasure;

/**
 * Drill from attribute
 * @deprecated Use {@link @gooddata/sdk-model#IDrillFromAttribute}
 * @alpha
 */
export interface IDrillFromAttribute extends m.IDrillFromAttribute {}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDrillFromAttribute}.
 * @deprecated Use {@link @gooddata/sdk-model#isDrillFromAttribute}
 * @alpha
 */
export const isDrillFromAttribute = m.isDrillFromAttribute;

/**
 * Drill base type
 * @deprecated Use {@link @gooddata/sdk-model#IDrill}
 * @alpha
 */
export interface IDrill extends m.IDrill {}

/**
 * Drill to PP dashboard
 * @deprecated Use {@link @gooddata/sdk-model#IDrillToLegacyDashboard}
 * @alpha
 */
export interface IDrillToLegacyDashboard extends m.IDrillToLegacyDashboard {}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDrillToLegacyDashboard}.
 * @deprecated Use {@link @gooddata/sdk-model#isDrillToLegacyDashboard}
 * @alpha
 */
export const isDrillToLegacyDashboard = m.isDrillToLegacyDashboard;

/**
 * Drill to dashboard
 * @deprecated Use {@link @gooddata/sdk-model#IDrillToDashboard}
 * @alpha
 */
export interface IDrillToDashboard extends m.IDrillToDashboard {}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDrillToDashboard}.
 * @deprecated Use {@link @gooddata/sdk-model#isDrillToDashboard}
 * @alpha
 */
export const isDrillToDashboard = m.isDrillToDashboard;

/**
 * Drill to insight
 * @deprecated Use {@link @gooddata/sdk-model#IDrillToInsight}
 * @alpha
 */
export interface IDrillToInsight extends m.IDrillToInsight {}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDrillToInsight}.
 * @deprecated Use {@link @gooddata/sdk-model#isDrillToInsight}
 * @alpha
 */
export const isDrillToInsight = m.isDrillToInsight;

/**
 * Drill to custom url
 * @deprecated Use {@link @gooddata/sdk-model#IDrillToCustomUrl}
 * @alpha
 */
export interface IDrillToCustomUrl extends m.IDrillToCustomUrl {}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDrillToCustomUrl}.
 * @deprecated Use {@link @gooddata/sdk-model#isDrillToCustomUrl}
 * @alpha
 */
export const isDrillToCustomUrl = m.isDrillToCustomUrl;

/**
 * Drill to attribute url
 * @deprecated Use {@link @gooddata/sdk-model#IDrillToAttributeUrl}
 * @alpha
 */
export interface IDrillToAttributeUrl extends m.IDrillToAttributeUrl {}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDrillToAttributeUrl}.
 * @deprecated Use {@link @gooddata/sdk-model#isDrillToAttributeUrl}
 * @alpha
 */
export const isDrillToAttributeUrl = m.isDrillToAttributeUrl;
