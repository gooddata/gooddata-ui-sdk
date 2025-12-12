// (C) 2019-2025 GoodData Corporation
import { type AxiosInstance } from "axios";

import { ActionsAutomation, type ActionsAutomationInterface } from "./generated/automation-json-api/index.js";

/**
 * Tiger execution client factory
 */
export const tigerAutomationClientFactory = (axios: AxiosInstance): ActionsAutomationInterface =>
    new ActionsAutomation(undefined, "", axios);
