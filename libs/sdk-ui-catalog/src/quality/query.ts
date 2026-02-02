// (C) 2025-2026 GoodData Corporation

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type { ISemanticQualityIssuesCalculation, ISemanticQualityReport } from "@gooddata/sdk-model";

const maxPollingInterval = 30 * 1000; // 30 seconds
const maxPollingTime = 5 * 60 * 1000; // 5 minutes

type Options = {
    backend: IAnalyticalBackend;
    workspace: string;
    signal?: AbortSignal;
};

async function getQualityReportQuery({
    backend,
    workspace,
    signal,
}: Options): Promise<ISemanticQualityReport> {
    return backend.workspace(workspace).genAI().getSemanticQuality().getQualityReport({ signal });
}

export async function triggerQualityIssuesQuery(
    options: Options,
    onStatusChange?: (status: ISemanticQualityIssuesCalculation["status"]) => void,
): Promise<ISemanticQualityReport> {
    const { signal } = options;

    const report = await getQualityReportQuery(options);

    // Poll for the report if necessary
    return pollingForSemanticCheckStatus(options, report, signal, onStatusChange);
}

export async function triggerQualityIssuesCalculationQuery(options: Options): Promise<void> {
    const { backend, workspace } = options;

    await backend.workspace(workspace).genAI().getSemanticQuality().triggerQualityIssuesCalculation();
}

async function pollingForSemanticCheckStatus(
    options: Options,
    report: ISemanticQualityReport,
    signal?: AbortSignal,
    onStatusChange?: (status: ISemanticQualityIssuesCalculation["status"]) => void,
) {
    let currentReport: ISemanticQualityReport = report;

    // Update status
    onStatusChange?.(currentReport.status);

    // If the calculation is still running, poll for the report until it is completed or failed
    if (currentReport.status === "RUNNING" || currentReport.status === "SYNCING") {
        const startTime = Date.now();
        let pollingInterval = 2000; // 2 seconds

        while (true) {
            // Check for cancellation
            if (signal?.aborted) {
                console.warn("Quality calculation polling was aborted");
                break;
            }

            // Check for timeout
            if (Date.now() - startTime > maxPollingTime) {
                console.warn("Quality calculation polling timed out");
                break;
            }

            // Wait some time before polling
            await wait(pollingInterval);

            // Increase polling interval
            pollingInterval = Math.min(pollingInterval * 1.5, maxPollingInterval);

            currentReport = await getQualityReportQuery(options);
            // Update status
            onStatusChange?.(currentReport.status);

            if (currentReport.status === "COMPLETED" || currentReport.status === "FAILED") {
                break;
            }
        }
    }

    return currentReport;
}

export function createQueryId(): string {
    return crypto.randomUUID();
}

function wait(delay: number) {
    return new Promise((resolve) => setTimeout(resolve, delay));
}
