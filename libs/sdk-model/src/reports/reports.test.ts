// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { BuiltInReportPageLayouts } from "./builtinPageLayouts.js";
import { isReportContentV1 } from "./content.js";
import {
    newAdHocReportDefinition,
    newReportContent,
    newReportContentPageFromLayout,
    newReportDefinitionFromTemplate,
    newReportPageLayoutDefinition,
    newReportTemplateDefinition,
    reportContentPage,
} from "./factory.js";
import { type ReportPageLayoutNode, isReportLayoutSlotRef } from "./layout.js";
import {
    type IReportPageBody,
    isReportPageLayout,
    isReportPageLayoutDefinition,
    validateReportPageBody,
} from "./pageLayout.js";
import { isReport, isReportDefinition, isReportTemplate, isReportTemplateDefinition } from "./report.js";
import { isReportImageSlot, isReportSlot, isReportTextSlot, isReportVisualizationSlot } from "./slot.js";
import { getReportTextPlaceholders, resolveReportTextPlaceholders } from "./variables.js";

const body: IReportPageBody = {
    kind: "content",
    layout: {
        type: "section",
        direction: "row",
        children: [
            { type: "slotRef", slotId: "widget", weight: 2 },
            { type: "slotRef", slotId: "summary", weight: 1 },
        ],
    },
    slots: [
        { type: "visualization", localIdentifier: "widget", placeholder: { hint: "Add a visualization" } },
        { type: "text", localIdentifier: "summary", kind: "summary", placeholder: { hint: "Summary" } },
    ],
};

describe("placeholder helpers", () => {
    it("collects distinct placeholders in order of first occurrence", () => {
        expect(getReportTextPlaceholders("{{periodStart}} to {{periodEnd}} ({{periodStart}})")).toEqual([
            "periodStart",
            "periodEnd",
        ]);
    });

    it("ignores malformed markers", () => {
        expect(getReportTextPlaceholders("{{1bad}} {{ spaced }} {{}} {{good_1}}")).toEqual(["good_1"]);
    });

    it("resolves known values and keeps unknown markers", () => {
        expect(resolveReportTextPlaceholders("{{a}} and {{b}}", { a: "1" })).toBe("1 and {{b}}");
    });

    it("does not expand values recursively", () => {
        expect(resolveReportTextPlaceholders("{{a}}", { a: "{{b}}", b: "x" })).toBe("{{b}}");
    });
});

describe("type guards", () => {
    const page = newReportPageLayoutDefinition("Page", body);
    const template = newReportTemplateDefinition(
        "Template",
        newReportContent([newReportContentPageFromLayout(page, "p1")]),
    );
    const report = newReportDefinitionFromTemplate(template, {
        title: "Report",
        periodStart: "2026-01-01",
        periodEnd: "2026-03-31",
    });

    it("distinguishes definitions from saved objects by ref", () => {
        expect(isReportPageLayoutDefinition(page)).toBe(true);
        expect(isReportPageLayout(page)).toBe(false);
        expect(isReportPageLayout({ ...page, ref: { identifier: "p" } })).toBe(true);

        expect(isReportTemplateDefinition(template)).toBe(true);
        expect(isReportTemplate(template)).toBe(false);
        expect(isReportTemplate({ ...template, ref: { identifier: "t" } })).toBe(true);

        expect(isReportDefinition(report)).toBe(true);
        expect(isReport(report)).toBe(false);
        expect(isReport({ ...report, ref: { identifier: "r" } })).toBe(true);
    });

    it("discriminates slot types", () => {
        const [viz, text] = body.slots;
        expect(isReportVisualizationSlot(viz)).toBe(true);
        expect(isReportTextSlot(text)).toBe(true);
        expect(isReportImageSlot(viz)).toBe(false);
        expect(isReportSlot(viz)).toBe(true);
        expect(isReportSlot({})).toBe(false);
    });

    it("recognizes content version 1", () => {
        expect(isReportContentV1(template.content)).toBe(true);
        expect(isReportContentV1({ version: "2", pages: [] })).toBe(false);
    });
});

describe("newReportContentPageFromLayout", () => {
    const page = newReportPageLayoutDefinition("Page", body);

    it("prefixes slot ids and layout slotIds consistently", () => {
        const instance = newReportContentPageFromLayout(page, "p1");

        expect(instance.slots.map((slot) => slot.localIdentifier)).toEqual(["p1_widget", "p1_summary"]);
        expect(validateReportPageBody(instance)).toEqual([]);
    });

    it("keeps repeated instances of one page unique within content", () => {
        const content = newReportContent([
            newReportContentPageFromLayout(page, "p1"),
            newReportContentPageFromLayout(page, "p2"),
        ]);

        const allSlotIds = content.pages.flatMap((contentPage) =>
            contentPage.slots.map((slot) => slot.localIdentifier),
        );
        expect(new Set(allSlotIds).size).toBe(allSlotIds.length);
    });

    it("detaches the clone from the source page", () => {
        const mutablePage = newReportPageLayoutDefinition("Page", JSON.parse(JSON.stringify(body)));
        const instance = newReportContentPageFromLayout(mutablePage, "p1");

        mutablePage.content.slots[0]!.placeholder!.hint = "changed";

        expect(instance.slots[0]!.placeholder!.hint).toBe("Add a visualization");
    });

    it("generates a localIdentifier when none is given", () => {
        const instance = newReportContentPageFromLayout(page);
        expect(instance.localIdentifier).toMatch(/^page_/);
    });
});

