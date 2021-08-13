// (C) 2021 GoodData Corporation
import { ExplicitDrill } from "@gooddata/sdk-ui";

/**
 * @alpha
 */
export interface DrillState {
    drillableItems: ExplicitDrill[];
}

export const drillInitialState: DrillState = { drillableItems: [] };
