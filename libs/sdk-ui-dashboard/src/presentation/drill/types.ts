// (C) 2019-2025 GoodData Corporation

import { isEmpty } from "lodash-es";

import {
    IDrillToAttributeUrl,
    IDrillToCustomUrl,
    IDrillToInsight,
    IInsight,
    IKeyDriveAnalysis,
    IListedDashboard,
    ObjRef,
    isDrillToAttributeUrl,
    isDrillToCustomUrl,
} from "@gooddata/sdk-model";
import { IAvailableDrillTargetMeasure, IAvailableDrillTargets } from "@gooddata/sdk-ui";

import { IKdaDefinition } from "../../kdaDialog/index.js";
import {
    CrossFiltering,
    DashboardCommandFailed,
    DashboardCrossFilteringResolved,
    DashboardDrillCommand,
    DashboardDrillDownResolved,
    DashboardDrillResolved,
    DashboardDrillToAttributeUrlResolved,
    DashboardDrillToCustomUrlResolved,
    DashboardDrillToDashboardResolved,
    DashboardDrillToInsightResolved,
    DashboardDrillToLegacyDashboardResolved,
    DashboardKeyDriverAnalysisResolved,
    Drill,
    DrillDown,
    DrillToAttributeUrl,
    DrillToCustomUrl,
    DrillToDashboard,
    DrillToInsight,
    DrillToLegacyDashboard,
    KeyDriverAnalysis,
} from "../../model/index.js";
import { DashboardDrillContext, IDashboardDrillEvent, IDrillDownDefinition } from "../../types.js";

/**
 * @alpha
 */
export type OnWidgetDrill = (drillEvent: IDashboardDrillEvent, drillContext: DashboardDrillContext) => void;

/**
 * @internal
 */
export type OnDashboardDrillError = (event: DashboardCommandFailed<DashboardDrillCommand>) => void;

/**
 * @internal
 */
export type OnDashboardDrill = (cmd: Drill) => void;

/**
 * @internal
 */
export type OnDashboardDrillSuccess = (event: DashboardDrillResolved) => void;

/**
 * @internal
 */
export type OnDrillDown = (cmd: DrillDown) => void;

/**
 * @alpha
 */
export type OnDrillDownSuccess = (event: DashboardDrillDownResolved) => void;

/**
 * @internal
 */
export type OnDrillToInsight = (cmd: DrillToInsight) => void;

/**
 * @alpha
 */
export type OnDrillToInsightSuccess = (event: DashboardDrillToInsightResolved) => void;

/**
 * @internal
 */
export type OnDrillToDashboard = (cmd: DrillToDashboard) => void;

/**
 * @alpha
 */
export type OnDrillToDashboardSuccess = (event: DashboardDrillToDashboardResolved) => void;

/**
 * @internal
 */
export type OnDrillToAttributeUrl = (cmd: DrillToAttributeUrl) => void;

/**
 * @alpha
 */
export type OnDrillToAttributeUrlSuccess = (event: DashboardDrillToAttributeUrlResolved) => void;

/**
 * @internal
 */
export type OnDrillToCustomUrl = (cmd: DrillToCustomUrl) => void;

/**
 * @alpha
 */
export type OnDrillToCustomUrlSuccess = (event: DashboardDrillToCustomUrlResolved) => void;

/**
 * @internal
 */
export type OnDrillToLegacyDashboard = (cmd: DrillToLegacyDashboard) => void;

/**
 * @internal
 */
export type OnDrillToLegacyDashboardSuccess = (event: DashboardDrillToLegacyDashboardResolved) => void;

/**
 * @beta
 */
export interface DrillStep {
    drillEvent: IDashboardDrillEvent;
    drillDefinition: IDrillToInsight | IDrillDownDefinition;
    insight: IInsight;
}

/**
 * @internal
 */
export type OnCrossFiltering = (cmd: CrossFiltering) => void;

/**
 * @internal
 */
export type OnCrossFilteringSuccess = (event: DashboardCrossFilteringResolved) => void;

/**
 * @internal
 */
export type OnCrossFilteringError = OnDashboardDrillError;

/**
 * @internal
 */
export interface KeyDriveInfo {
    readonly keyDriveDefinition: IKdaDefinition;
    drillEvent: IDashboardDrillEvent;
    drillDefinition: IKeyDriveAnalysis;
}

/**
 * @internal
 */
export type OnKeyDriverAnalysis = (cmd: KeyDriverAnalysis) => void;

/**
 * @internal
 */
export type OnKeyDriverAnalysisSuccess = (event: DashboardKeyDriverAnalysisResolved) => void;

/**
 * @internal
 */
export type OnKeyDriverAnalysisError = OnDashboardDrillError;

/////

/**
 * @internal
 */
export type IDrillToUrl = IDrillToCustomUrl | IDrillToAttributeUrl;

export function isDrillToUrl(drillDefinition: unknown): drillDefinition is IDrillToUrl {
    return isDrillToCustomUrl(drillDefinition) || isDrillToAttributeUrl(drillDefinition);
}

export enum DRILL_TARGET_TYPE {
    DRILL_TO_DASHBOARD = "DrillToDashboard",
    DRILL_TO_INSIGHT = "DrillToInsight",
    DRILL_DOWN = "DrillDown",
    DRILL_TO_URL = "DrillToUrl",
}

