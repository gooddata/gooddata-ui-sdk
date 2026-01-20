// (C) 2024-2026 GoodData Corporation

import { type IAutomationMetadataObject } from "@gooddata/sdk-model";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";

/**
 * @alpha
 */
export interface IAutomationsState {
    isInitialized: boolean;
    isLoading: boolean;
    error?: GoodDataSdkError;
    userAutomations: IAutomationMetadataObject[];
    allAutomationsCount: number;
}

export const automationsInitialState: IAutomationsState = {
    isInitialized: false,
    isLoading: false,
    allAutomationsCount: 0,
    userAutomations: [],
};
