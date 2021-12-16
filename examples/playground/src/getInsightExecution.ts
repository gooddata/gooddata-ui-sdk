// (C) 2021 GoodData Corporation

import { getBackend } from "./getBackend";
import { getExecution } from "./commonInsightExecution";

export async function getInsightExecution(token: string, projectId: string, insightUri: string) {
    const backend = getBackend(token);
    const insight = await backend.workspace(projectId).insights().getInsight({ uri: insightUri });
    await getExecution(token, projectId, insight)
}
