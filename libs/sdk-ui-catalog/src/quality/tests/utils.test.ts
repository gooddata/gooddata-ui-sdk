// (C) 2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { ISemanticQualityIssue } from "@gooddata/sdk-model";

import {
    getQualityIssuesHighestSeverity,
    groupQualityIssuesByCode,
    groupQualityIssuesBySeverity,
} from "../utils.js";

describe("getQualityIssuesHighestSeverity", () => {
    it("returns INFO for empty array", () => {
        const severity = getQualityIssuesHighestSeverity([]);
        expect(severity).toBe("INFO");
    });

    it("returns INFO when all issues have INFO severity", () => {
        const issues: ISemanticQualityIssue[] = [
            {
                code: "IDENTICAL_TITLE",
                severity: "INFO",
                objects: [{ type: "attribute", identifier: "attr1" }],
                detail: {},
            },
            {
                code: "SIMILAR_TITLE",
                severity: "INFO",
                objects: [{ type: "attribute", identifier: "attr2" }],
                detail: {},
            },
        ];
        const severity = getQualityIssuesHighestSeverity(issues);
        expect(severity).toBe("INFO");
    });

    it("returns WARNING when all issues have WARNING severity", () => {
        const issues: ISemanticQualityIssue[] = [
            {
                code: "IDENTICAL_TITLE",
                severity: "WARNING",
                objects: [{ type: "attribute", identifier: "attr1" }],
                detail: {},
            },
            {
                code: "SIMILAR_TITLE",
                severity: "WARNING",
                objects: [{ type: "attribute", identifier: "attr2" }],
                detail: {},
            },
        ];
        const severity = getQualityIssuesHighestSeverity(issues);
        expect(severity).toBe("WARNING");
    });

    it("returns WARNING when issues have mixed severities", () => {
        const issues: ISemanticQualityIssue[] = [
            {
                code: "IDENTICAL_TITLE",
                severity: "INFO",
                objects: [{ type: "attribute", identifier: "attr1" }],
                detail: {},
            },
            {
                code: "SIMILAR_TITLE",
                severity: "WARNING",
                objects: [{ type: "attribute", identifier: "attr2" }],
                detail: {},
            },
            {
                code: "UNKNOWN_ABBREVIATION",
                severity: "INFO",
                objects: [{ type: "attribute", identifier: "attr3" }],
                detail: {},
            },
        ];
        const severity = getQualityIssuesHighestSeverity(issues);
        expect(severity).toBe("WARNING");
    });

    it("returns WARNING when WARNING appears first", () => {
        const issues: ISemanticQualityIssue[] = [
            {
                code: "IDENTICAL_TITLE",
                severity: "WARNING",
                objects: [{ type: "attribute", identifier: "attr1" }],
                detail: {},
            },
            {
                code: "SIMILAR_TITLE",
                severity: "INFO",
                objects: [{ type: "attribute", identifier: "attr2" }],
                detail: {},
            },
        ];
        const severity = getQualityIssuesHighestSeverity(issues);
        expect(severity).toBe("WARNING");
    });

    it("returns WARNING when WARNING appears last", () => {
        const issues: ISemanticQualityIssue[] = [
            {
                code: "IDENTICAL_TITLE",
                severity: "INFO",
                objects: [{ type: "attribute", identifier: "attr1" }],
                detail: {},
            },
            {
                code: "SIMILAR_TITLE",
                severity: "INFO",
                objects: [{ type: "attribute", identifier: "attr2" }],
                detail: {},
            },
            {
                code: "UNKNOWN_ABBREVIATION",
                severity: "WARNING",
                objects: [{ type: "attribute", identifier: "attr3" }],
                detail: {},
            },
        ];
        const severity = getQualityIssuesHighestSeverity(issues);
        expect(severity).toBe("WARNING");
    });

    it("returns WARNING with single WARNING issue", () => {
        const issues: ISemanticQualityIssue[] = [
            {
                code: "IDENTICAL_TITLE",
                severity: "WARNING",
                objects: [{ type: "attribute", identifier: "attr1" }],
                detail: {},
            },
        ];
        const severity = getQualityIssuesHighestSeverity(issues);
        expect(severity).toBe("WARNING");
    });

    it("returns INFO with single INFO issue", () => {
        const issues: ISemanticQualityIssue[] = [
            {
                code: "IDENTICAL_TITLE",
                severity: "INFO",
                objects: [{ type: "attribute", identifier: "attr1" }],
                detail: {},
            },
        ];
        const severity = getQualityIssuesHighestSeverity(issues);
        expect(severity).toBe("INFO");
    });
});

