// (C) 2026 GoodData Corporation

import { assert, describe, expect, it } from "vitest";

import {
    BuiltInPublisherPageLayoutPortraitCover,
    BuiltInPublisherPageLayoutPortraitSection,
    BuiltInPublisherPageLayoutPortraitSummary,
    BuiltInPublisherPageLayouts,
} from "./builtinPageLayouts.js";
import { isPublisherDocumentContentV1 } from "./content.js";
import {
    isPublisherDocument,
    isPublisherDocumentDefinition,
    isPublisherDocumentTemplate,
    isPublisherDocumentTemplateDefinition,
} from "./document.js";
import {
    newAdHocPublisherDocumentDefinition,
    newPublisherDocumentContent,
    newPublisherDocumentDefinitionFromTemplate,
    newPublisherDocumentPageFromLayout,
    newPublisherDocumentTemplateDefinition,
    newPublisherPageLayoutDefinition,
    publisherDocumentPage,
} from "./factory.js";
import { type PublisherPageLayoutNode, isPublisherLayoutSlotRef } from "./layout.js";
import {
    DefaultPublisherPageFormat,
    PublisherPageFormatAspectRatios,
    PublisherPageFormats,
    isPublisherPageFormat,
} from "./pageFormat.js";
import {
    type IPublisherPageBody,
    isPublisherPageLayout,
    isPublisherPageLayoutDefinition,
    validatePublisherPageBody,
} from "./pageLayout.js";
import {
    isPublisherImageSlot,
    isPublisherSlot,
    isPublisherTextSlot,
    isPublisherVisualizationSlot,
} from "./slot.js";
import {
    getPublisherTextPlaceholders,
    publisherTextPlaceholder,
    resolvePublisherTextPlaceholders,
} from "./variables.js";

const body: IPublisherPageBody = {
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
        { type: "paragraph", localIdentifier: "summary", placeholder: { hint: "Summary" } },
    ],
};

describe("placeholder helpers", () => {
    it("collects distinct placeholders in order of first occurrence", () => {
        expect(getPublisherTextPlaceholders("{periodStart} to {periodEnd} ({periodStart})")).toEqual([
            "periodStart",
            "periodEnd",
        ]);
    });

    it("ignores malformed markers", () => {
        expect(getPublisherTextPlaceholders("{1bad} { spaced } {} {good_1}")).toEqual(["good_1"]);
    });

    it("resolves a marker inside braces, leaving the braces in place", () => {
        expect(getPublisherTextPlaceholders("{{periodStart}}")).toEqual(["periodStart"]);
        expect(resolvePublisherTextPlaceholders("{{a}}", { a: "1" })).toBe("{1}");
    });

    it("reads markers written back to back", () => {
        expect(getPublisherTextPlaceholders("{a}{b}")).toEqual(["a", "b"]);
        expect(resolvePublisherTextPlaceholders("{a}{b}", { a: "1", b: "2" })).toBe("12");
    });

    it("builds a marker the collector reads back", () => {
        expect(getPublisherTextPlaceholders(publisherTextPlaceholder("periodStart"))).toEqual([
            "periodStart",
        ]);
    });

    it("resolves known values and keeps unknown markers", () => {
        expect(resolvePublisherTextPlaceholders("{a} and {b}", { a: "1" })).toBe("1 and {b}");
    });

    it("does not expand values recursively", () => {
        expect(resolvePublisherTextPlaceholders("{a}", { a: "{b}", b: "x" })).toBe("{b}");
    });
});

describe("type guards", () => {
    const page = newPublisherPageLayoutDefinition("Page", body);
    const template = newPublisherDocumentTemplateDefinition(
        "Template",
        newPublisherDocumentContent([newPublisherDocumentPageFromLayout(page, "p1")]),
    );
    const publisherDocument = newPublisherDocumentDefinitionFromTemplate(template, {
        title: "Report",
        periodStart: "2026-01-01",
        periodEnd: "2026-03-31",
    });

    it("distinguishes definitions from saved objects by ref", () => {
        expect(isPublisherPageLayoutDefinition(page)).toBe(true);
        expect(isPublisherPageLayout(page)).toBe(false);
        expect(isPublisherPageLayout({ ...page, ref: { identifier: "p" } })).toBe(true);

        expect(isPublisherDocumentTemplateDefinition(template)).toBe(true);
        expect(isPublisherDocumentTemplate(template)).toBe(false);
        expect(isPublisherDocumentTemplate({ ...template, ref: { identifier: "t" } })).toBe(true);

        expect(isPublisherDocumentDefinition(publisherDocument)).toBe(true);
        expect(isPublisherDocument(publisherDocument)).toBe(false);
        expect(isPublisherDocument({ ...publisherDocument, ref: { identifier: "r" } })).toBe(true);
    });

    it("discriminates slot types", () => {
        const [viz, text] = body.slots;
        expect(isPublisherVisualizationSlot(viz)).toBe(true);
        expect(isPublisherTextSlot(text)).toBe(true);
        expect(isPublisherImageSlot(viz)).toBe(false);
        expect(isPublisherSlot(viz)).toBe(true);
        expect(isPublisherSlot({})).toBe(false);
    });

    it("recognizes content version 1", () => {
        expect(isPublisherDocumentContentV1(template.content)).toBe(true);
        expect(isPublisherDocumentContentV1({ version: "2", pages: [] })).toBe(false);
    });
});

