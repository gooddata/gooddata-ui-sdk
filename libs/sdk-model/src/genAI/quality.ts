// (C) 2025 GoodData Corporation

import type { GenAIObjectType } from "./common.js";
import type { Identifier } from "../objRef/index.js";

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
 * - ERROR: Critical issues that should be addressed immediately
 * - WARNING: Issues that may cause confusion or problems but are not critical
 * - INFO: Informational notices about potential improvements
 *
 * @internal
 */
export type SemanticQualityIssueSeverity = "ERROR" | "WARNING" | "INFO";

/**
 * Represents an object related to a quality issue.
 * @internal
 */
export interface ISemanticQualityIssueObject {
    type: GenAIObjectType;
    identifier: Identifier;
}

/**
 * Detail of the quality issue specific to the code.
 * @internal
 */
export interface ISemanticQualityIssueDetail {
    abbreviation?: string;
}
