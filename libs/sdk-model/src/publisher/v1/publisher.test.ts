// (C) 2026 GoodData Corporation

import { assert, describe, expect, it } from "vitest";

import {
    BuiltInPublisherPageLayoutPortraitCoverV1,
    BuiltInPublisherPageLayoutPortraitSectionV1,
    BuiltInPublisherPageLayoutPortraitSummaryV1,
    BuiltInPublisherPageLayoutsV1,
} from "./builtinPageLayouts.js";
import { isPublisherDocumentContentV1 } from "./content.js";
import {
    isPublisherDocumentDefinitionV1,
    isPublisherDocumentTemplateDefinitionV1,
    isPublisherDocumentTemplateV1,
    isPublisherDocumentV1,
} from "./document.js";
import {
    newAdHocPublisherDocumentDefinitionV1,
    newPublisherDocumentContentV1,
    newPublisherDocumentDefinitionFromTemplateV1,
    newPublisherDocumentPageFromLayoutV1,
    newPublisherDocumentTemplateDefinitionV1,
    newPublisherPageLayoutDefinitionV1,
    publisherDocumentPageV1,
} from "./factory.js";
import { type PublisherPageLayoutNodeV1, isPublisherLayoutSlotRefV1 } from "./layout.js";
import {
    DefaultPublisherPageFormatV1,
    PublisherPageFormatAspectRatiosV1,
    PublisherPageFormatsV1,
    isPublisherPageFormatV1,
} from "./pageFormat.js";
import {
    type IPublisherPageBodyV1,
    isPublisherPageLayoutDefinitionV1,
    isPublisherPageLayoutV1,
    validatePublisherPageBodyV1,
} from "./pageLayout.js";
import {
    isPublisherImageSlotV1,
    isPublisherSlotV1,
    isPublisherTextSlotV1,
    isPublisherVisualizationSlotV1,
} from "./slot.js";
import {
    getPublisherTextPlaceholdersV1,
    publisherTextPlaceholderV1,
    resolvePublisherTextPlaceholdersV1,
} from "./variables.js";

const body: IPublisherPageBodyV1 = {
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
        expect(getPublisherTextPlaceholdersV1("{periodStart} to {periodEnd} ({periodStart})")).toEqual([
            "periodStart",
            "periodEnd",
        ]);
    });

    it("ignores malformed markers", () => {
        expect(getPublisherTextPlaceholdersV1("{1bad} { spaced } {} {good_1}")).toEqual(["good_1"]);
    });

    it("resolves a marker inside braces, leaving the braces in place", () => {
        expect(getPublisherTextPlaceholdersV1("{{periodStart}}")).toEqual(["periodStart"]);
        expect(resolvePublisherTextPlaceholdersV1("{{a}}", { a: "1" })).toBe("{1}");
    });

    it("reads markers written back to back", () => {
        expect(getPublisherTextPlaceholdersV1("{a}{b}")).toEqual(["a", "b"]);
        expect(resolvePublisherTextPlaceholdersV1("{a}{b}", { a: "1", b: "2" })).toBe("12");
    });

    it("builds a marker the collector reads back", () => {
        expect(getPublisherTextPlaceholdersV1(publisherTextPlaceholderV1("periodStart"))).toEqual([
            "periodStart",
        ]);
    });

    it("resolves known values and keeps unknown markers", () => {
        expect(resolvePublisherTextPlaceholdersV1("{a} and {b}", { a: "1" })).toBe("1 and {b}");
    });

    it("does not expand values recursively", () => {
        expect(resolvePublisherTextPlaceholdersV1("{a}", { a: "{b}", b: "x" })).toBe("{b}");
    });
});

