// (C) 2026 GoodData Corporation

import { DEFAULT_REPORT_ID } from "../constants/route_params.js";

export type AdHiddenAction = "open" | "clear" | "export" | "save" | "saveAs" | "openInAnalyticalDesigner";

/**
 * Route configuration of an in-process embedded AD — the same knobs the embedded AD URL carries in
 * iframe mode (workspace id excluded: in hosted mode it is owned by the host and set through
 * setRouteProjectId, mirroring the pluggable-mode hash dialect).
 */
export interface IAdEmbeddedRouteConfig {
    /** Insight to open; undefined means a new insight (the "reportId" placeholder route). */
    insightId?: string;
    /**
     * Dashboard the edited insight came from (edit-from-dashboard flow). The PRESENCE of the
     * param — not its value — is what marks that flow in AD (selectors/route_selector#isEditFromKD),
     * so a host editing an insight on a dashboard that has no identifier yet (a dashboard that has
     * never been saved) must pass an empty string: the flow is active, the id is simply unknown.
     * Only `undefined` omits the param.
     */
    sourceDashboardId?: string;
    /** Insight to open as an unsaved draft copy (explore flow). */
    sourceInsightId?: string;
    hideActions?: AdHiddenAction[];
    displayActions?: Array<"cancel">;
    allowDashboardLinks?: boolean;
    isEmbeddedFromKD?: boolean;
    thousandSeparator?: string;
    decimalSeparator?: string;
    asOfDate?: string;
    includeObjectsWithTags?: string[];
    excludeObjectsWithTags?: string[];
}

/**
 * Serializes the route config into the workspace-less hash dialect AD already parses in
 * pluggable/hosted mode (utils/hash_parser.ts) — the same grammar and formatting the embedded AD
 * URL uses in iframe mode, so the existing route reducers/selectors decode the configuration with
 * no new plumbing.
 */
export function buildEmbeddedHash(config: IAdEmbeddedRouteConfig): string {
    const params: string[] = [];
    // `!== undefined`, not a truthiness check: an empty id still has to emit `sourceDashboard=`,
    // otherwise AD stops recognizing the edit-from-dashboard flow (see the field's doc).
    if (config.sourceDashboardId !== undefined) {
        params.push(`sourceDashboard=${config.sourceDashboardId}`);
    }
    if (config.sourceInsightId) {
        params.push(`sourceInsight=${config.sourceInsightId}`);
    }
    if (config.hideActions?.length) {
        params.push(`hideAction=[${config.hideActions.join(",")}]`);
    }
    if (config.displayActions?.length) {
        params.push(`displayAction=[${config.displayActions.join(",")}]`);
    }
    if (config.allowDashboardLinks !== undefined) {
        params.push(`allowDashboardLinks=${config.allowDashboardLinks}`);
    }
    if (config.isEmbeddedFromKD) {
        params.push("isEmbeddedFromKD=true");
    }
    if (config.thousandSeparator) {
        params.push(`thousandSeparator=${config.thousandSeparator}`);
    }
    if (config.decimalSeparator) {
        params.push(`decimalSeparator=${config.decimalSeparator}`);
    }
    if (config.asOfDate) {
        params.push(`asOfDate=${config.asOfDate}`);
    }
    if (config.includeObjectsWithTags?.length) {
        params.push(`includeObjectsWithTags=[${config.includeObjectsWithTags.join(",")}]`);
    }
    if (config.excludeObjectsWithTags?.length) {
        params.push(`excludeObjectsWithTags=[${config.excludeObjectsWithTags.join(",")}]`);
    }
    const query = params.length ? `?${params.join("&")}` : "";
    return `#/${config.insightId ?? DEFAULT_REPORT_ID}/edit${query}`;
}
