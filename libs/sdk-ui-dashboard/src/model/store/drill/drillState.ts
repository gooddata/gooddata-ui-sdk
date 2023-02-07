// (C) 2021-2023 GoodData Corporation
import { ExplicitDrill } from "@gooddata/sdk-ui";

/**
 * @beta
 */
export interface DrillState {
    drillableItems: ExplicitDrill[];
}

export const drillInitialState: DrillState = { drillableItems: [] };
