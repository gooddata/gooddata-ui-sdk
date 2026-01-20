// (C) 2019-2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import {
    type IDrillToAttributeUrl as IDrillToAttributeUrlModel,
    type IDrillToCustomUrl as IDrillToCustomUrlModel,
    type IDrillToInsight as IDrillToInsightModel,
    type IInsight as IInsightModel,
    type IKeyDriveAnalysis as IKeyDriveAnalysisModel,
    type IListedDashboard as IListedDashboardModel,
    type ObjRef,
    isDrillToAttributeUrl,
    isDrillToCustomUrl,
} from "@gooddata/sdk-model";
import { type IAvailableDrillTargetMeasure, type IAvailableDrillTargets } from "@gooddata/sdk-ui";

import { type IKdaDefinition } from "../../kdaDialog/index.js";
import {
    type DashboardDrillCommand,
    type ICrossFiltering,
    type IDashboardCommandFailed,
    type IDashboardCrossFilteringResolved,
    type IDashboardDrillDownResolved,
    type IDashboardDrillResolved,
    type IDashboardDrillToAttributeUrlResolved,
    type IDashboardDrillToCustomUrlResolved,
    type IDashboardDrillToDashboardResolved,
    type IDashboardDrillToInsightResolved,
    type IDashboardDrillToLegacyDashboardResolved,
    type IDashboardKeyDriverAnalysisResolved,
    type IDrill,
    type IDrillDown,
    type IDrillToAttributeUrl,
    type IDrillToCustomUrl,
    type IDrillToDashboard,
    type IDrillToInsight,
    type IDrillToLegacyDashboard,
    type IKeyDriverAnalysis,
} from "../../model/index.js";
import {
    type IDashboardDrillContext,
    type IDashboardDrillEvent,
    type IDrillDownDefinition,
} from "../../types.js";

/**
 * @alpha
 */
export type OnWidgetDrill = (drillEvent: IDashboardDrillEvent, drillContext: IDashboardDrillContext) => void;

/**
 * @internal
 */
export type OnDashboardDrillError = (event: IDashboardCommandFailed<DashboardDrillCommand>) => void;

/**
 * @internal
 */
export type OnDashboardDrill = (cmd: IDrill) => void;

/**
 * @internal
 */
export type OnDashboardDrillSuccess = (event: IDashboardDrillResolved) => void;

/**
 * @internal
 */
export type OnDrillDown = (cmd: IDrillDown) => void;

/**
 * @alpha
 */
export type OnDrillDownSuccess = (event: IDashboardDrillDownResolved) => void;

/**
 * @internal
 */
export type OnDrillToInsight = (cmd: IDrillToInsight) => void;

/**
 * @alpha
 */
export type OnDrillToInsightSuccess = (event: IDashboardDrillToInsightResolved) => void;

/**
 * @internal
 */
export type OnDrillToDashboard = (cmd: IDrillToDashboard) => void;

/**
 * @alpha
 */
export type OnDrillToDashboardSuccess = (event: IDashboardDrillToDashboardResolved) => void;

/**
 * @internal
 */
export type OnDrillToAttributeUrl = (cmd: IDrillToAttributeUrl) => void;

/**
 * @alpha
 */
export type OnDrillToAttributeUrlSuccess = (event: IDashboardDrillToAttributeUrlResolved) => void;

/**
 * @internal
 */
export type OnDrillToCustomUrl = (cmd: IDrillToCustomUrl) => void;

/**
 * @alpha
 */
export type OnDrillToCustomUrlSuccess = (event: IDashboardDrillToCustomUrlResolved) => void;

/**
 * @internal
 */
export type OnDrillToLegacyDashboard = (cmd: IDrillToLegacyDashboard) => void;

/**
 * @internal
 */
export type OnDrillToLegacyDashboardSuccess = (event: IDashboardDrillToLegacyDashboardResolved) => void;

/**
 * @beta
 */
export interface IDrillStep {
    drillEvent: IDashboardDrillEvent;
    drillDefinition: IDrillToInsightModel | IDrillDownDefinition;
    insight: IInsightModel;
}

/**
 * @internal
 */
export type OnCrossFiltering = (cmd: ICrossFiltering) => void;

/**
 * @internal
 */
export type OnCrossFilteringSuccess = (event: IDashboardCrossFilteringResolved) => void;

/**
 * @internal
 */
export type OnCrossFilteringError = OnDashboardDrillError;

/**
 * @internal
 */
export interface IKeyDriveInfo {
    readonly keyDriveDefinition: IKdaDefinition;
    drillEvent: IDashboardDrillEvent;
    drillDefinition: IKeyDriveAnalysisModel;
}

/**
 * @internal
 */
export type OnKeyDriverAnalysis = (cmd: IKeyDriverAnalysis) => void;

/**
 * @internal
 */
export type OnKeyDriverAnalysisSuccess = (event: IDashboardKeyDriverAnalysisResolved) => void;

/**
 * @internal
 */
export type OnKeyDriverAnalysisError = OnDashboardDrillError;

/////

/**
 * @internal
 */
export type IDrillToUrl = IDrillToCustomUrlModel | IDrillToAttributeUrlModel;

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
    implicit?: boolean; // true if the drill is defined implicitly for all attributes based on insight config
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
    GEO_AREA = "GDC.geo.area",
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
    dashboardsList: IListedDashboardModel[];
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
