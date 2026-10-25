// (C) 2026 GoodData Corporation

import { getHostAdapter } from "../../embedding/hostBridge.js";

import { adPostEvent } from "./post_event_helper.js";

/** Name of the event that tells an in-process host that a metric was saved or deleted. */
export const METRICS_CHANGED_EVENT = "metricsChanged";

/**
 * Tells an in-process host that a metric was saved or deleted, so a host that shares a caching
 * backend with AD can reset its caches. Only the host adapter receives it: the event is not part of
 * the @gooddata/sdk-embedding contract, so it is not posted to an iframe parent.
 */
export function metricsChanged(): void {
    if (!getHostAdapter()) {
        return;
    }
    adPostEvent(METRICS_CHANGED_EVENT, {});
}
