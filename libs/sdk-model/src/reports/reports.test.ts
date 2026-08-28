// (C) 2026 GoodData Corporation

import { assert, describe, expect, it } from "vitest";

import {
    BuiltInReportPageLayoutPortraitCover,
    BuiltInReportPageLayoutPortraitSection,
    BuiltInReportPageLayoutPortraitSummary,
    BuiltInReportPageLayouts,
} from "./builtinPageLayouts.js";
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
    DefaultReportPageFormat,
    ReportPageFormatAspectRatios,
    ReportPageFormats,
    isReportPageFormat,
} from "./pageFormat.js";
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
    it("contains 24 pages, all flagged and locked", () => {
        expect(BuiltInReportPageLayouts).toHaveLength(24);
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

    it("declares a page format on every page", () => {
        for (const page of BuiltInReportPageLayouts) {
            expect(isReportPageFormat(page.content.format)).toBe(true);
        }
    });

    it("offers both widescreen and portrait pages", () => {
        const formats = new Set(BuiltInReportPageLayouts.map((page) => page.content.format));
        expect(formats).toEqual(new Set(["widescreen", "a4Portrait"]));
    });

    it("gives every portrait page a cover, a divider and content variants", () => {
        const portrait = BuiltInReportPageLayouts.filter((page) => page.content.format === "a4Portrait");
        expect(portrait).toHaveLength(9);
        expect(portrait).toContain(BuiltInReportPageLayoutPortraitCover);
        expect(portrait).toContain(BuiltInReportPageLayoutPortraitSection);
        expect(portrait).toContain(BuiltInReportPageLayoutPortraitSummary);
        expect(portrait.map((page) => page.content.kind)).toContain("cover");
        expect(portrait.map((page) => page.content.kind)).toContain("section");
    });

    it("lays portrait content out in a column, never a wide row of visualizations", () => {
        const widestRow = (node: ReportPageLayoutNode): number =>
            isReportLayoutSlotRef(node)
                ? 0
                : Math.max(
                      node.direction === "row" ? node.children.length : 0,
                      ...node.children.map(widestRow),
                  );

        for (const page of BuiltInReportPageLayouts.filter(
            (candidate) => candidate.content.format === "a4Portrait",
        )) {
            // The footer places a logo next to the page number, so two side by side is the floor.
            expect(widestRow(page.content.layout)).toBeLessThanOrEqual(2);
        }
    });

    it("summary variants place the summary slot in the layout", () => {
        const withSummary = BuiltInReportPageLayouts.filter((page) =>
            page.content.slots.some((slot) => slot.localIdentifier === "summary"),
        );
        expect(withSummary).toHaveLength(7);
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

describe("box styling", () => {
    const imageSlot = (localIdentifier: string) =>
        ({ type: "image", localIdentifier, source: { type: "url", url: "https://x/bg.png" } }) as const;

    const body = (overrides: Partial<IReportPageBody>): IReportPageBody => ({
        layout: { type: "slotRef", slotId: "text1" },
        slots: [{ type: "text", localIdentifier: "text1", kind: "body" }],
        ...overrides,
    });

    it("accepts an image background referencing an image slot, counting it as placed", () => {
        const issues = validateReportPageBody(
            body({
                style: { background: { type: "image", slotId: "bg" } },
                slots: [{ type: "text", localIdentifier: "text1", kind: "body" }, imageSlot("bg")],
            }),
        );

        expect(issues).toEqual([]);
    });

    it("warns about a background reference with no slot definition", () => {
        const issues = validateReportPageBody(
            body({ style: { background: { type: "image", slotId: "bg" } } }),
        );

        expect(issues).toEqual([
            expect.objectContaining({ severity: "warning", message: expect.stringContaining('"bg"') }),
        ]);
    });

    it("rejects a background reference to a non-image slot", () => {
        const issues = validateReportPageBody(
            body({ style: { background: { type: "image", slotId: "text1" } } }),
        );

        expect(issues).toEqual([
            expect.objectContaining({
                severity: "error",
                message: expect.stringContaining("not an image slot"),
            }),
        ]);
    });

    it("still reports a slot as unplaced when its only use is an invalid background reference", () => {
        const issues = validateReportPageBody(
            body({
                style: { background: { type: "image", slotId: "orphan" } },
                slots: [
                    { type: "text", localIdentifier: "text1", kind: "body" },
                    { type: "text", localIdentifier: "orphan", kind: "body" },
                ],
            }),
        );

        expect(issues).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    severity: "error",
                    message: expect.stringContaining("not an image slot"),
                }),
                expect.objectContaining({
                    severity: "warning",
                    message: expect.stringContaining('"orphan" is not placed'),
                }),
            ]),
        );
    });

    it("prefixes background references when cloning a page into content", () => {
        const definition = newReportPageLayoutDefinition("Hero", {
            style: { background: { type: "image", slotId: "cover" } },
            layout: {
                type: "section",
                direction: "column",
                style: { background: { type: "image", slotId: "band" } },
                children: [{ type: "slotRef", slotId: "text1" }],
            },
            slots: [
                { type: "text", localIdentifier: "text1", kind: "body" },
                imageSlot("cover"),
                imageSlot("band"),
            ],
        });

        const page = newReportContentPageFromLayout(definition, "p1");

        expect(page.style?.background).toEqual({ type: "image", slotId: "p1_cover" });
        const root = page.layout;
        expect(isReportLayoutSlotRef(root)).toBe(false);
        if (!isReportLayoutSlotRef(root)) {
            expect(root.style?.background).toEqual({ type: "image", slotId: "p1_band" });
        }
        expect(validateReportPageBody(page)).toEqual([]);
    });
});

