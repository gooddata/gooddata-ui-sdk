// (C) 2019-2023 GoodData Corporation
import { IAvailableDrillTargetMeasure, IAvailableDrillTargets } from "@gooddata/sdk-ui";
import isEmpty from "lodash/isEmpty.js";
import {
    IInsight,
    ObjRef,
    IDrillToAttributeUrl,
    IDrillToCustomUrl,
    IDrillToInsight,
    isDrillToAttributeUrl,
    isDrillToCustomUrl,
    IListedDashboard,
} from "@gooddata/sdk-model";
import { DashboardDrillContext, IDashboardDrillEvent, IDrillDownDefinition } from "../../types.js";
import {
    DrillToLegacyDashboard,
    DashboardCommandFailed,
    DashboardDrillResolved,
    DashboardDrillDownResolved,
    DashboardDrillToInsightResolved,
    DashboardDrillToDashboardResolved,
    DashboardDrillToAttributeUrlResolved,
    DashboardDrillToCustomUrlResolved,
    Drill,
    DrillDown,
    DrillToInsight,
    DrillToDashboard,
    DrillToAttributeUrl,
    DrillToCustomUrl,
    DashboardDrillToLegacyDashboardResolved,
    DashboardDrillCommand,
} from "../../model/index.js";

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
 * @internal
 */
export interface DrillStep {
    drillEvent: IDashboardDrillEvent;
    drillDefinition: IDrillToInsight | IDrillDownDefinition;
    insight: IInsight;
}

/////

export type IDrillToUrl = IDrillToCustomUrl | IDrillToAttributeUrl;

export function isDrillToUrl(drillDefinition: unknown): drillDefinition is IDrillToUrl {
    return isDrillToCustomUrl(drillDefinition) || isDrillToAttributeUrl(drillDefinition);
}

export enum DRILL_TARGET_TYPE {
    DRILL_TO_DASHBOARD = "DrillToDashboard",
    DRILL_TO_INSIGHT = "DrillToInsight",
    DRILL_TO_URL = "DrillToUrl",
}

export interface IDrillConfigItemBase {
    type: "measure" | "attribute";
    title: string;
    localIdentifier: string;
    drillTargetType?: DRILL_TARGET_TYPE;
    complete: boolean;
    warning?: string;
    attributes: IAvailableDrillTargetMeasure["attributes"];
}

export type IDrillConfigItem = IDrillToDashboardConfig | IDrillToInsightConfig | IDrillToUrlConfig;
export type IDrillConfigItemTarget =
    | IDrillToDashboardConfigTarget
    | IDrillToInsightConfigTarget
    | IDrillToUrlConfigTarget;

export interface IDrillToDashboardConfigTarget {
    dashboard?: ObjRef;
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

// check type AttributeDisplayFormType from @gooddata/sdk-model to keep it in sync
export enum AttributeDisplayFormType {
    HYPERLINK = "GDC.link",
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
