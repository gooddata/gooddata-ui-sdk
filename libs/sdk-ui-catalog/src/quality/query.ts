// (C) 2025 GoodData Corporation

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { ISemanticQualityIssue } from "@gooddata/sdk-model";

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
