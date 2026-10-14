// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    newPublisherDocumentFilterIdV2,
    newPublisherDocumentPageFromTemplateV2,
    newPublisherIdV2,
    newPublisherPageIdV2,
    newPublisherSectionIdV2,
    newPublisherWidgetIdV2,
} from "./factory.js";
import {
    type PublisherLayoutNodeV2,
    isPublisherColumnV2,
    isPublisherContainerV2,
    isPublisherRowV2,
} from "./layout.js";
import {
    type IPublisherDocumentPageV2,
    type IPublisherPageBodyV2,
    isPublisherDocumentPageV2,
    isPublisherPageBodyV2,
    isPublisherPageSizeV2,
} from "./page.js";
import { isPublisherTextStyleNameV2 } from "./style.js";
import {
    type PublisherHeadingLevelV2,
    type PublisherWidgetV2,
    isPublisherHeadingWidgetV2,
    isPublisherImageWidgetV2,
    isPublisherTakeawayWidgetV2,
    isPublisherTextWidgetV2,
    isPublisherTitleWidgetV2,
    isPublisherVisualizationWidgetV2,
    isPublisherWidgetV2,
    publisherHeadingDefaultTextStyleV2,
} from "./widget.js";

const template: IPublisherPageBodyV2 = {
    kind: "content",
    notes: "Mention the EMEA promotion.",
    style: { padding: "{theme.spacing.padding.normal}", gap: "{theme.spacing.gap.normal}" },
    layout: {
        type: "column",
        children: [
            { type: "title", id: "pageTitle", proportion: 2, markdown: "Revenue in {documentDateRange}" },
            {
                type: "row",
                proportion: 9,
                children: [
                    {
                        type: "visualization",
                        id: "widget1",
                        proportion: 2,
                        visualization: { identifier: "revenue_by_month", type: "insight" },
                        title: { visible: true, text: "Revenue by month" },
                        dateDataSet: { identifier: "order_date", type: "dataSet" },
                        ignoreDocumentFilters: [
                            {
                                type: "attributeFilterReference",
                                displayForm: { identifier: "region.name", type: "displayForm" },
                            },
                        ],
                        style: { backgroundColor: "{theme.colors.backgrounds.surface}", padding: 24 },
                    },
                    {
                        type: "takeaway",
                        id: "takeaway",
                        title: { text: "Key takeaway" },
                        generation: { instructions: "Compare the regions." },
                        style: { textStyle: "largeText" },
                    },
                ],
            },
            {
                type: "row",
                children: [
                    {
                        type: "image",
                        id: "footerLogo",
                        source: "{theme.logo}",
                        decorative: true,
                        locked: true,
                        style: { fit: "contain", horizontalAlign: "left" },
                    },
                    {
                        type: "text",
                        id: "footerPageNumber",
                        markdown: "{currentPageNumber} / {totalPages}",
                        decorative: true,
                    },
                ],
            },
        ],
    },
};

function widgetIds(node: PublisherLayoutNodeV2): string[] {
    return isPublisherContainerV2(node) ? node.children.flatMap(widgetIds) : [node.id];
}

