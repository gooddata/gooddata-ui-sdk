// (C) 2024 GoodData Corporation

import { GoodDataSdkError } from "@gooddata/sdk-ui";
import { Webhooks } from "../../types/commonTypes.js";

/**
 * @alpha
 */
export interface WebhooksState {
    webhooks: Webhooks;
    loading: boolean;
    error?: GoodDataSdkError;
}

export const webhooksInitialState: WebhooksState = { webhooks: [], loading: true };
