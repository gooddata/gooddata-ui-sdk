// (C) 2024 GoodData Corporation

import { GoodDataSdkError } from "@gooddata/sdk-ui";

/**
 * @alpha
 */
export interface AutomationsState {
    fingerprint: string;
    automations: number;
    loading: boolean;
    error?: GoodDataSdkError;
}

export const automationsInitialState: AutomationsState = {
    automations: 0,
    loading: true,
    fingerprint: "initial",
};
