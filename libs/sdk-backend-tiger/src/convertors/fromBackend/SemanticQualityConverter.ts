// (C) 2025 GoodData Corporation

import type {
    AfmGetQualityIssuesResponse,
    AfmQualityIssue,
    AfmQualityIssuesCalculationStatusResponseStatusEnum,
    AfmTriggerQualityIssuesCalculationResponse,
} from "@gooddata/api-client-tiger";
import {
    type GenAIObjectType,
    type ISemanticQualityIssue,
    type ISemanticQualityIssuesCalculation,
    type Identifier,
    type SemanticQualityIssueCode,
    type SemanticQualityIssueSeverity,
    type SemanticQualityIssuesCalculationStatus,
    SemanticQualityIssueSeverityOrder as SeverityOrder,
} from "@gooddata/sdk-model";

/**
 * Converts the full quality issues response from backend format to SDK model format.
 */
export function convertQualityIssuesResponse(response: AfmGetQualityIssuesResponse): ISemanticQualityIssue[] {
    if (!response.issues) {
        return [];
    }

    return (
        response.issues
            .map(convertQualityIssue)
            // Sort issues by severity (highest severity first)
            .sort(
                (a, b) =>
                    (SeverityOrder[b.severity] ?? SeverityOrder.INFO) -
                    (SeverityOrder[a.severity] ?? SeverityOrder.INFO),
            )
    );
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
            identifier: obj.id as Identifier,
        })),
        detail: {
            abbreviation: typeof detail["abbreviation"] === "string" ? detail["abbreviation"] : undefined,
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
        status: convertQualityIssuesCalculationStatus(response.status),
        processId: response.processId,
    };
}

/**
 * Converts a quality issues calculation status enum from backend format to SDK model format.
 */
function convertQualityIssuesCalculationStatus(
    status: AfmQualityIssuesCalculationStatusResponseStatusEnum,
): SemanticQualityIssuesCalculationStatus {
    if (status.includes("RUNNING")) {
        return "RUNNING";
    }
    if (status.includes("COMPLETED")) {
        return "COMPLETED";
    }
    if (status.includes("FAILED")) {
        return "FAILED";
    }
    return "NOT_FOUND";
}
