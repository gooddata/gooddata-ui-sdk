// (C) 2021-2026 GoodData Corporation

import { type IAvailableDrillTargetAttribute, type IAvailableDrillTargetMeasure } from "@gooddata/sdk-ui";

import {
    type DashboardDrillContext,
    type DashboardDrillDefinition,
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

export interface DrillSelectItem {
    type: DrillType;
    id: string;
    name: string;
    drillDefinition: DashboardDrillDefinition;
    attributeValue?: string | null;
    context?: unknown;
    isDisabled?: boolean;
    tooltipText?: string;
}

export interface DrillSelectContext {
    drillDefinitions: DashboardDrillDefinition[];
    drillEvent: IDashboardDrillEvent;
    drillContext?: DashboardDrillContext;
    correlationId?: string;
}

export type IAvailableDrillTargetItem = IAvailableDrillTargetAttribute | IAvailableDrillTargetMeasure;