describe("type guards", () => {
    const page = newPublisherPageLayoutDefinitionV1("Page", body);
    const template = newPublisherDocumentTemplateDefinitionV1(
        "Template",
        newPublisherDocumentContentV1([newPublisherDocumentPageFromLayoutV1(page, "p1")]),
    );
    const publisherDocument = newPublisherDocumentDefinitionFromTemplateV1(template, {
        title: "Report",
        periodStart: "2026-01-01",
        periodEnd: "2026-03-31",
    });

    it("distinguishes definitions from saved objects by ref", () => {
        expect(isPublisherPageLayoutDefinitionV1(page)).toBe(true);
        expect(isPublisherPageLayoutV1(page)).toBe(false);
        expect(isPublisherPageLayoutV1({ ...page, ref: { identifier: "p" } })).toBe(true);

        expect(isPublisherDocumentTemplateDefinitionV1(template)).toBe(true);
        expect(isPublisherDocumentTemplateV1(template)).toBe(false);
        expect(isPublisherDocumentTemplateV1({ ...template, ref: { identifier: "t" } })).toBe(true);

        expect(isPublisherDocumentDefinitionV1(publisherDocument)).toBe(true);
        expect(isPublisherDocumentV1(publisherDocument)).toBe(false);
        expect(isPublisherDocumentV1({ ...publisherDocument, ref: { identifier: "r" } })).toBe(true);
    });

    it("discriminates slot types", () => {
        const [viz, text] = body.slots;
        expect(isPublisherVisualizationSlotV1(viz)).toBe(true);
        expect(isPublisherTextSlotV1(text)).toBe(true);
        expect(isPublisherImageSlotV1(viz)).toBe(false);
        expect(isPublisherSlotV1(viz)).toBe(true);
        expect(isPublisherSlotV1({})).toBe(false);
    });

    it("recognizes content version 1", () => {
        expect(isPublisherDocumentContentV1(template.content)).toBe(true);
        expect(isPublisherDocumentContentV1({ version: "2", pages: [] })).toBe(false);
    });
});

describe("newPublisherDocumentPageFromLayoutV1", () => {
    const page = newPublisherPageLayoutDefinitionV1("Page", body);

    it("prefixes slot ids and layout slotIds consistently", () => {
        const instance = newPublisherDocumentPageFromLayoutV1(page, "p1");

        expect(instance.slots.map((slot) => slot.localIdentifier)).toEqual(["p1_widget", "p1_summary"]);
        expect(validatePublisherPageBodyV1(instance)).toEqual([]);
    });

    it("keeps repeated instances of one page unique within content", () => {
        const content = newPublisherDocumentContentV1([
            newPublisherDocumentPageFromLayoutV1(page, "p1"),
            newPublisherDocumentPageFromLayoutV1(page, "p2"),
        ]);

        const allSlotIds = content.pages.flatMap((contentPage) =>
            contentPage.slots.map((slot) => slot.localIdentifier),
        );
        expect(new Set(allSlotIds).size).toBe(allSlotIds.length);
    });

    it("detaches the clone from the source page", () => {
        const mutablePage = newPublisherPageLayoutDefinitionV1("Page", JSON.parse(JSON.stringify(body)));
        const instance = newPublisherDocumentPageFromLayoutV1(mutablePage, "p1");

        mutablePage.content.slots[0]!.placeholder!.hint = "changed";

        expect(instance.slots[0]!.placeholder!.hint).toBe("Add a visualization");
    });

    it("generates a localIdentifier when none is given", () => {
        const instance = newPublisherDocumentPageFromLayoutV1(page);
        expect(instance.localIdentifier).toMatch(/^page_/);
    });
});

