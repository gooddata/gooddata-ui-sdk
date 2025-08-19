// (C) 2021-2025 GoodData Corporation
import { IAvailableDrillTargetAttribute, IAvailableDrillTargetMeasure } from "@gooddata/sdk-ui";

import { DashboardDrillContext, DashboardDrillDefinition, IDashboardDrillEvent } from "../../../types.js";

/**
 * These types are also used as s-classes for testing e.g. .s-drill-to-dashboard
 */
export enum DrillType {
    DRILL_TO_DASHBOARD = "drill-to-dashboard",
    DRILL_TO_INSIGHT = "drill-to-insight",
    DRILL_TO_URL = "drill-to-url",
    DRILL_DOWN = "drill-down",
    CROSS_FILTERING = "cross-filtering",
}

export interface DrillSelectItem {
    type: DrillType;
    id: string;
    name: string;
    drillDefinition: DashboardDrillDefinition;
    attributeValue?: string | null;
}

export interface DrillSelectContext {
    drillDefinitions: DashboardDrillDefinition[];
    drillEvent: IDashboardDrillEvent;
    drillContext?: DashboardDrillContext;
    correlationId?: string;
}

export type IAvailableDrillTargetItem = IAvailableDrillTargetAttribute | IAvailableDrillTargetMeasure;

/**
 * @internal
 */
export type IDrillSelectCloseBehavior = "closeOnSelect" | "preventClose";