describe("groupQualityIssuesByCode", () => {
    it("returns empty map for empty array", () => {
        const grouped = groupQualityIssuesByCode([]);
        expect(grouped.size).toBe(0);
    });

    it("groups single issue", () => {
        const issues: ISemanticQualityIssue[] = [
            {
                code: "IDENTICAL_TITLE",
                severity: "INFO",
                objects: [{ type: "attribute", identifier: "attr1" }],
                detail: {},
            },
        ];
        const grouped = groupQualityIssuesByCode(issues);

        expect(grouped.size).toBe(1);
        expect(grouped.get("IDENTICAL_TITLE")).toHaveLength(1);
        expect(grouped.get("IDENTICAL_TITLE")?.[0]).toBe(issues[0]);
    });

    it("groups multiple issues with same code", () => {
        const issues: ISemanticQualityIssue[] = [
            {
                code: "IDENTICAL_TITLE",
                severity: "INFO",
                objects: [{ type: "attribute", identifier: "attr1" }],
                detail: {},
            },
            {
                code: "IDENTICAL_TITLE",
                severity: "INFO",
                objects: [{ type: "attribute", identifier: "attr2" }],
                detail: {},
            },
            {
                code: "IDENTICAL_TITLE",
                severity: "WARNING",
                objects: [{ type: "attribute", identifier: "attr3" }],
                detail: {},
            },
        ];
        const grouped = groupQualityIssuesByCode(issues);

        expect(grouped.size).toBe(1);
        expect(grouped.get("IDENTICAL_TITLE")).toHaveLength(3);
        expect(grouped.get("IDENTICAL_TITLE")).toEqual(issues);
    });

    it("groups mixed issues correctly", () => {
        const issues: ISemanticQualityIssue[] = [
            {
                code: "IDENTICAL_TITLE",
                severity: "INFO",
                objects: [{ type: "attribute", identifier: "attr1" }],
                detail: {},
            },
            {
                code: "SIMILAR_TITLE",
                severity: "WARNING",
                objects: [{ type: "attribute", identifier: "attr2" }],
                detail: {},
            },
            {
                code: "IDENTICAL_TITLE",
                severity: "INFO",
                objects: [{ type: "attribute", identifier: "attr3" }],
                detail: {},
            },
            {
                code: "UNKNOWN_ABBREVIATION",
                severity: "INFO",
                objects: [{ type: "attribute", identifier: "attr4" }],
                detail: {},
            },
            {
                code: "SIMILAR_TITLE",
                severity: "INFO",
                objects: [{ type: "attribute", identifier: "attr5" }],
                detail: {},
            },
        ];
        const grouped = groupQualityIssuesByCode(issues);

        expect(grouped.size).toBe(3);
        expect(grouped.get("IDENTICAL_TITLE")).toHaveLength(2);
        expect(grouped.get("SIMILAR_TITLE")).toHaveLength(2);
        expect(grouped.get("UNKNOWN_ABBREVIATION")).toHaveLength(1);
    });

    it("preserves order of issues within each group", () => {
        const issues: ISemanticQualityIssue[] = [
            {
                code: "IDENTICAL_TITLE",
                severity: "INFO",
                objects: [{ type: "attribute", identifier: "attr1" }],
                detail: {},
            },
            {
                code: "IDENTICAL_TITLE",
                severity: "WARNING",
                objects: [{ type: "attribute", identifier: "attr2" }],
                detail: {},
            },
            {
                code: "IDENTICAL_TITLE",
                severity: "INFO",
                objects: [{ type: "attribute", identifier: "attr3" }],
                detail: {},
            },
        ];

        const grouped = groupQualityIssuesByCode(issues);
        const identicalTitleGroup = grouped.get("IDENTICAL_TITLE");

        expect(identicalTitleGroup).toEqual(issues);
    });

    it("handles issues with different object types", () => {
        const issues: ISemanticQualityIssue[] = [
            {
                code: "IDENTICAL_TITLE",
                severity: "INFO",
                objects: [{ type: "attribute", identifier: "attr1" }],
                detail: {},
            },
            {
                code: "IDENTICAL_TITLE",
                severity: "WARNING",
                objects: [{ type: "metric", identifier: "metric1" }],
                detail: {},
            },
        ];
        const grouped = groupQualityIssuesByCode(issues);

        expect(grouped.size).toBe(1);
        expect(grouped.get("IDENTICAL_TITLE")).toHaveLength(2);
    });

    it("handles issues with multiple objects", () => {
        const issues: ISemanticQualityIssue[] = [
            {
                code: "IDENTICAL_TITLE",
                severity: "INFO",
                objects: [
                    { type: "attribute", identifier: "attr1" },
                    { type: "attribute", identifier: "attr2" },
                ],
                detail: {},
            },
        ];
        const grouped = groupQualityIssuesByCode(issues);

        expect(grouped.size).toBe(1);
        expect(grouped.get("IDENTICAL_TITLE")).toHaveLength(1);
        expect(grouped.get("IDENTICAL_TITLE")?.[0]?.objects).toHaveLength(2);
    });
});