describe("newPublisherDocumentDefinitionFromTemplateV1", () => {
    it("deep-copies content so the document stays frozen", () => {
        const page = newPublisherPageLayoutDefinitionV1("Page", JSON.parse(JSON.stringify(body)));
        const template = newPublisherDocumentTemplateDefinitionV1(
            "Template",
            newPublisherDocumentContentV1([newPublisherDocumentPageFromLayoutV1(page, "p1")]),
        );
        const publisherDocument = newPublisherDocumentDefinitionFromTemplateV1(template, {
            title: "Report",
            periodStart: "2026-01-01",
            periodEnd: "2026-03-31",
        });

        template.content.pages[0]!.slots[0]!.placeholder!.hint = "changed";

        expect(publisherDocument.content.pages[0]!.slots[0]!.placeholder!.hint).toBe("Add a visualization");
        expect(publisherDocumentPageV1(publisherDocument, "p1")).toBeDefined();
    });
});

describe("newAdHocPublisherDocumentDefinitionV1", () => {
    it("creates a document with empty content by default", () => {
        const publisherDocument = newAdHocPublisherDocumentDefinitionV1({
            title: "Ad hoc",
            periodStart: "2026-01-01",
            periodEnd: "2026-01-31",
        });
        expect(isPublisherDocumentContentV1(publisherDocument.content)).toBe(true);
        expect(publisherDocument.content.pages).toEqual([]);
    });
});

describe("validatePublisherPageBodyV1", () => {
    it("reports duplicate slot ids as errors", () => {
        const invalid: IPublisherPageBodyV1 = {
            ...body,
            slots: [body.slots[0]!, { ...body.slots[1]!, localIdentifier: "widget" }],
        };
        expect(validatePublisherPageBodyV1(invalid).some((issue) => issue.severity === "error")).toBe(true);
    });

    it("reports non-positive weights as errors", () => {
        const invalid: IPublisherPageBodyV1 = {
            ...body,
            layout: { type: "slotRef", slotId: "widget", weight: 0 },
        };
        expect(validatePublisherPageBodyV1(invalid).some((issue) => issue.severity === "error")).toBe(true);
    });

    it("reports unresolved and unplaced slots as warnings", () => {
        const withExtras: IPublisherPageBodyV1 = {
            ...body,
            layout: { type: "slotRef", slotId: "missing" },
        };
        const issues = validatePublisherPageBodyV1(withExtras);
        expect(issues.every((issue) => issue.severity === "warning")).toBe(true);
        expect(issues).toHaveLength(3);
    });
});

