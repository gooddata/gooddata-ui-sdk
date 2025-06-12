// (C) 2021-2023 GoodData Corporation
import { ExplicitDrill } from "@gooddata/sdk-ui";
import { ICrossFilteringItem } from "./types.js";

/**
 * @beta
 */
export interface DrillState {
    drillableItems: ExplicitDrill[];
    crossFiltering: ICrossFilteringItem[];
}

export const drillInitialState: DrillState = {
    drillableItems: [],
    crossFiltering: [],
};
