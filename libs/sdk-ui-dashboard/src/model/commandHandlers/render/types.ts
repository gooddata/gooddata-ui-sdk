// (C) 2025-2026 GoodData Corporation

/**
 * @beta
 */
export interface IRenderingWorkerConfiguration {
    /**
     * Maximum time limit for rendering the dashboard.
     * Somehow in sync with limits of exporter
     * https://github.com/gooddata/gdc-exporters-microservices/blob/master/microservices/visual-exporter-service/src/main/kotlin/com/gooddata/exporters/visual/config/TabSessionConfig.kt
     *
     * Default: 20*60000 (20min).
     * @privateRemarks
     * If changing this value update it also in documentation of {@link requestAsyncRender} command creator and {@link useDashboardAsyncRender} hook.
     */
    maxTimeout: number;

    /**
     * Maximum time limit for the first asynchronous rendering request.
     * If no asynchronous rendering request is fired in this time limit, the dashboard will announce that it is rendered.
     *
     * Default: 5000 (5s).
     */
    asyncRenderRequestedTimeout: number;

    /**
     * Maximum time limit to re-request asynchronous rendering of the component once it's resolved.
     *
     * Default: 2000 (2s).
     */
    asyncRenderResolvedTimeout: number;

    /**
     * Generator of correlation ids
     *
     * Default: uuid4
     */
    correlationIdGenerator: () => string;

    /**
     * Wait for given number of async requests.
     * If provided, we'll not wait full asyncRenderRequestedTimeout and
     * terminate the waiting if we reach the given number
     *
     */
    asyncRenderExpectedCount?: number;

    /**
     * Indicates whether rendering worker is triggered inside export mode
     *
     * Default: false
     */
    isExport?: boolean;
}