export interface IDrillConfigItemBase {
    type: "measure" | "attribute";
    title: string;
    originLocalIdentifier: string;
    localIdentifier: string;
    drillTargetType?: DRILL_TARGET_TYPE;
    complete: boolean;
    warning?: string;
    attributes: IAvailableDrillTargetMeasure["attributes"];
    widgetRef: ObjRef;
    /**
     * Local identifiers of attribute display forms that should be ignored in drill intersection.
     */
    drillIntersectionIgnoredAttributes?: string[];
}

export type IDrillConfigItem =
    | IDrillToDashboardConfig
    | IDrillToInsightConfig
    | IDrillToUrlConfig
    | IDrillDownAttributeHierarchyConfig;
export type IDrillConfigItemTarget =
    | IDrillToDashboardConfigTarget
    | IDrillToInsightConfigTarget
    | IDrillToUrlConfigTarget
    | IDrillDownAttributeHierarchyTarget;

export interface IDrillToDashboardConfigTarget {
    dashboard?: ObjRef;
    dashboardTab?: string;
}

export type IDrillToDashboardConfig = IDrillConfigItemBase & IDrillToDashboardConfigTarget;

export function isDrillToDashboardConfig(item: unknown): item is IDrillToDashboardConfig {
    return !isEmpty(item) && (item as IDrillToDashboardConfig).dashboard !== undefined;
}

export interface IDrillToInsightConfigTarget {
    insightRef?: ObjRef;
}

export type IDrillToInsightConfig = IDrillConfigItemBase & IDrillToInsightConfigTarget;

export function isDrillToInsightConfig(item: unknown): item is IDrillToInsightConfig {
    return !isEmpty(item) && (item as IDrillToInsightConfig).insightRef !== undefined;
}

export interface IDrillToCustomUrlConfig {
    customUrl: string;
}

export function isDrillToCustomUrlConfig(item: unknown): item is IDrillToCustomUrlConfig {
    return !isEmpty(item) && (item as IDrillToCustomUrlConfig).customUrl !== undefined;
}

export interface IDrillToAttributeUrlConfig {
    insightAttributeDisplayForm: ObjRef;
    drillToAttributeDisplayForm: ObjRef;
}

export function isDrillToAttributeUrlConfig(item: unknown): item is IDrillToAttributeUrlConfig {
    return !isEmpty(item) && (item as IDrillToAttributeUrlConfig).insightAttributeDisplayForm !== undefined;
}

export type UrlDrillTarget = IDrillToCustomUrlConfig | IDrillToAttributeUrlConfig;

export interface IDrillToUrlConfigTarget {
    urlDrillTarget?: UrlDrillTarget;
}

export type IDrillToUrlConfig = IDrillConfigItemBase & IDrillToUrlConfigTarget;

export function isDrillToUrlConfig(item: unknown): item is IDrillToUrlConfig {
    return !isEmpty(item) && (item as IDrillToUrlConfig).urlDrillTarget !== undefined;
}

/**
 * @internal
 */
export interface IDrillDownAttributeHierarchyTarget {
    type: "attribute";
    attributeHierarchyRef: ObjRef;
}

export type IDrillDownAttributeHierarchyConfig = IDrillConfigItemBase & IDrillDownAttributeHierarchyTarget;

export function isDrillDownToAttributeHierarchyConfig(
    item: unknown,
): item is IDrillDownAttributeHierarchyConfig {
    return !isEmpty(item) && (item as IDrillDownAttributeHierarchyConfig).attributeHierarchyRef !== undefined;
}

// check type AttributeDisplayFormType from @gooddata/sdk-model to keep it in sync
export enum AttributeDisplayFormType {
    HYPERLINK = "GDC.link",
    IMAGE = "GDC.image",
    GEO_PUSHPIN = "GDC.geo.pin",
    GEO_PUSHPIN_LATITUDE = "GDC.geo.pin_latitude",
    GEO_PUSHPIN_LONGITUDE = "GDC.geo.pin_longitude",
}

export interface IAttributeDisplayForm {
    formOf: ObjRef;
    identifier: string;
    uri: string;
    ref: ObjRef;
    type?: AttributeDisplayFormType;
    displayFormTitle: string;
    attributeTitle: string;
}

export interface IDefinitionValidationData {
    supportedDrillableItems: IAvailableDrillTargets;
    dashboardsList: IListedDashboard[];
    attributeDisplayForms?: IAttributeDisplayForm[];
}

export function isAvailableDrillTargetMeasure(obj: unknown): obj is IAvailableDrillTargetMeasure {
    return !isEmpty(obj) && (obj as IAvailableDrillTargetMeasure).measure !== undefined;
}

export interface IDrillDownAttributeHierarchyDefinition {
    type: "drillDownAttributeHierarchy";
    attributeHierarchyRef: ObjRef;
    originLocalIdentifier?: string;
    attributes: IAvailableDrillTargetMeasure["attributes"];
    drillIntersectionIgnoredAttributes: string[];
}

export function isDrillDownToAttributeHierarchyDefinition(
    item: unknown,
): item is IDrillDownAttributeHierarchyDefinition {
    return (
        !isEmpty(item) && (item as IDrillDownAttributeHierarchyDefinition).attributeHierarchyRef !== undefined
    );
}