describe("newPublisherDocumentPageFromLayout", () => {
    const page = newPublisherPageLayoutDefinition("Page", body);

    it("prefixes slot ids and layout slotIds consistently", () => {
        const instance = newPublisherDocumentPageFromLayout(page, "p1");

        expect(instance.slots.map((slot) => slot.localIdentifier)).toEqual(["p1_widget", "p1_summary"]);
        expect(validatePublisherPageBody(instance)).toEqual([]);
    });

    it("keeps repeated instances of one page unique within content", () => {
        const content = newPublisherDocumentContent([
            newPublisherDocumentPageFromLayout(page, "p1"),
            newPublisherDocumentPageFromLayout(page, "p2"),
        ]);

        const allSlotIds = content.pages.flatMap((contentPage) =>
            contentPage.slots.map((slot) => slot.localIdentifier),
        );
        expect(new Set(allSlotIds).size).toBe(allSlotIds.length);
    });

    it("detaches the clone from the source page", () => {
        const mutablePage = newPublisherPageLayoutDefinition("Page", JSON.parse(JSON.stringify(body)));
        const instance = newPublisherDocumentPageFromLayout(mutablePage, "p1");

        mutablePage.content.slots[0]!.placeholder!.hint = "changed";

        expect(instance.slots[0]!.placeholder!.hint).toBe("Add a visualization");
    });

    it("generates a localIdentifier when none is given", () => {
        const instance = newPublisherDocumentPageFromLayout(page);
        expect(instance.localIdentifier).toMatch(/^page_/);
    });
});

describe("newPublisherDocumentDefinitionFromTemplate", () => {
    it("deep-copies content so the document stays frozen", () => {
        const page = newPublisherPageLayoutDefinition("Page", JSON.parse(JSON.stringify(body)));
        const template = newPublisherDocumentTemplateDefinition(
            "Template",
            newPublisherDocumentContent([newPublisherDocumentPageFromLayout(page, "p1")]),
        );
        const publisherDocument = newPublisherDocumentDefinitionFromTemplate(template, {
            title: "Report",
            periodStart: "2026-01-01",
            periodEnd: "2026-03-31",
        });

        template.content.pages[0]!.slots[0]!.placeholder!.hint = "changed";

        expect(publisherDocument.content.pages[0]!.slots[0]!.placeholder!.hint).toBe("Add a visualization");
        expect(publisherDocumentPage(publisherDocument, "p1")).toBeDefined();
    });
});

describe("newAdHocPublisherDocumentDefinition", () => {
    it("creates a document with empty content by default", () => {
        const publisherDocument = newAdHocPublisherDocumentDefinition({
            title: "Ad hoc",
            periodStart: "2026-01-01",
            periodEnd: "2026-01-31",
        });
        expect(isPublisherDocumentContentV1(publisherDocument.content)).toBe(true);
        expect(publisherDocument.content.pages).toEqual([]);
    });
});

describe("validatePublisherPageBody", () => {
    it("reports duplicate slot ids as errors", () => {
        const invalid: IPublisherPageBody = {
            ...body,
            slots: [body.slots[0]!, { ...body.slots[1]!, localIdentifier: "widget" }],
        };
        expect(validatePublisherPageBody(invalid).some((issue) => issue.severity === "error")).toBe(true);
    });

    it("reports non-positive weights as errors", () => {
        const invalid: IPublisherPageBody = {
            ...body,
            layout: { type: "slotRef", slotId: "widget", weight: 0 },
        };
        expect(validatePublisherPageBody(invalid).some((issue) => issue.severity === "error")).toBe(true);
    });

    it("reports unresolved and unplaced slots as warnings", () => {
        const withExtras: IPublisherPageBody = {
            ...body,
            layout: { type: "slotRef", slotId: "missing" },
        };
        const issues = validatePublisherPageBody(withExtras);
        expect(issues.every((issue) => issue.severity === "warning")).toBe(true);
        expect(issues).toHaveLength(3);
    });
});

