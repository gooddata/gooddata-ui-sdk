// (C) 2021-2026 GoodData Corporation

import { type ExplicitDrill } from "@gooddata/sdk-ui";

import { type ICrossFilteringItem } from "./types.js";

/**
 * @beta
 */
export interface IDrillState {
    drillableItems: Record<string, ExplicitDrill[]>;
    crossFiltering: Record<string, ICrossFilteringItem[]>;
}

export const drillInitialState: IDrillState = {
    drillableItems: {},
    crossFiltering: {},
};