describe("built-in footers", () => {
    it("pin the logo lower left and the page number lower right", () => {
        for (const layout of BuiltInReportPageLayouts) {
            const logo = layout.content.slots.find((slot) => slot.localIdentifier === "footerLogo");
            const pageNumber = layout.content.slots.find(
                (slot) => slot.localIdentifier === "footerPageNumber",
            );
            assert(isReportImageSlot(logo));
            expect(logo.style).toEqual({ horizontalAlign: "start", verticalAlign: "end" });
            assert(isReportTextSlot(pageNumber));
            expect(pageNumber.style).toEqual({ horizontalAlign: "end", verticalAlign: "end" });
        }
    });
});

describe("ReportPageFormat", () => {
    it("accepts only the known formats", () => {
        for (const format of ReportPageFormats) {
            expect(isReportPageFormat(format)).toBe(true);
        }
        expect(isReportPageFormat("a5Portrait")).toBe(false);
        expect(isReportPageFormat(undefined)).toBe(false);
    });

    it("defaults to the widescreen slide shape", () => {
        expect(DefaultReportPageFormat).toBe("widescreen");
        expect(ReportPageFormatAspectRatios[DefaultReportPageFormat]).toBeGreaterThan(1);
    });

    it("describes the paper formats as upright", () => {
        expect(ReportPageFormatAspectRatios["a4Portrait"]).toBeLessThan(1);
        expect(ReportPageFormatAspectRatios["letterPortrait"]).toBeLessThan(1);
        // Letter is the squarer of the two sheets.
        expect(ReportPageFormatAspectRatios["letterPortrait"]).toBeGreaterThan(
            ReportPageFormatAspectRatios["a4Portrait"],
        );
    });

    it("reports an unknown format on a page body as an error", () => {
        const issues = validateReportPageBody({
            format: "a5Portrait" as never,
            layout: { type: "slotRef", slotId: "title" },
            slots: [{ type: "text", localIdentifier: "title", kind: "title" }],
        });

        expect(issues).toEqual([{ severity: "error", message: 'Unknown page format "a5Portrait".' }]);
    });
});
