// (C) 2024 GoodData Corporation

import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

/**
 * @alpha
 */
export interface AutomationsState {
    fingerprint: string;
    automations: IAutomationMetadataObject[];
    loading: boolean;
    error?: GoodDataSdkError;
}

export const automationsInitialState: AutomationsState = {
    automations: [],
    loading: true,
    fingerprint: "initial",
};
