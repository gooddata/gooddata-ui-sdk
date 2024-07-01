// (C) 2024 GoodData Corporation

import { Webhooks } from "../../types/commonTypes.js";

/**
 * @alpha
 */
export interface WebhooksState {
    webhooks: Webhooks;
}

export const webhooksInitialState: WebhooksState = { webhooks: [] };
