// (C) 2021-2025 GoodData Corporation

import { ExplicitDrill } from "@gooddata/sdk-ui";

import { ICrossFilteringItem } from "./types.js";

/**
 * @beta
 */
export interface DrillState {
    drillableItems: Record<string, ExplicitDrill[]>;
    crossFiltering: Record<string, ICrossFilteringItem[]>;
}

export const drillInitialState: DrillState = {
    drillableItems: {},
    crossFiltering: {},
};
