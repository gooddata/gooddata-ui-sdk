// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { isObjRef } from "../../objRef/index.js";

import {
    type PublisherDocumentContentV2,
    isPublisherAbsolutePeriodV2,
    isPublisherDocumentPagesContentV2,
    isPublisherDocumentSectionsContentV2,
    isPublisherRelativePeriodV2,
} from "./content.js";
import {
    type IPublisherDocumentDefinitionV2,
    type IPublisherDocumentTemplateDefinitionV2,
    type IPublisherPageTemplateDefinitionV2,
    isPublisherDocumentDefinitionV2,
    isPublisherDocumentTemplateDefinitionV2,
    isPublisherDocumentTemplateV2,
    isPublisherDocumentV2,
    isPublisherPageTemplateDefinitionV2,
    isPublisherPageTemplateV2,
} from "./document.js";

const content: PublisherDocumentContentV2 = {
    defaults: {
        pageSize: "widescreen",
        takeaway: { generation: { instructions: "Write for executives. Lead with the change." } },
    },
    style: { backgroundColor: "{theme.colors.backgrounds.inverse}", gap: 40 },
    filters: [
        {
            attributeFilter: {
                displayForm: { identifier: "region.name", type: "displayForm" },
                negativeSelection: true,
                attributeElements: { values: [] },
                localIdentifier: "document_filter_region_name",
                title: "Region",
            },
        },
        {
            dateFilter: {
                type: "relative",
                granularity: "GDC.time.month",
                from: -6,
                to: -1,
                dataSet: { identifier: "ship_date", type: "dataSet" },
                localIdentifier: "document_filter_ship_date",
            },
        },
    ],
    sections: [
        {
            id: "section_5e0a1f3c",
            pages: [
                {
                    id: "page_7f3a91c4",
                    kind: "cover",
                    layout: { type: "title", id: "coverTitle", markdown: "{documentName}" },
                },
            ],
        },
        {
            id: "section_9a4d2b71",
            title: "Revenue",
            description: "Sales by region and month",
            pages: [
                {
                    id: "page_d82e4b10",
                    visible: false,
                    layout: { type: "column", children: [] },
                },
            ],
        },
    ],
};

const document: IPublisherDocumentDefinitionV2 = {
    type: "document",
    title: "Northwind, H1 2026",
    description: "Half-year revenue review",
    tags: ["revenue", "h1"],
    version: "2",
    period: { type: "absolute", granularity: "GDC.time.date", from: "2026-01-01", to: "2026-06-30" },
    content,
};

const documentTemplate: IPublisherDocumentTemplateDefinitionV2 = {
    type: "documentTemplate",
    title: "Half-year review",
    version: "2",
    content: {
        defaults: { period: { type: "relative", granularity: "GDC.time.month", from: -6, to: -1 } },
        pages: [],
    },
};

const pageTemplate: IPublisherPageTemplateDefinitionV2 = {
    type: "pageTemplate",
    title: "Cover",
    version: "2",
    content: { kind: "cover", layout: { type: "column", children: [] } },
};

const ref = { identifier: "northwind-h1-2026" };

describe("entity type guards", () => {
    const definitions = [document, documentTemplate, pageTemplate];
    const definitionGuards = [
        isPublisherDocumentDefinitionV2,
        isPublisherDocumentTemplateDefinitionV2,
        isPublisherPageTemplateDefinitionV2,
    ];
    const persistedGuards = [isPublisherDocumentV2, isPublisherDocumentTemplateV2, isPublisherPageTemplateV2];

    it("matches each definition with its own guard only", () => {
        const matches = definitions.map((entity) => definitionGuards.map((guard) => guard(entity)));

        expect(matches).toEqual(definitions.map((_, row) => definitionGuards.map((_, col) => row === col)));
    });

    it("requires a ref for a persisted entity", () => {
        expect(isObjRef(ref)).toBe(true);
        expect(definitions.map((entity, i) => persistedGuards[i](entity))).toEqual([false, false, false]);
        expect(definitions.map((entity, i) => persistedGuards[i]({ ...entity, ref }))).toEqual([
            true,
            true,
            true,
        ]);
    });

    it("rejects entities of another content version", () => {
        expect(isPublisherDocumentDefinitionV2({ ...document, version: "1" })).toBe(false);
        expect(isPublisherDocumentDefinitionV2({ ...document, version: undefined })).toBe(false);
        expect(isPublisherDocumentTemplateDefinitionV2({ ...documentTemplate, version: 2 })).toBe(false);
    });

    it("rejects v1 entity types", () => {
        expect(isPublisherDocumentDefinitionV2({ ...document, type: "report" })).toBe(false);
        expect(isPublisherDocumentTemplateDefinitionV2({ ...documentTemplate, type: "reportTemplate" })).toBe(
            false,
        );
        expect(isPublisherPageTemplateDefinitionV2({ ...pageTemplate, type: "reportPageLayout" })).toBe(
            false,
        );
    });
});

describe("content type guards", () => {
    it("tells pages content and sections content apart", () => {
        const pagesContent = { pages: [] };

        expect(isPublisherDocumentSectionsContentV2(content)).toBe(true);
        expect(isPublisherDocumentPagesContentV2(content)).toBe(false);
        expect(isPublisherDocumentPagesContentV2(pagesContent)).toBe(true);
        expect(isPublisherDocumentSectionsContentV2(pagesContent)).toBe(false);
    });

    it("rejects content with both pages and sections", () => {
        // @ts-expect-error content holds pages or sections, never both
        const mixedContent: PublisherDocumentContentV2 = { pages: [], sections: [] };

        expect(isPublisherDocumentPagesContentV2(mixedContent)).toBe(false);
        expect(isPublisherDocumentSectionsContentV2(mixedContent)).toBe(false);
    });

    it("tells absolute and relative periods apart", () => {
        expect(isPublisherAbsolutePeriodV2(document.period)).toBe(true);
        expect(isPublisherRelativePeriodV2(document.period)).toBe(false);
        expect(isPublisherRelativePeriodV2(documentTemplate.content.defaults?.period)).toBe(true);
    });
});

describe.each([
    isPublisherDocumentDefinitionV2,
    isPublisherDocumentV2,
    isPublisherDocumentTemplateDefinitionV2,
    isPublisherDocumentTemplateV2,
    isPublisherPageTemplateDefinitionV2,
    isPublisherPageTemplateV2,
    isPublisherDocumentPagesContentV2,
    isPublisherDocumentSectionsContentV2,
    isPublisherAbsolutePeriodV2,
    isPublisherRelativePeriodV2,
])("%o", (guard: (value: unknown) => boolean) => {
    it("rejects empty and malformed values", () => {
        const values = [null, undefined, 0, "document", [], {}];

        expect(values.map(guard)).toEqual(values.map(() => false));
    });
});
