// (C) 2025 GoodData Corporation

import type { AfmGetQualityIssuesResponse, AfmQualityIssue } from "@gooddata/api-client-tiger";
import type {
    GenAIObjectType,
    ISemanticQualityIssue,
    Identifier,
    SemanticQualityIssueCode,
    SemanticQualityIssueSeverity,
} from "@gooddata/sdk-model";

/**
 * Converts the full quality issues response from backend format to SDK model format.
 */
export function convertQualityIssuesResponse(response: AfmGetQualityIssuesResponse): ISemanticQualityIssue[] {
    if (!response.issues) {
        return [];
    }
    return response.issues.map(convertQualityIssue);
}

/**
 * Converts a single quality issue from backend format to SDK model format.
 */
export function convertQualityIssue(issue: AfmQualityIssue): ISemanticQualityIssue {
    const detail = issue.detail as Record<string, unknown>;
    return {
        code: issue.code as SemanticQualityIssueCode,
        severity: issue.severity as SemanticQualityIssueSeverity,
        objects: issue.objects.map((obj) => ({
            type: obj.type as GenAIObjectType,
            identifier: obj.id as Identifier,
        })),
        detail: {
            abbreviation: typeof detail["abbreviation"] === "string" ? detail["abbreviation"] : undefined,
        },
    };
}
