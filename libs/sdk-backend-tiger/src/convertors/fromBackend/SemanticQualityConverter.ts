// (C) 2025-2026 GoodData Corporation

import type {
    AfmGetQualityIssuesResponse,
    AfmQualityIssue,
    AfmTriggerQualityIssuesCalculationResponse,
} from "@gooddata/api-client-tiger";
import {
    type GenAIObjectType,
    type ISemanticQualityIssue,
    type ISemanticQualityIssuesCalculation,
    type ISemanticQualityReport,
    type SemanticQualityIssueAttributeName,
    type SemanticQualityIssueCode,
    type SemanticQualityIssueSeverity,
    SemanticQualityIssueSeverityOrder as SeverityOrder,
} from "@gooddata/sdk-model";

/**
 * Converts the full quality issues response from backend format to SDK model format.
 */
export function convertQualityReportResponse(response: AfmGetQualityIssuesResponse): ISemanticQualityReport {
    const { issues = [], updatedAt, status } = response;
    return {
        issues: issues
            .map(convertQualityIssue)
            // Sort issues by severity (highest severity first)
            .sort(
                (a, b) =>
                    (SeverityOrder[b.severity] ?? SeverityOrder.INFO) -
                    (SeverityOrder[a.severity] ?? SeverityOrder.INFO),
            ),
        updatedAt,
        status,
    };
}

/**
 * Converts a single quality issue from backend format to SDK model format.
 */
export function convertQualityIssue(issue: AfmQualityIssue): ISemanticQualityIssue {
    const detail = issue.detail as Record<string, unknown>;
    return {
        code: issue.code as SemanticQualityIssueCode,
        severity: convertQualityIssueSeverity(issue.severity),
        objects: issue.objects.map((obj) => ({
            type: obj.type as GenAIObjectType,
            identifier: obj.id,
            title: obj.title,
        })),
        detail: {
            abbreviation: typeof detail["abbreviation"] === "string" ? detail["abbreviation"] : undefined,
            attributeName: convertQualityIssueAttributeName(detail["field_name"]),
        },
    };
}

/**
/**
 * Converts a quality issue severity from backend format to SDK model format.
 */
function convertQualityIssueSeverity(severity: AfmQualityIssue["severity"]): SemanticQualityIssueSeverity {
    switch (severity.toUpperCase()) {
        case "ERROR":
        case "WARNING":
            return "WARNING";
        default:
            return "INFO";
    }
}

/**
 * Converts a quality issues calculation trigger response from backend format to SDK model format.
 */
export function convertQualityIssuesCalculationResponse(
    response: AfmTriggerQualityIssuesCalculationResponse,
): ISemanticQualityIssuesCalculation {
    return {
        status: response.status,
        processId: response.processId,
    };
}

/**
 * Converts a quality issue attribute name from backend format to SDK model format.
 */
function convertQualityIssueAttributeName(
    attributeName: unknown,
): SemanticQualityIssueAttributeName | undefined {
    if (typeof attributeName !== "string") {
        return undefined;
    }
    if (attributeName === "title") {
        return "TITLE";
    }
    if (attributeName === "description") {
        return "DESCRIPTION";
    }
    return undefined;
}
