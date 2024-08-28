// (C) 2024 GoodData Corporation

import { GoodDataSdkError } from "@gooddata/sdk-ui";
import { Smtps } from "../../types/commonTypes.js";

/**
 * @alpha
 */
export interface SmtpsState {
    smtps: Smtps;
    loading: boolean;
    error?: GoodDataSdkError;
}

export const smtpsInitialState: SmtpsState = { smtps: [], loading: true };
