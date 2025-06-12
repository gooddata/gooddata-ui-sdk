// (C) 2019-2025 GoodData Corporation
import { AxiosInstance } from "axios";
import { ActionsAutomation, ActionsAutomationInterface } from "./generated/automation-json-api/index.js";

/**
 * Tiger execution client factory
 */
export const tigerAutomationClientFactory = (axios: AxiosInstance): ActionsAutomationInterface =>
    new ActionsAutomation(undefined, "", axios);
