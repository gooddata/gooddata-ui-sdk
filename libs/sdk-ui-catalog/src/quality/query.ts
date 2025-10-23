// (C) 2025 GoodData Corporation

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type { ISemanticQualityIssuesCalculation, ISemanticQualityReport } from "@gooddata/sdk-model";

type Options = {
    backend: IAnalyticalBackend;
    workspace: string;
};

export async function getQualityReportQuery({
    backend,
    workspace,
}: Options): Promise<ISemanticQualityReport> {
    return backend.workspace(workspace).genAI().getSemanticQuality().getQualityReport();
}

export async function triggerQualityIssuesCalculationQuery({
    backend,
    workspace,
}: Options): Promise<ISemanticQualityIssuesCalculation> {
    return await backend.workspace(workspace).genAI().getSemanticQuality().triggerQualityIssuesCalculation();
}

export function createQueryId(): string {
    return crypto.randomUUID();
}