describe("groupQualityIssuesBySeverity", () => {
    it("returns empty map for empty array", () => {
        const grouped = groupQualityIssuesBySeverity([]);
        expect(grouped.size).toBe(0);
    });

    it("groups single issue", () => {
        const issues: ISemanticQualityIssue[] = [
            {
                code: "IDENTICAL_TITLE",
                severity: "INFO",
                objects: [{ type: "attribute", identifier: "attr1" }],
                detail: {},
            },
        ];
        const grouped = groupQualityIssuesBySeverity(issues);

        expect(grouped.size).toBe(1);
        expect(grouped.get("INFO")).toHaveLength(1);
        expect(grouped.get("INFO")?.[0]).toBe(issues[0]);
    });

    it("groups multiple issues with same severity", () => {
        const issues: ISemanticQualityIssue[] = [
            {
                code: "IDENTICAL_TITLE",
                severity: "INFO",
                objects: [{ type: "attribute", identifier: "attr1" }],
                detail: {},
            },
            {
                code: "SIMILAR_TITLE",
                severity: "INFO",
                objects: [{ type: "attribute", identifier: "attr2" }],
                detail: {},
            },
            {
                code: "UNKNOWN_ABBREVIATION",
                severity: "INFO",
                objects: [{ type: "attribute", identifier: "attr3" }],
                detail: {},
            },
        ];
        const grouped = groupQualityIssuesBySeverity(issues);

        expect(grouped.size).toBe(1);
        expect(grouped.get("INFO")).toHaveLength(3);
        expect(grouped.get("INFO")).toEqual(issues);
    });

    it("groups mixed issues correctly", () => {
        const issues: ISemanticQualityIssue[] = [
            {
                code: "IDENTICAL_TITLE",
                severity: "INFO",
                objects: [{ type: "attribute", identifier: "attr1" }],
                detail: {},
            },
            {
                code: "SIMILAR_TITLE",
                severity: "WARNING",
                objects: [{ type: "attribute", identifier: "attr2" }],
                detail: {},
            },
            {
                code: "IDENTICAL_TITLE",
                severity: "INFO",
                objects: [{ type: "attribute", identifier: "attr3" }],
                detail: {},
            },
            {
                code: "UNKNOWN_ABBREVIATION",
                severity: "WARNING",
                objects: [{ type: "attribute", identifier: "attr4" }],
                detail: {},
            },
            {
                code: "SIMILAR_TITLE",
                severity: "INFO",
                objects: [{ type: "attribute", identifier: "attr5" }],
                detail: {},
            },
        ];
        const grouped = groupQualityIssuesBySeverity(issues);

        expect(grouped.size).toBe(2);
        expect(grouped.get("INFO")).toHaveLength(3);
        expect(grouped.get("WARNING")).toHaveLength(2);
    });

    it("preserves order of issues within each group", () => {
        const issues: ISemanticQualityIssue[] = [
            {
                code: "IDENTICAL_TITLE",
                severity: "INFO",
                objects: [{ type: "attribute", identifier: "attr1" }],
                detail: {},
            },
            {
                code: "SIMILAR_TITLE",
                severity: "WARNING",
                objects: [{ type: "attribute", identifier: "attr2" }],
                detail: {},
            },
            {
                code: "UNKNOWN_ABBREVIATION",
                severity: "INFO",
                objects: [{ type: "attribute", identifier: "attr3" }],
                detail: {},
            },
            {
                code: "SIMILAR_TITLE",
                severity: "WARNING",
                objects: [{ type: "attribute", identifier: "attr4" }],
                detail: {},
            },
        ];

        const grouped = groupQualityIssuesBySeverity(issues);
        const infoGroup = grouped.get("INFO");
        const warningGroup = grouped.get("WARNING");

        expect(infoGroup).toEqual([issues[0], issues[2]]);
        expect(warningGroup).toEqual([issues[1], issues[3]]);
    });

    it("handles issues with different codes but same severity", () => {
        const issues: ISemanticQualityIssue[] = [
            {
                code: "IDENTICAL_TITLE",
                severity: "WARNING",
                objects: [{ type: "attribute", identifier: "attr1" }],
                detail: {},
            },
            {
                code: "SIMILAR_TITLE",
                severity: "WARNING",
                objects: [{ type: "metric", identifier: "metric1" }],
                detail: {},
            },
            {
                code: "UNKNOWN_ABBREVIATION",
                severity: "WARNING",
                objects: [{ type: "attribute", identifier: "attr2" }],
                detail: {},
            },
        ];
        const grouped = groupQualityIssuesBySeverity(issues);

        expect(grouped.size).toBe(1);
        expect(grouped.get("WARNING")).toHaveLength(3);
        expect(grouped.get("WARNING")).toEqual(issues);
    });

    it("handles issues with multiple objects", () => {
        const issues: ISemanticQualityIssue[] = [
            {
                code: "IDENTICAL_TITLE",
                severity: "WARNING",
                objects: [
                    { type: "attribute", identifier: "attr1" },
                    { type: "attribute", identifier: "attr2" },
                ],
                detail: {},
            },
        ];
        const grouped = groupQualityIssuesBySeverity(issues);

        expect(grouped.size).toBe(1);
        expect(grouped.get("WARNING")).toHaveLength(1);
        expect(grouped.get("WARNING")?.[0]?.objects).toHaveLength(2);
    });

    it("groups all severity levels correctly", () => {
        const issues: ISemanticQualityIssue[] = [
            {
                code: "IDENTICAL_TITLE",
                severity: "INFO",
                objects: [{ type: "attribute", identifier: "attr1" }],
                detail: {},
            },
            {
                code: "SIMILAR_TITLE",
                severity: "WARNING",
                objects: [{ type: "attribute", identifier: "attr2" }],
                detail: {},
            },
        ];
        const grouped = groupQualityIssuesBySeverity(issues);

        expect(grouped.size).toBe(2);
        expect(grouped.has("INFO")).toBe(true);
        expect(grouped.has("WARNING")).toBe(true);
        expect(grouped.get("INFO")).toHaveLength(1);
        expect(grouped.get("WARNING")).toHaveLength(1);
    });
});