describe("newPublisherDocumentPageFromTemplateV2", () => {
    it("gives two pages from one template different page ids and the same widget ids", () => {
        const first = newPublisherDocumentPageFromTemplateV2(template);
        const second = newPublisherDocumentPageFromTemplateV2(template);

        expect(first.id).not.toEqual(second.id);
        expect(widgetIds(first.layout)).toEqual([
            "pageTitle",
            "widget1",
            "takeaway",
            "footerLogo",
            "footerPageNumber",
        ]);
        expect(widgetIds(second.layout)).toEqual(widgetIds(first.layout));
    });

    it("copies the template content", () => {
        const page = newPublisherDocumentPageFromTemplateV2(template, "page_1");

        expect(page).toEqual({ ...template, id: "page_1" });
    });

    it("detaches the page from the template", () => {
        const snapshot = structuredClone(template);
        const page = newPublisherDocumentPageFromTemplateV2(template);
        const { layout } = page;

        expect(isPublisherColumnV2(layout)).toBe(true);
        if (!isPublisherColumnV2(layout)) {
            throw new Error("Expected a column layout.");
        }
        const innerRow = layout.children[1];
        if (!isPublisherRowV2(innerRow)) {
            throw new Error("Expected a row as the second child.");
        }
        innerRow.children.pop();
        layout.children.pop();
        page.style!.gap = 8;

        expect(template).toEqual(snapshot);
    });

    it("replaces the id and visibility of a document page used as a template", () => {
        const documentPage: IPublisherDocumentPageV2 = { ...template, id: "page_old", visible: false };

        const page = newPublisherDocumentPageFromTemplateV2(documentPage, "page_new");

        expect(page.id).toBe("page_new");
        expect(page).not.toHaveProperty("visible");
    });
});

describe("id factories", () => {
    it.each([
        ["page", newPublisherPageIdV2],
        ["section", newPublisherSectionIdV2],
        ["widget", newPublisherWidgetIdV2],
        ["custom", () => newPublisherIdV2("custom")],
    ])("generates a %s id that fits the id grammar", (prefix, factory) => {
        expect(factory()).toMatch(new RegExp(`^${prefix}_[0-9a-f]{8}$`));
    });

    it("generates a new id on each call", () => {
        expect(newPublisherWidgetIdV2()).not.toEqual(newPublisherWidgetIdV2());
    });
});

describe("publisherHeadingDefaultTextStyleV2", () => {
    it.each<[PublisherHeadingLevelV2 | undefined, string]>([
        [undefined, "h2"],
        [1, "h2"],
        [2, "h3"],
        [3, "h4"],
        [4, "h5"],
        [5, "h6"],
        [6, "h6"],
    ])("level %s uses %s", (level, expected) => {
        expect(publisherHeadingDefaultTextStyleV2(level)).toBe(expected);
    });
});

describe("type guards", () => {
    const widgets: PublisherWidgetV2[] = [
        { type: "title", id: "a" },
        { type: "heading", id: "b", level: 2 },
        { type: "text", id: "c" },
        { type: "image", id: "d" },
        { type: "visualization", id: "e" },
        { type: "takeaway", id: "f" },
    ];
    const widgetGuards = [
        isPublisherTitleWidgetV2,
        isPublisherHeadingWidgetV2,
        isPublisherTextWidgetV2,
        isPublisherImageWidgetV2,
        isPublisherVisualizationWidgetV2,
        isPublisherTakeawayWidgetV2,
    ];

    it("matches each widget with its own guard only", () => {
        const matches = widgets.map((widget) => widgetGuards.map((guard) => guard(widget)));

        expect(matches).toEqual(widgets.map((_, row) => widgetGuards.map((_, col) => row === col)));
    });

    it("tells widgets and containers apart", () => {
        const row = { type: "row", children: [] };
        const column = { type: "column", children: [] };

        expect(widgets.every(isPublisherWidgetV2)).toBe(true);
        expect(widgets.some(isPublisherContainerV2)).toBe(false);
        expect([isPublisherRowV2(row), isPublisherColumnV2(row), isPublisherContainerV2(row)]).toEqual([
            true,
            false,
            true,
        ]);
        expect([
            isPublisherRowV2(column),
            isPublisherColumnV2(column),
            isPublisherContainerV2(column),
        ]).toEqual([false, true, true]);
        expect(isPublisherWidgetV2(row)).toBe(false);
    });

    it("rejects v1 layout nodes and the dropped paragraph type", () => {
        expect(isPublisherContainerV2({ type: "section", direction: "row", children: [] })).toBe(false);
        expect(isPublisherWidgetV2({ type: "slotRef", slotId: "a" })).toBe(false);
        expect(isPublisherWidgetV2({ type: "paragraph", id: "a" })).toBe(false);
    });

    it.each([
        isPublisherWidgetV2,
        isPublisherTitleWidgetV2,
        isPublisherHeadingWidgetV2,
        isPublisherTextWidgetV2,
        isPublisherImageWidgetV2,
        isPublisherVisualizationWidgetV2,
        isPublisherTakeawayWidgetV2,
        isPublisherContainerV2,
        isPublisherRowV2,
        isPublisherColumnV2,
        isPublisherPageBodyV2,
        isPublisherDocumentPageV2,
        isPublisherPageSizeV2,
        isPublisherTextStyleNameV2,
    ])("%o rejects empty and malformed values", (guard: (value: unknown) => boolean) => {
        const values = [null, undefined, 0, "row", [], {}];

        expect(values.map(guard)).toEqual(values.map(() => false));
    });

    it("recognizes page bodies and document pages", () => {
        const page = newPublisherDocumentPageFromTemplateV2(template);

        expect(isPublisherPageBodyV2(template)).toBe(true);
        expect(isPublisherDocumentPageV2(template)).toBe(false);
        expect(isPublisherDocumentPageV2(page)).toBe(true);
        expect(isPublisherPageBodyV2({ kind: "content" })).toBe(false);
        expect(isPublisherPageBodyV2({ layout: { type: "slotRef", slotId: "a" } })).toBe(false);
    });

    it("accepts only known page sizes and text style names", () => {
        expect(isPublisherPageSizeV2("widescreen")).toBe(true);
        expect(isPublisherPageSizeV2("a4Portrait")).toBe(false);
        expect(isPublisherTextStyleNameV2("title")).toBe(true);
        expect(isPublisherTextStyleNameV2("paragraph")).toBe(false);
    });
});

