// (C) 2020-2026 GoodData Corporation

export interface ICustomRouteParams {
    dataset?: string;
    projectId?: string;
    reportId?: string;
    includeObjectsWithTags?: string;
    excludeObjectsWithTags?: string;
    hideControl?: string;
    sourceDashboard?: string;
    sourceInsight?: string;
    hideAction?: string;
    displayAction?: string;
    allowDashboardLinks?: string;
    isEmbeddedFromKD?: string;
    /**
     * Both are raw URL query values — STRINGS, like every other entry here, not booleans. The only
     * consumer re-serializes them into a query string.
     */
    showEmbedButton?: string;
    apiTokenAuthentication?: string;
    asOfDate?: string;
}
