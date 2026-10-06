// (C) 2026 GoodData Corporation

import { createIntl } from "react-intl";
import { describe, expect, it } from "vitest";

import {
    convertGenAiTypeToReferenceType,
    convertReferenceTypeToGenAiType,
    formatReportPeriod,
    generateTitleFromQuestion,
    getReportDraftHref,
    getReportHref,
    getReportItemUrl,
    getReportModifyHref,
    getVisualizationHref,
} from "./utils.js";

describe("generateTitleFromQuestion", () => {
    it("should return trimmed original text when text length is up to 50 characters", () => {
        expect(generateTitleFromQuestion("   short question   ")).toBe("short question");
    });

    it("should normalize whitespace and remove invisible characters", () => {
        expect(generateTitleFromQuestion("  first\n\t\u200Bsecond   third  ")).toBe("first second third");
    });

    it("should truncate to 50 characters and append ellipsis when text is longer", () => {
        const input = `${"a".repeat(50)}extra`;

        expect(generateTitleFromQuestion(input)).toBe(`${"a".repeat(50)}...`);
    });

    it("should extend truncation to the end of reference when cutoff falls inside a reference", () => {
        const prefix = "x".repeat(48);
        const input = `${prefix}{metric/revenue} trailing text`;

        expect(generateTitleFromQuestion(input)).toBe(`${prefix}{metric/revenue}...`);
    });

    it("should extend truncation to nearest closing brace when unmatched reference-like token is cut", () => {
        const prefix = "x".repeat(48);
        const input = `${prefix}{metric/} trailing text`;

        expect(generateTitleFromQuestion(input)).toBe(`${prefix}{metric/}...`);
    });

    it("should sanitize text before truncation and still append ellipsis when truncated", () => {
        const input = `  ${"a".repeat(30)}\n\t${"b".repeat(30)}  `;

        expect(generateTitleFromQuestion(input)).toBe(`${"a".repeat(30)} ${"b".repeat(19)}...`);
    });
});

describe("convertReferenceTypeToGenAiType", () => {
    it("should convert METRIC to metric", () => {
        expect(convertReferenceTypeToGenAiType("METRIC")).toBe("metric");
    });

    it("should convert WIDGET to widget", () => {
        expect(convertReferenceTypeToGenAiType("WIDGET")).toBe("widget");
    });

    it("should convert ATTRIBUTE to attribute", () => {
        expect(convertReferenceTypeToGenAiType("ATTRIBUTE")).toBe("attribute");
    });

    it("should convert DASHBOARD to dashboard", () => {
        expect(convertReferenceTypeToGenAiType("DASHBOARD")).toBe("dashboard");
    });

    it("should return dashboard for unknown types", () => {
        expect(convertReferenceTypeToGenAiType("UNKNOWN" as any)).toBe("dashboard");
    });
});

describe("convertGenAiTypeToReferenceType", () => {
    it("should convert metric to METRIC", () => {
        expect(convertGenAiTypeToReferenceType("metric")).toBe("METRIC");
    });

    it("should convert widget to WIDGET", () => {
        expect(convertGenAiTypeToReferenceType("widget")).toBe("WIDGET");
    });

    it("should convert attribute to ATTRIBUTE", () => {
        expect(convertGenAiTypeToReferenceType("attribute")).toBe("ATTRIBUTE");
    });

    it("should convert dashboard to DASHBOARD", () => {
        expect(convertGenAiTypeToReferenceType("dashboard")).toBe("DASHBOARD");
    });

    it("should return DASHBOARD for unknown types", () => {
        expect(convertGenAiTypeToReferenceType("unknown" as any)).toBe("DASHBOARD");
    });
});

describe("getVisualizationHref", () => {
    it("should return the hosted edit route for a saved visualization", () => {
        expect(getVisualizationHref("ws1", "vis1", "saved")).toBe("/workspace/ws1/analyze/#/vis1/edit");
    });

    it("should carry the AI builder id in the search for a draft visualization", () => {
        expect(getVisualizationHref("ws1", "vis1", "draft")).toBe("/workspace/ws1/analyze/?aibuilder=vis1");
    });
});

describe("getReportHref", () => {
    it("links a saved report inside the reports app", () => {
        expect(getReportHref("ws1", "r1")).toBe("/workspace/ws1/publisher/report/r1");
    });

    it("keeps an id with a slash in one path segment", () => {
        expect(getReportHref("ws1", "r/1")).toBe("/workspace/ws1/publisher/report/r%2F1");
    });
});

