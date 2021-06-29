// (C) 2021 GoodData Corporation
import { DashboardDrillContext, DashboardDrillDefinition } from "../interfaces";
import { IDashboardDrillEvent } from "@gooddata/sdk-ui-ext";

/**
 * These types are also used as s-classes for testing e.g. .s-drill-to-dashboard
 */
export enum DrillType {
    DRILL_TO_DASHBOARD = "drill-to-dashboard",
    DRILL_TO_INSIGHT = "drill-to-insight",
    DRILL_TO_URL = "drill-to-url",
    DRILL_DOWN = "drill-down",
}

export interface DrillSelectItem {
    type: DrillType;
    id: string;
    name: string;
    drillDefinition: DashboardDrillDefinition;
}

export interface DrillSelectContext {
    drillDefinitions: DashboardDrillDefinition[];
    drillEvent: IDashboardDrillEvent;
    drillContext?: DashboardDrillContext;
}