describe("newPublisherDocumentFilterIdV2", () => {
    const noIds = new Set<string>();

    it("turns a label identifier into a filter id", () => {
        const target = { identifier: "region.name", type: "displayForm" } as const;

        expect(newPublisherDocumentFilterIdV2({ target, usedIds: noIds })).toBe(
            "document_filter_region_name",
        );
    });

    it("turns a date dataset identifier into a filter id", () => {
        const target = { identifier: "sales.order-date", type: "dataSet" } as const;

        expect(newPublisherDocumentFilterIdV2({ target, usedIds: noIds })).toBe(
            "document_filter_sales_order_date",
        );
    });

    it("appends a number when two identifiers map to the same id", () => {
        const usedIds = new Set(["document_filter_region_name"]);

        expect(newPublisherDocumentFilterIdV2({ target: { identifier: "region_name" }, usedIds })).toBe(
            "document_filter_region_name_2",
        );
        expect(
            newPublisherDocumentFilterIdV2({
                target: { identifier: "region.name" },
                usedIds: new Set([...usedIds, "document_filter_region_name_2"]),
            }),
        ).toBe("document_filter_region_name_3");
    });

    it("cuts a long identifier to 64 characters", () => {
        const id = newPublisherDocumentFilterIdV2({
            target: { identifier: "a".repeat(100) },
            usedIds: noIds,
        });

        expect(id).toBe(`document_filter_${"a".repeat(48)}`);
    });

    it("shortens a long identifier to fit the clash suffix", () => {
        const first = newPublisherDocumentFilterIdV2({
            target: { identifier: "a".repeat(100) },
            usedIds: noIds,
        });

        const second = newPublisherDocumentFilterIdV2({
            target: { identifier: "a".repeat(100) },
            usedIds: new Set([first]),
        });

        expect(second).toBe(`document_filter_${"a".repeat(46)}_2`);
        expect(second).toHaveLength(64);
    });

    it("throws for a uri ref", () => {
        expect(() =>
            newPublisherDocumentFilterIdV2({ target: { uri: "/gdc/md/project/obj/1" }, usedIds: noIds }),
        ).toThrow("identifier ref");
    });
});
