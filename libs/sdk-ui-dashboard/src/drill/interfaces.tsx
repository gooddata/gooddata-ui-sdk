// (C) 2019-2021 GoodData Corporation
import { IAvailableDrillTargets, IAvailableDrillTargetMeasure } from "@gooddata/sdk-ui";
import isEmpty from "lodash/isEmpty";
import { IFilter, IInsight, ObjRef } from "@gooddata/sdk-model";
import { IDashboardDrillEvent, IDrillDownDefinition } from "@gooddata/sdk-ui-ext";
import {
    DrillDefinition,
    IDrillToAttributeUrl,
    IDrillToCustomUrl,
    IInsightWidget,
    isDrillToAttributeUrl,
    isDrillToCustomUrl,
    IListedDashboard,
    IDrillToInsight,
    IDrillToDashboard,
} from "@gooddata/sdk-backend-spi";

/**
 * @internal
 */
export type DashboardDrillDefinition = DrillDefinition | IDrillDownDefinition;

/**
 * @internal
 */
export type OnDashboardDrill = (
    drillEvent: IDashboardDrillEvent,
    drillContext: DashboardDrillContext,
) => void;

/**
 * @internal
 */
export type OnDrillDown = (context: {
    drillDefinition: IDrillDownDefinition;
    drillEvent: IDashboardDrillEvent;
    insight: IInsight;
}) => void;

/**
 * @internal
 */
export type OnDrillToInsight = (context: {
    drillDefinition: IDrillToInsight;
    drillEvent: IDashboardDrillEvent;
    insight: IInsight;
}) => void;

/**
 * @internal
 */
export type OnDrillToDashboard = (context: {
    drillDefinition: IDrillToDashboard;
    drillEvent: IDashboardDrillEvent;
    filters: IFilter[];
}) => void;

/**
 * @internal
 */
export type OnDrillToAttributeUrl = (context: {
    drillDefinition: IDrillToAttributeUrl;
    drillEvent: IDashboardDrillEvent;
    url: string;
}) => void;

/**
 * @internal
 */
export type OnDrillToCustomUrl = (context: {
    drillDefinition: IDrillToCustomUrl;
    drillEvent: IDashboardDrillEvent;
    url: string;
}) => void;

/**
 * @internal
 */
export interface DashboardDrillContext {
    /**
     * Particular insight that triggered the drill event.
     */
    insight?: IInsight;

    /**
     * Particular widget that triggered the drill event.
     */
    widget?: IInsightWidget;
}

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

export function isDrillToUrl(drillDefinition: DashboardDrillDefinition): drillDefinition is IDrillToUrl {
    return isDrillToCustomUrl(drillDefinition) || isDrillToAttributeUrl(drillDefinition);
}

export enum DRILL_TARGET_TYPE {
    DRILL_TO_DASHBOARD = "DrillToDashboard",
    DRILL_TO_INSIGHT = "DrillToInsight",
    DRILL_TO_URL = "DrillToUrl",
}

export interface IDrillConfigItemBase {
    type: string;
    title: string;
    localIdentifier: string;
    drillTargetType: DRILL_TARGET_TYPE;
    complete: boolean;
    warning?: string;
    attributes: IAvailableDrillTargetMeasure["attributes"];
}

export type IDrillConfigItem = IDrillToDashboardConfig | IDrillToInsightConfig | IDrillToUrlConfig;

export interface IDrillToDashboardConfig extends IDrillConfigItemBase {
    dashboard?: ObjRef;
}

export function isDrillToDashboardConfig(item: IDrillConfigItem): item is IDrillToDashboardConfig {
    return !isEmpty(item) && (item as IDrillToDashboardConfig).dashboard !== undefined;
}

export interface IDrillToInsightConfig extends IDrillConfigItemBase {
    insightRef?: ObjRef;
}

export function isDrillToInsightConfig(item: IDrillConfigItem): item is IDrillToInsightConfig {
    return !isEmpty(item) && (item as IDrillToInsightConfig).insightRef !== undefined;
}

export interface IDrillToCustomUrlConfig {
    customUrl: string;
}

export function isDrillToCustomUrlConfig(item: UrlDrillTarget): item is IDrillToCustomUrlConfig {
    return !isEmpty(item) && (item as IDrillToCustomUrlConfig).customUrl !== undefined;
}

export interface IDrillToAttributeUrlConfig {
    insightAttributeDisplayForm: ObjRef;
    drillToAttributeDisplayForm: ObjRef;
}

export function isDrillToAttributeUrlConfig(item: UrlDrillTarget): item is IDrillToAttributeUrlConfig {
    return !isEmpty(item) && (item as IDrillToAttributeUrlConfig).insightAttributeDisplayForm !== undefined;
}

export type UrlDrillTarget = IDrillToCustomUrlConfig | IDrillToAttributeUrlConfig;

export interface IDrillToUrlConfig extends IDrillConfigItemBase {
    urlDrillTarget?: UrlDrillTarget;
}

export function isDrillToUrlConfig(item: IDrillConfigItem): item is IDrillToUrlConfig {
    return !isEmpty(item) && (item as IDrillToUrlConfig).urlDrillTarget !== undefined;
}

export interface IDrillToUrlPlaceholder {
    placeholder: string;
    identifier: string;
    toBeEncoded: boolean;
}

export enum AttributeDisplayFormType {
    HYPERLINK = "GDC.link",
    GEO_PUSHPIN = "GDC.geo.pin",
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
