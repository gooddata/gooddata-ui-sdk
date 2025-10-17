// (C) 2025 GoodData Corporation

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { ISemanticQualityIssue, type ISemanticQualityIssuesCalculation } from "@gooddata/sdk-model";

type Options = {
    backend: IAnalyticalBackend;
    workspace: string;
};

export async function getQualityIssuesQuery({
    backend,
    workspace,
}: Options): Promise<ISemanticQualityIssue[]> {
    return backend.workspace(workspace).genAI().getSemanticQuality().getQualityIssues();
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
