// (C) 2021-2026 GoodData Corporation

import { type IAvailableDrillTargetAttribute, type IAvailableDrillTargetMeasure } from "@gooddata/sdk-ui";

import { type IRestrictedDrillDown } from "../../../model/store/widgetDrills/widgetDrillSelectors.js";
import {
    type DashboardDrillDefinition,
    type IDashboardDrillContext,
    type IDashboardDrillEvent,
} from "../../../types.js";

/**
 * These types are also used as s-classes for testing e.g. .s-drill-to-dashboard
 */
export enum DrillType {
    DRILL_TO_DASHBOARD = "drill-to-dashboard",
    DRILL_TO_INSIGHT = "drill-to-insight",
    DRILL_TO_URL = "drill-to-url",
    DRILL_DOWN = "drill-down",
    CROSS_FILTERING = "cross-filtering",
    KEY_DRIVER_ANALYSIS = "key-driver-analysis",
}

export interface ISelectableDrillSelectItem {
    type: DrillType;
    id: string;
    name: string;
    drillDefinition: DashboardDrillDefinition;
    attributeValue?: string | null;
    context?: unknown;
    isDisabled?: boolean;
    tooltipText?: string;
}

/**
 * A drill the user cannot open. It carries no drill definition: it is never executed, and its
 * target is never named.
 */
export interface IRestrictedDrillSelectItem {
    type: DrillType;
    id: string;
    name: string;
    isRestricted: true;
}

export type IDrillSelectItem = ISelectableDrillSelectItem | IRestrictedDrillSelectItem;

export function isRestrictedDrillSelectItem(item: IDrillSelectItem): item is IRestrictedDrillSelectItem {
    return "isRestricted" in item;
}

export interface IDrillSelectContext {
    drillDefinitions: DashboardDrillDefinition[];
    restrictedDrillDowns: IRestrictedDrillDown[];
    drillEvent: IDashboardDrillEvent;
    drillContext?: IDashboardDrillContext;
    correlationId?: string;
}

export type IAvailableDrillTargetItem = IAvailableDrillTargetAttribute | IAvailableDrillTargetMeasure;
