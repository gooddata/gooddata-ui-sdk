// (C) 2021-2025 GoodData Corporation

import { createHostnameValidator, validOrDie } from "./validators.js";
import { type ActionOptions } from "../types.js";

/**
 * Gets a valid hostname from CLI options or dies with validation error.
 *
 * @param options - program & command options
 * @returns undefined if no hostname specified.
 */
export function getHostnameFromOptions(options: ActionOptions): string | undefined {
    const { hostname } = options.programOpts;

    if (!hostname) {
        return undefined;
    }

    validOrDie("hostname", hostname, createHostnameValidator());

    return hostname;
}

/**
 * Gets a valid workspace from CLI options or dies with validation error.
 *
 * Note: does not validate that workspace actually exists. Just that it is in the options.
 *
 * @param options - program & command options
 * @returns undefined if no workspace specified.
 */
export function getWorkspaceFromOptions(options: ActionOptions): string | undefined {
    const { workspaceId } = options.commandOpts;

    if (!workspaceId) {
        return undefined;
    }

    validOrDie("workspace", workspaceId, () => true);

    return workspaceId;
}

/**
 * Gets a valid dashboard from CLI options or dies with validation error.
 *
 * Note: does not validate that dashboard actually exists. Just that it is in the options.
 *
 * @param options - program & command options
 * @returns undefined if no dashboard specified.
 */
export function getDashboardFromOptions(options: ActionOptions): string | undefined {
    const { dashboardId } = options.commandOpts;

    if (!dashboardId) {
        return undefined;
    }

    validOrDie("dashboard", dashboardId, () => true);

    return dashboardId;
}
