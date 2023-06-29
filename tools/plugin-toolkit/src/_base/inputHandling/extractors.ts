// (C) 2021 GoodData Corporation

import { ActionOptions, TargetBackendType } from "../types.js";
import { backendTypeValidator, createHostnameValidator, validOrDie } from "./validators.js";

/**
 * Gets a valid hostname from CLI options or dies with validation error.
 *
 * @param backend - type of backend for which user is entering hostname
 * @param options - program & command options
 * @returns undefined if no hostname specified.
 */
export function getHostnameFromOptions(
    backend: TargetBackendType | undefined,
    options: ActionOptions,
): string | undefined {
    const { hostname } = options.programOpts;

    if (!hostname) {
        return undefined;
    }

    // do the hostname validation only if the backend type is known at this point
    if (backend !== undefined) {
        validOrDie("hostname", hostname, createHostnameValidator(backend));
    }

    return hostname;
}

/**
 * Gets a valid backend type from CLI options or dies with validation error.
 *
 * @param options - program & command options
 * @returns undefined if no backend type specified.
 */
export function getBackendFromOptions(options: ActionOptions): TargetBackendType | undefined {
    const { backend } = options.programOpts;

    if (!backend) {
        return undefined;
    }

    validOrDie("backend", backend, backendTypeValidator);

    return backend as TargetBackendType;
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
