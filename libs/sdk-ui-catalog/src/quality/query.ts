// (C) 2025 GoodData Corporation

/* eslint-disable no-constant-condition */

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type { ISemanticQualityReport } from "@gooddata/sdk-model";

const maxPollingInterval = 30 * 1000; // 30 seconds
const maxPollingTime = 5 * 60 * 1000; // 5 minutes

type Options = {
    backend: IAnalyticalBackend;
    workspace: string;
    signal?: AbortSignal;
};

export async function getQualityReportQuery({
    backend,
    workspace,
    signal,
}: Options): Promise<ISemanticQualityReport> {
    return backend.workspace(workspace).genAI().getSemanticQuality().getQualityReport({ signal });
}

export async function triggerQualityIssuesCalculationQuery(
    options: Options,
): Promise<ISemanticQualityReport> {
    const { backend, workspace, signal } = options;

    const calculation = await backend
        .workspace(workspace)
        .genAI()
        .getSemanticQuality()
        .triggerQualityIssuesCalculation();

    let report: ISemanticQualityReport = {
        issues: [],
        updatedAt: undefined,
        status: calculation.status,
    };

    // If the calculation is completed, fetch the report without polling
    if (calculation.status === "COMPLETED") {
        return await getQualityReportQuery(options);
    }

    // If the calculation is still running, poll for the report until it is completed or failed
    if (calculation.status === "RUNNING") {
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

            report = await getQualityReportQuery(options);

            if (report.status === "COMPLETED" || report.status === "FAILED") {
                break;
            }
        }
    }

    return report;
}

export function createQueryId(): string {
    return crypto.randomUUID();
}

function wait(delay: number) {
    return new Promise((resolve) => setTimeout(resolve, delay));
}
