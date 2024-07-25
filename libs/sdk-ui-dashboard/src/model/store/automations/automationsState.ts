// (C) 2024 GoodData Corporation

import { GoodDataSdkError } from "@gooddata/sdk-ui";
import { Automations } from "../../types/commonTypes.js";

/**
 * @alpha
 */
export interface AutomationsState {
    automations: Automations;
    loading: boolean;
    error?: GoodDataSdkError;
}

export const automationsInitialState: AutomationsState = { automations: [], loading: true };
