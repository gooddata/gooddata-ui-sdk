// (C) 2025 GoodData Corporation

import type { GenAIObjectType } from "./common.js";
import type { Identifier } from "../objRef/index.js";

/**
 * Represents a single semantic quality issue report.
 * @internal
 */
export interface ISemanticQualityReport {
    /**
     * List of quality issues detected in the workspace metadata.
     */
    issues: ISemanticQualityIssue[];

    /**
     * Timestamp when the quality issue report was last updated (ISO format)
     */
    updatedAt: string | undefined;

    /**
     * Current status of the quality report calculation.
     * The report can return the previous issues while a new calculation is in progress.
     */
    status: SemanticQualityIssuesCalculationStatus;
}

/**
 * Represents a quality issue detected in workspace metadata.
 * @internal
 */
export interface ISemanticQualityIssue {
    /**
     * Unique code identifying the type of quality issue.
     *
     * @remarks
     * Issue codes correspond to specific quality rules in the detection system. Use this code
     * to determine how to present the issue to users and what remediation steps to suggest.
     */
    code: SemanticQualityIssueCode;

    /**
     * Severity level indicating the impact of this quality issue.
     */
    severity: SemanticQualityIssueSeverity;

    /**
     * List of workspace objects related to this quality issue.
     */
    objects: ISemanticQualityIssueObject[];

    /**
     * Detail of the quality issue.
     */
    detail: ISemanticQualityIssueDetail;
}

/**
 * Code identifying the specific type of semantic quality issue.
 * @internal
 */
export type SemanticQualityIssueCode =
    (typeof SemanticQualityIssueCodeValues)[keyof typeof SemanticQualityIssueCodeValues];

/**
 * Available semantic quality issue codes.
 * @internal
 */
export const SemanticQualityIssueCodeValues = {
    IDENTICAL_TITLE: "IDENTICAL_TITLE",
    IDENTICAL_DESCRIPTION: "IDENTICAL_DESCRIPTION",
    SIMILAR_TITLE: "SIMILAR_TITLE",
    SIMILAR_DESCRIPTION: "SIMILAR_DESCRIPTION",
    UNKNOWN_ABBREVIATION: "UNKNOWN_ABBREVIATION",
} as const;

/**
 * Severity level for semantic quality issues.
 *
 * @remarks
 * - WARNING: Issues that that should be addressed
 * - INFO: Informational notices about potential improvements
 *
 * @internal
 */
export type SemanticQualityIssueSeverity = "WARNING" | "INFO";

/**
 * Order of semantic quality issue severities.
 * @internal
 */
export const SemanticQualityIssueSeverityOrder = {
    INFO: 0,
    WARNING: 1,
} as const satisfies Record<SemanticQualityIssueSeverity, number>;

/**
 * Represents an object related to a quality issue.
 * @internal
 */
export interface ISemanticQualityIssueObject {
    type: GenAIObjectType;
    identifier: Identifier;
    title: string;
}

/**
 * Detail of the quality issue specific to the code.
 * @internal
 */
export interface ISemanticQualityIssueDetail {
    abbreviation?: string;
    attributeName?: SemanticQualityIssueAttributeName;
}

/**
 * Represents the name of the attribute that caused the semantic quality issue.
 * @internal
 */
export type SemanticQualityIssueAttributeName = "TITLE" | "DESCRIPTION";
/**
 * Represents the state of a semantic quality issues calculation.
 * @internal
 */
export interface ISemanticQualityIssuesCalculation {
    /**
     * Current status of the calculation
     */
    status: SemanticQualityIssuesCalculationStatus;
    /**
     * Process ID for tracking the calculation status
     */
    processId?: string;
}

/**
 * Available statuses for a semantic quality issues calculation.
 * @internal
 */
export type SemanticQualityIssuesCalculationStatus = "RUNNING" | "COMPLETED" | "FAILED" | "NOT_FOUND";