describe("BuiltInPublisherPageLayouts", () => {
    it("contains 25 pages, all flagged and locked", () => {
        expect(BuiltInPublisherPageLayouts).toHaveLength(25);
        for (const page of BuiltInPublisherPageLayouts) {
            expect(page.isBuiltIn).toBe(true);
            expect(page.isLocked).toBe(true);
            expect(isPublisherPageLayout(page)).toBe(true);
        }
    });

    it("every page body is structurally valid", () => {
        for (const page of BuiltInPublisherPageLayouts) {
            expect(validatePublisherPageBody(page.content)).toEqual([]);
        }
    });

    it("has unique refs and titles", () => {
        const refIds = BuiltInPublisherPageLayouts.map((page) => JSON.stringify(page.ref));
        const titles = BuiltInPublisherPageLayouts.map((page) => page.title);
        expect(new Set(refIds).size).toBe(refIds.length);
        expect(new Set(titles).size).toBe(titles.length);
    });

    it("is deeply frozen", () => {
        for (const layout of BuiltInPublisherPageLayouts) {
            expect(Object.isFrozen(layout)).toBe(true);
            expect(Object.isFrozen(layout.content)).toBe(true);
            expect(Object.isFrozen(layout.content.slots[0])).toBe(true);
            expect(Object.isFrozen(layout.content.layout)).toBe(true);
        }
    });

    it("declares a page format on every page", () => {
        for (const page of BuiltInPublisherPageLayouts) {
            expect(isPublisherPageFormat(page.content.format)).toBe(true);
        }
    });

    it("offers both widescreen and portrait pages", () => {
        const formats = new Set(BuiltInPublisherPageLayouts.map((page) => page.content.format));
        expect(formats).toEqual(new Set(["widescreen", "a4Portrait"]));
    });

    it("gives every portrait page a cover, a divider and content variants", () => {
        const portrait = BuiltInPublisherPageLayouts.filter((page) => page.content.format === "a4Portrait");
        expect(portrait).toHaveLength(9);
        expect(portrait).toContain(BuiltInPublisherPageLayoutPortraitCover);
        expect(portrait).toContain(BuiltInPublisherPageLayoutPortraitSection);
        expect(portrait).toContain(BuiltInPublisherPageLayoutPortraitSummary);
        expect(portrait.map((page) => page.content.kind)).toContain("cover");
        expect(portrait.map((page) => page.content.kind)).toContain("section");
    });

    it("lays portrait content out in a column, never a wide row of visualizations", () => {
        const widestRow = (node: PublisherPageLayoutNode): number =>
            isPublisherLayoutSlotRef(node)
                ? 0
                : Math.max(
                      node.direction === "row" ? node.children.length : 0,
                      ...node.children.map(widestRow),
                  );

        for (const page of BuiltInPublisherPageLayouts.filter(
            (candidate) => candidate.content.format === "a4Portrait",
        )) {
            // The footer places a logo next to the page number, so two side by side is the floor.
            expect(widestRow(page.content.layout)).toBeLessThanOrEqual(2);
        }
    });

    it("summary variants place the summary slot in the layout", () => {
        const withSummary = BuiltInPublisherPageLayouts.filter((page) =>
            page.content.slots.some((slot) => slot.localIdentifier === "summary"),
        );
        expect(withSummary).toHaveLength(8);
        for (const page of withSummary) {
            const slotIds: string[] = [];
            const visit = (node: PublisherPageLayoutNode): void => {
                if (isPublisherLayoutSlotRef(node)) {
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

    const body = (overrides: Partial<IPublisherPageBody>): IPublisherPageBody => ({
        layout: { type: "slotRef", slotId: "text1" },
        slots: [{ type: "paragraph", localIdentifier: "text1" }],
        ...overrides,
    });

    it("accepts an image background referencing an image slot, counting it as placed", () => {
        const issues = validatePublisherPageBody(
            body({
                style: { background: { type: "image", slotId: "bg" } },
                slots: [{ type: "paragraph", localIdentifier: "text1" }, imageSlot("bg")],
            }),
        );

        expect(issues).toEqual([]);
    });

    it("warns about a background reference with no slot definition", () => {
        const issues = validatePublisherPageBody(
            body({ style: { background: { type: "image", slotId: "bg" } } }),
        );

        expect(issues).toEqual([
            expect.objectContaining({ severity: "warning", message: expect.stringContaining('"bg"') }),
        ]);
    });

    it("rejects a background reference to a non-image slot", () => {
        const issues = validatePublisherPageBody(
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
        const issues = validatePublisherPageBody(
            body({
                style: { background: { type: "image", slotId: "orphan" } },
                slots: [
                    { type: "paragraph", localIdentifier: "text1" },
                    { type: "paragraph", localIdentifier: "orphan" },
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

    it("accepts a zero and a fractional corner radius", () => {
        expect(validatePublisherPageBody(body({ style: { borderRadius: 0 } }))).toEqual([]);
        expect(
            validatePublisherPageBody(
                body({
                    layout: {
                        type: "section",
                        direction: "row",
                        style: { borderRadius: 1.5 },
                        children: [{ type: "slotRef", slotId: "text1" }],
                    },
                }),
            ),
        ).toEqual([]);
    });

    it("accepts a text slot painting its own box", () => {
        const issues = validatePublisherPageBody(
            body({
                style: undefined,
                layout: {
                    type: "section",
                    direction: "row",
                    children: [{ type: "slotRef", slotId: "text1" }],
                },
                slots: [
                    {
                        type: "paragraph",
                        localIdentifier: "text1",
                        style: { background: { type: "image", slotId: "bg" }, borderRadius: 1 },
                    },
                    imageSlot("bg"),
                ],
            }),
        );

        expect(issues).toEqual([]);
    });

    it("does not count a background reference from a slot the layout never places", () => {
        const issues = validatePublisherPageBody(
            body({
                slots: [
                    { type: "paragraph", localIdentifier: "text1" },
                    {
                        type: "paragraph",
                        localIdentifier: "orphan",
                        style: { background: { type: "image", slotId: "bg" } },
                    },
                    imageSlot("bg"),
                ],
            }),
        );

        expect(issues).toEqual([
            expect.objectContaining({
                severity: "warning",
                message: expect.stringContaining('"orphan" is not placed'),
            }),
            expect.objectContaining({
                severity: "warning",
                message: expect.stringContaining('"bg" is not placed'),
            }),
        ]);
    });

    it("counts a background named by both a placed and an unplaced slot", () => {
        const issues = validatePublisherPageBody(
            body({
                layout: {
                    type: "section",
                    direction: "row",
                    children: [{ type: "slotRef", slotId: "text1" }],
                },
                slots: [
                    {
                        type: "paragraph",
                        localIdentifier: "text1",
                        style: { background: { type: "image", slotId: "bg" } },
                    },
                    {
                        type: "paragraph",
                        localIdentifier: "orphan",
                        style: { background: { type: "image", slotId: "bg" } },
                    },
                    imageSlot("bg"),
                ],
            }),
        );

        expect(issues).toEqual([
            expect.objectContaining({
                severity: "warning",
                message: expect.stringContaining('"orphan" is not placed'),
            }),
        ]);
    });

    it("checks the box of a text slot the layout never places", () => {
        const issues = validatePublisherPageBody(
            body({
                slots: [
                    { type: "paragraph", localIdentifier: "text1" },
                    { type: "paragraph", localIdentifier: "orphan", style: { borderRadius: -5 } },
                ],
            }),
        );

        expect(issues).toEqual([
            expect.objectContaining({
                severity: "error",
                message: expect.stringContaining("Border radius"),
            }),
            expect.objectContaining({
                severity: "warning",
                message: expect.stringContaining('"orphan" is not placed'),
            }),
        ]);
    });

    it("rejects a text slot's background reference to a non-image slot", () => {
        const issues = validatePublisherPageBody(
            body({
                slots: [
                    {
                        type: "paragraph",
                        localIdentifier: "text1",
                        style: { background: { type: "image", slotId: "text1" } },
                    },
                ],
            }),
        );

        expect(issues).toEqual([
            expect.objectContaining({
                severity: "error",
                message: expect.stringContaining("not an image slot"),
            }),
        ]);
    });

    it("rejects a negative corner radius on a text slot", () => {
        const issues = validatePublisherPageBody(
            body({
                slots: [
                    {
                        type: "paragraph",
                        localIdentifier: "text1",
                        style: { borderRadius: -1 },
                    },
                ],
            }),
        );

        expect(issues).toEqual([
            expect.objectContaining({
                severity: "error",
                message: expect.stringContaining("Border radius"),
            }),
        ]);
    });

    it("accepts a valid padding and rejects one that is negative, infinite or not a number", () => {
        expect(validatePublisherPageBody(body({ style: { padding: 0 } }))).toEqual([]);
        expect(validatePublisherPageBody(body({ style: { padding: 2.5 } }))).toEqual([]);
        for (const padding of [-1, Number.POSITIVE_INFINITY, Number.NaN]) {
            expect(validatePublisherPageBody(body({ style: { padding } }))).toEqual([
                expect.objectContaining({
                    severity: "error",
                    message: expect.stringContaining("Padding"),
                }),
            ]);
        }
    });

    it("rejects a corner radius that is negative, infinite or not a number", () => {
        for (const borderRadius of [-1, Number.POSITIVE_INFINITY, Number.NaN]) {
            expect(validatePublisherPageBody(body({ style: { borderRadius } }))).toEqual([
                expect.objectContaining({
                    severity: "error",
                    message: expect.stringContaining("Border radius"),
                }),
            ]);
        }
        expect(
            validatePublisherPageBody(
                body({
                    layout: {
                        type: "section",
                        direction: "row",
                        style: { borderRadius: -1 },
                        children: [{ type: "slotRef", slotId: "text1" }],
                    },
                }),
            ),
        ).toEqual([
            expect.objectContaining({
                severity: "error",
                message: expect.stringContaining("Border radius"),
            }),
        ]);
    });

    it("prefixes background references when cloning a page into content", () => {
        const definition = newPublisherPageLayoutDefinition("Hero", {
            style: { background: { type: "image", slotId: "cover" } },
            layout: {
                type: "section",
                direction: "column",
                style: { background: { type: "image", slotId: "band" } },
                children: [{ type: "slotRef", slotId: "text1" }],
            },
            slots: [{ type: "paragraph", localIdentifier: "text1" }, imageSlot("cover"), imageSlot("band")],
        });

        const page = newPublisherDocumentPageFromLayout(definition, "p1");

        expect(page.style?.background).toEqual({ type: "image", slotId: "p1_cover" });
        const root = page.layout;
        expect(isPublisherLayoutSlotRef(root)).toBe(false);
        if (!isPublisherLayoutSlotRef(root)) {
            expect(root.style?.background).toEqual({ type: "image", slotId: "p1_band" });
        }
        expect(validatePublisherPageBody(page)).toEqual([]);
    });
});

describe("built-in footers", () => {
    it("pin the logo lower left and the page number lower right", () => {
        for (const layout of BuiltInPublisherPageLayouts) {
            const logo = layout.content.slots.find((slot) => slot.localIdentifier === "footerLogo");
            const pageNumber = layout.content.slots.find(
                (slot) => slot.localIdentifier === "footerPageNumber",
            );
            assert(isPublisherImageSlot(logo));
            expect(logo.style).toEqual({ horizontalAlign: "start", verticalAlign: "end" });
            assert(isPublisherTextSlot(pageNumber));
            expect(pageNumber.style).toEqual({
                type: "largeText",
                horizontalAlign: "end",
                verticalAlign: "end",
            });
        }
    });
});

describe("PublisherPageFormat", () => {
    it("accepts only the known formats", () => {
        for (const format of PublisherPageFormats) {
            expect(isPublisherPageFormat(format)).toBe(true);
        }
        expect(isPublisherPageFormat("a5Portrait")).toBe(false);
        expect(isPublisherPageFormat(undefined)).toBe(false);
    });

    it("defaults to the widescreen page shape", () => {
        expect(DefaultPublisherPageFormat).toBe("widescreen");
        expect(PublisherPageFormatAspectRatios[DefaultPublisherPageFormat]).toBeGreaterThan(1);
    });

    it("describes the paper formats as upright", () => {
        expect(PublisherPageFormatAspectRatios["a4Portrait"]).toBeLessThan(1);
        expect(PublisherPageFormatAspectRatios["letterPortrait"]).toBeLessThan(1);
        // Letter is the squarer of the two sheets.
        expect(PublisherPageFormatAspectRatios["letterPortrait"]).toBeGreaterThan(
            PublisherPageFormatAspectRatios["a4Portrait"],
        );
    });

    it("reports an unknown format on a page body as an error", () => {
        const issues = validatePublisherPageBody({
            format: "a5Portrait" as never,
            layout: { type: "slotRef", slotId: "title" },
            slots: [{ type: "heading", localIdentifier: "title" }],
        });

        expect(issues).toEqual([{ severity: "error", message: 'Unknown page format "a5Portrait".' }]);
    });
});