describe("getReportDraftHref", () => {
    it("names the conversation and the message the draft is read from", () => {
        expect(getReportDraftHref("ws1", "conv-1", "item-1")).toBe(
            "/workspace/ws1/publisher/new?conversation=conv-1&item=item-1",
        );
    });

    it("encodes ids that are not query-safe", () => {
        expect(getReportDraftHref("ws1", "a&b", "c d")).toBe(
            "/workspace/ws1/publisher/new?conversation=a%26b&item=c+d",
        );
    });
});

describe("getReportModifyHref", () => {
    it("opens the saved report with the draft named in its query", () => {
        expect(
            getReportModifyHref({
                workspaceId: "ws1",
                reportId: "r/1",
                conversationId: "conv-1",
                itemId: "item-1",
            }),
        ).toBe("/workspace/ws1/publisher/report/r%2F1?conversation=conv-1&item=item-1");
    });
});

describe("getReportItemUrl", () => {
    const draftUrl = "/workspace/ws1/publisher/new?conversation=conv-1&item=item-1";
    const modifyUrl = "/workspace/ws1/publisher/report/base-1?conversation=conv-1&item=item-1";

    it("links the draft's changes to the saved report it edits", () => {
        expect(
            getReportItemUrl({
                workspaceId: "ws1",
                baseReportId: "base-1",
                conversationId: "conv-1",
                itemId: "item-1",
            }),
        ).toBe(modifyUrl);
    });

    it("links the report this version was saved as, with the draft", () => {
        expect(
            getReportItemUrl({
                workspaceId: "ws1",
                saved: "r1",
                baseReportId: "base-1",
                conversationId: "conv-1",
                itemId: "item-1",
            }),
        ).toBe("/workspace/ws1/publisher/report/r1?conversation=conv-1&item=item-1");
    });

    it.each([null, ""])("links a new draft when the report it edits is %j", (baseReportId) => {
        expect(
            getReportItemUrl({
                workspaceId: "ws1",
                baseReportId,
                conversationId: "conv-1",
                itemId: "item-1",
            }),
        ).toBe(draftUrl);
    });

    it.each([
        ["an empty conversation id", { conversationId: "", itemId: "item-1" }],
        ["an empty message id", { conversationId: "conv-1", itemId: "" }],
    ])("links no changes to a saved report with %s", (_description, ids) => {
        expect(getReportItemUrl({ workspaceId: "ws1", baseReportId: "base-1", ...ids })).toBeUndefined();
    });

    it("links a saved new report with the draft when the conversation and message are known", () => {
        expect(
            getReportItemUrl({
                workspaceId: "ws1",
                saved: "r1",
                conversationId: "conv-1",
                itemId: "item-1",
            }),
        ).toBe("/workspace/ws1/publisher/report/r1?conversation=conv-1&item=item-1");
    });

    it.each([
        ["an empty conversation id", { conversationId: "", itemId: "item-1" }],
        ["an empty message id", { conversationId: "conv-1", itemId: "" }],
        ["no ids", {}],
    ])("links a saved report without the draft with %s", (_description, ids) => {
        expect(getReportItemUrl({ workspaceId: "ws1", saved: "r1", ...ids })).toBe(
            "/workspace/ws1/publisher/report/r1",
        );
    });

    it("links a draft that names its conversation and message", () => {
        expect(getReportItemUrl({ workspaceId: "ws1", conversationId: "conv-1", itemId: "item-1" })).toBe(
            draftUrl,
        );
    });

    it("links a draft when the saved report is null", () => {
        expect(
            getReportItemUrl({ workspaceId: "ws1", saved: null, conversationId: "conv-1", itemId: "item-1" }),
        ).toBe(draftUrl);
    });

    it.each([
        ["an empty conversation id", { conversationId: "", itemId: "item-1" }],
        ["an empty message id", { conversationId: "conv-1", itemId: "" }],
        ["no conversation id", { itemId: "item-1" }],
        ["no message id", { conversationId: "conv-1" }],
        ["neither id", {}],
    ])("links nothing for a draft with %s", (_description, ids) => {
        expect(getReportItemUrl({ workspaceId: "ws1", ...ids })).toBeUndefined();
    });
});

describe("formatReportPeriod", () => {
    const intl = createIntl({ locale: "en-US" });

    it("writes the period as a range of days", () => {
        expect(formatReportPeriod("2025-07-01", "2025-12-31", intl)).toMatch(/^Jul 1\s*–\s*Dec 31, 2025$/);
    });

    it("keeps the day it was given, whatever the time zone", () => {
        expect(formatReportPeriod("2026-01-01", "2026-01-01", intl)).toContain("Jan 1, 2026");
    });

    it.each([
        ["start", "soon", "2026-03-31"],
        ["end", "2026-01-01", "later"],
    ])("gives nothing when the %s is not a date", (_which, start, end) => {
        expect(formatReportPeriod(start, end, intl)).toBeUndefined();
    });
});