describe("BuiltInPublisherPageLayoutsV1", () => {
    it("contains 25 pages, all flagged and locked", () => {
        expect(BuiltInPublisherPageLayoutsV1).toHaveLength(25);
        for (const page of BuiltInPublisherPageLayoutsV1) {
            expect(page.isBuiltIn).toBe(true);
            expect(page.isLocked).toBe(true);
            expect(isPublisherPageLayoutV1(page)).toBe(true);
        }
    });

    it("every page body is structurally valid", () => {
        for (const page of BuiltInPublisherPageLayoutsV1) {
            expect(validatePublisherPageBodyV1(page.content)).toEqual([]);
        }
    });

    it("has unique refs and titles", () => {
        const refIds = BuiltInPublisherPageLayoutsV1.map((page) => JSON.stringify(page.ref));
        const titles = BuiltInPublisherPageLayoutsV1.map((page) => page.title);
        expect(new Set(refIds).size).toBe(refIds.length);
        expect(new Set(titles).size).toBe(titles.length);
    });

    it("is deeply frozen", () => {
        for (const layout of BuiltInPublisherPageLayoutsV1) {
            expect(Object.isFrozen(layout)).toBe(true);
            expect(Object.isFrozen(layout.content)).toBe(true);
            expect(Object.isFrozen(layout.content.slots[0])).toBe(true);
            expect(Object.isFrozen(layout.content.layout)).toBe(true);
        }
    });

    it("declares a page format on every page", () => {
        for (const page of BuiltInPublisherPageLayoutsV1) {
            expect(isPublisherPageFormatV1(page.content.format)).toBe(true);
        }
    });

    it("offers both widescreen and portrait pages", () => {
        const formats = new Set(BuiltInPublisherPageLayoutsV1.map((page) => page.content.format));
        expect(formats).toEqual(new Set(["widescreen", "a4Portrait"]));
    });

    it("gives every portrait page a cover, a divider and content variants", () => {
        const portrait = BuiltInPublisherPageLayoutsV1.filter((page) => page.content.format === "a4Portrait");
        expect(portrait).toHaveLength(9);
        expect(portrait).toContain(BuiltInPublisherPageLayoutPortraitCoverV1);
        expect(portrait).toContain(BuiltInPublisherPageLayoutPortraitSectionV1);
        expect(portrait).toContain(BuiltInPublisherPageLayoutPortraitSummaryV1);
        expect(portrait.map((page) => page.content.kind)).toContain("cover");
        expect(portrait.map((page) => page.content.kind)).toContain("section");
    });

    it("lays portrait content out in a column, never a wide row of visualizations", () => {
        const widestRow = (node: PublisherPageLayoutNodeV1): number =>
            isPublisherLayoutSlotRefV1(node)
                ? 0
                : Math.max(
                      node.direction === "row" ? node.children.length : 0,
                      ...node.children.map(widestRow),
                  );

        for (const page of BuiltInPublisherPageLayoutsV1.filter(
            (candidate) => candidate.content.format === "a4Portrait",
        )) {
            // The footer places a logo next to the page number, so two side by side is the floor.
            expect(widestRow(page.content.layout)).toBeLessThanOrEqual(2);
        }
    });

    it("summary variants place the summary slot in the layout", () => {
        const withSummary = BuiltInPublisherPageLayoutsV1.filter((page) =>
            page.content.slots.some((slot) => slot.localIdentifier === "summary"),
        );
        expect(withSummary).toHaveLength(8);
        for (const page of withSummary) {
            const slotIds: string[] = [];
            const visit = (node: PublisherPageLayoutNodeV1): void => {
                if (isPublisherLayoutSlotRefV1(node)) {
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

    const body = (overrides: Partial<IPublisherPageBodyV1>): IPublisherPageBodyV1 => ({
        layout: { type: "slotRef", slotId: "text1" },
        slots: [{ type: "paragraph", localIdentifier: "text1" }],
        ...overrides,
    });

    it("accepts an image background referencing an image slot, counting it as placed", () => {
        const issues = validatePublisherPageBodyV1(
            body({
                style: { background: { type: "image", slotId: "bg" } },
                slots: [{ type: "paragraph", localIdentifier: "text1" }, imageSlot("bg")],
            }),
        );

        expect(issues).toEqual([]);
    });

    it("warns about a background reference with no slot definition", () => {
        const issues = validatePublisherPageBodyV1(
            body({ style: { background: { type: "image", slotId: "bg" } } }),
        );

        expect(issues).toEqual([
            expect.objectContaining({ severity: "warning", message: expect.stringContaining('"bg"') }),
        ]);
    });

    it("rejects a background reference to a non-image slot", () => {
        const issues = validatePublisherPageBodyV1(
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
        const issues = validatePublisherPageBodyV1(
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
        expect(validatePublisherPageBodyV1(body({ style: { borderRadius: 0 } }))).toEqual([]);
        expect(
            validatePublisherPageBodyV1(
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
        const issues = validatePublisherPageBodyV1(
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
        const issues = validatePublisherPageBodyV1(
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
        const issues = validatePublisherPageBodyV1(
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
        const issues = validatePublisherPageBodyV1(
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
        const issues = validatePublisherPageBodyV1(
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
        const issues = validatePublisherPageBodyV1(
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
        expect(validatePublisherPageBodyV1(body({ style: { padding: 0 } }))).toEqual([]);
        expect(validatePublisherPageBodyV1(body({ style: { padding: 2.5 } }))).toEqual([]);
        for (const padding of [-1, Number.POSITIVE_INFINITY, Number.NaN]) {
            expect(validatePublisherPageBodyV1(body({ style: { padding } }))).toEqual([
                expect.objectContaining({
                    severity: "error",
                    message: expect.stringContaining("Padding"),
                }),
            ]);
        }
    });

    it("rejects a corner radius that is negative, infinite or not a number", () => {
        for (const borderRadius of [-1, Number.POSITIVE_INFINITY, Number.NaN]) {
            expect(validatePublisherPageBodyV1(body({ style: { borderRadius } }))).toEqual([
                expect.objectContaining({
                    severity: "error",
                    message: expect.stringContaining("Border radius"),
                }),
            ]);
        }
        expect(
            validatePublisherPageBodyV1(
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
        const definition = newPublisherPageLayoutDefinitionV1("Hero", {
            style: { background: { type: "image", slotId: "cover" } },
            layout: {
                type: "section",
                direction: "column",
                style: { background: { type: "image", slotId: "band" } },
                children: [{ type: "slotRef", slotId: "text1" }],
            },
            slots: [{ type: "paragraph", localIdentifier: "text1" }, imageSlot("cover"), imageSlot("band")],
        });

        const page = newPublisherDocumentPageFromLayoutV1(definition, "p1");

        expect(page.style?.background).toEqual({ type: "image", slotId: "p1_cover" });
        const root = page.layout;
        expect(isPublisherLayoutSlotRefV1(root)).toBe(false);
        if (!isPublisherLayoutSlotRefV1(root)) {
            expect(root.style?.background).toEqual({ type: "image", slotId: "p1_band" });
        }
        expect(validatePublisherPageBodyV1(page)).toEqual([]);
    });
});

describe("built-in footers", () => {
    it("pin the logo lower left and the page number lower right", () => {
        for (const layout of BuiltInPublisherPageLayoutsV1) {
            const logo = layout.content.slots.find((slot) => slot.localIdentifier === "footerLogo");
            const pageNumber = layout.content.slots.find(
                (slot) => slot.localIdentifier === "footerPageNumber",
            );
            assert(isPublisherImageSlotV1(logo));
            expect(logo.style).toEqual({ horizontalAlign: "start", verticalAlign: "end" });
            assert(isPublisherTextSlotV1(pageNumber));
            expect(pageNumber.style).toEqual({
                type: "largeText",
                horizontalAlign: "end",
                verticalAlign: "end",
            });
        }
    });
});

describe("PublisherPageFormatV1", () => {
    it("accepts only the known formats", () => {
        for (const format of PublisherPageFormatsV1) {
            expect(isPublisherPageFormatV1(format)).toBe(true);
        }
        expect(isPublisherPageFormatV1("a5Portrait")).toBe(false);
        expect(isPublisherPageFormatV1(undefined)).toBe(false);
    });

    it("defaults to the widescreen page shape", () => {
        expect(DefaultPublisherPageFormatV1).toBe("widescreen");
        expect(PublisherPageFormatAspectRatiosV1[DefaultPublisherPageFormatV1]).toBeGreaterThan(1);
    });

    it("describes the paper formats as upright", () => {
        expect(PublisherPageFormatAspectRatiosV1["a4Portrait"]).toBeLessThan(1);
        expect(PublisherPageFormatAspectRatiosV1["letterPortrait"]).toBeLessThan(1);
        // Letter is the squarer of the two sheets.
        expect(PublisherPageFormatAspectRatiosV1["letterPortrait"]).toBeGreaterThan(
            PublisherPageFormatAspectRatiosV1["a4Portrait"],
        );
    });

    it("reports an unknown format on a page body as an error", () => {
        const issues = validatePublisherPageBodyV1({
            format: "a5Portrait" as never,
            layout: { type: "slotRef", slotId: "title" },
            slots: [{ type: "heading", localIdentifier: "title" }],
        });

        expect(issues).toEqual([{ severity: "error", message: 'Unknown page format "a5Portrait".' }]);
    });
});