describe("newReportDefinitionFromTemplate", () => {
    it("deep-copies content so the report stays frozen", () => {
        const page = newReportPageLayoutDefinition("Page", JSON.parse(JSON.stringify(body)));
        const template = newReportTemplateDefinition(
            "Template",
            newReportContent([newReportContentPageFromLayout(page, "p1")]),
        );
        const report = newReportDefinitionFromTemplate(template, {
            title: "Report",
            periodStart: "2026-01-01",
            periodEnd: "2026-03-31",
        });

        template.content.pages[0]!.slots[0]!.placeholder!.hint = "changed";

        expect(report.content.pages[0]!.slots[0]!.placeholder!.hint).toBe("Add a visualization");
        expect(reportContentPage(report, "p1")).toBeDefined();
    });
});

describe("newAdHocReportDefinition", () => {
    it("creates a report with empty content by default", () => {
        const report = newAdHocReportDefinition({
            title: "Ad hoc",
            periodStart: "2026-01-01",
            periodEnd: "2026-01-31",
        });
        expect(isReportContentV1(report.content)).toBe(true);
        expect(report.content.pages).toEqual([]);
    });
});

describe("validateReportPageBody", () => {
    it("reports duplicate slot ids as errors", () => {
        const invalid: IReportPageBody = {
            ...body,
            slots: [body.slots[0]!, { ...body.slots[1]!, localIdentifier: "widget" }],
        };
        expect(validateReportPageBody(invalid).some((issue) => issue.severity === "error")).toBe(true);
    });

    it("reports non-positive weights as errors", () => {
        const invalid: IReportPageBody = {
            ...body,
            layout: { type: "slotRef", slotId: "widget", weight: 0 },
        };
        expect(validateReportPageBody(invalid).some((issue) => issue.severity === "error")).toBe(true);
    });

    it("reports unresolved and unplaced slots as warnings", () => {
        const withExtras: IReportPageBody = {
            ...body,
            layout: { type: "slotRef", slotId: "missing" },
        };
        const issues = validateReportPageBody(withExtras);
        expect(issues.every((issue) => issue.severity === "warning")).toBe(true);
        expect(issues).toHaveLength(3);
    });
});

describe("BuiltInReportPageLayouts", () => {
    it("contains 15 pages, all flagged and locked", () => {
        expect(BuiltInReportPageLayouts).toHaveLength(15);
        for (const page of BuiltInReportPageLayouts) {
            expect(page.isBuiltIn).toBe(true);
            expect(page.isLocked).toBe(true);
            expect(isReportPageLayout(page)).toBe(true);
        }
    });

    it("every page body is structurally valid", () => {
        for (const page of BuiltInReportPageLayouts) {
            expect(validateReportPageBody(page.content)).toEqual([]);
        }
    });

    it("has unique refs and titles", () => {
        const refIds = BuiltInReportPageLayouts.map((page) => JSON.stringify(page.ref));
        const titles = BuiltInReportPageLayouts.map((page) => page.title);
        expect(new Set(refIds).size).toBe(refIds.length);
        expect(new Set(titles).size).toBe(titles.length);
    });

    it("is deeply frozen", () => {
        for (const layout of BuiltInReportPageLayouts) {
            expect(Object.isFrozen(layout)).toBe(true);
            expect(Object.isFrozen(layout.content)).toBe(true);
            expect(Object.isFrozen(layout.content.slots[0])).toBe(true);
            expect(Object.isFrozen(layout.content.layout)).toBe(true);
        }
    });

    it("summary variants place the summary slot in the layout", () => {
        const withSummary = BuiltInReportPageLayouts.filter((page) =>
            page.content.slots.some((slot) => slot.localIdentifier === "summary"),
        );
        expect(withSummary).toHaveLength(5);
        for (const page of withSummary) {
            const slotIds: string[] = [];
            const visit = (node: ReportPageLayoutNode): void => {
                if (isReportLayoutSlotRef(node)) {
                    slotIds.push(node.slotId);
                } else {
                    node.children.forEach(visit);
                }
            };
            visit(page.content.layout);
            expect(slotIds).toContain("summary");
        }
    });
});
