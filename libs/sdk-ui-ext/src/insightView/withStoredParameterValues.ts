// (C) 2026 GoodData Corporation

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import {
    type IExecutionConfig,
    type IInsight,
    type IInsightParameterValue,
    areObjRefsEqual,
    insightValidParameters,
} from "@gooddata/sdk-model";

/**
 * Adds the stored parameter overrides of the insight to the execution config.
 *
 * @internal
 */
export function withStoredParameterValues(
    execConfig: IExecutionConfig | undefined,
    insight: IInsight | undefined,
    settings: IUserWorkspaceSettings | undefined,
): IExecutionConfig | undefined {
    if (!insight || settings?.enableParameters !== true) {
        return execConfig;
    }
    const isStringEnabled = settings.enableStringParameters ?? true;
    const callerValues = execConfig?.parameterValues ?? [];
    const storedValues: IInsightParameterValue[] = [];
    for (const stored of insightValidParameters(insight)) {
        const isAllowed = isStringEnabled || typeof stored.value !== "string";
        const isReplaced = callerValues.some((callerValue) => areObjRefsEqual(callerValue.ref, stored.ref));
        if (isAllowed && !isReplaced) {
            storedValues.push(stored);
        }
    }
    if (storedValues.length === 0) {
        return execConfig;
    }
    return { ...execConfig, parameterValues: [...storedValues, ...callerValues] };
}
