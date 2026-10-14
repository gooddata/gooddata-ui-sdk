// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IPublisherSectionV2, type PublisherDocumentContentV2 } from "./content.js";
import { newPublisherSectionIdV2 } from "./factory.js";
import { type IPublisherDocumentPageV2 } from "./page.js";
import { publisherDocumentContentSectionsV2, publisherDocumentContentSetSectionsV2 } from "./sections.js";

function page(id: string): IPublisherDocumentPageV2 {
    return { id, layout: { type: "title", id: "pageTitle", markdown: id } };
}

const shared = {
    defaults: { pageSize: "widescreen" },
    filters: [
        {
            attributeFilter: {
                displayForm: { identifier: "region.name", type: "displayForm" },
                negativeSelection: true,
                attributeElements: { values: [] },
                localIdentifier: "document_filter_region_name",
            },
        },
    ],
    style: { gap: 40 },
} satisfies Omit<PublisherDocumentContentV2, "pages" | "sections">;

const pagesContent: PublisherDocumentContentV2 = { ...shared, pages: [page("page_a"), page("page_b")] };

const untitledSectionContent: PublisherDocumentContentV2 = {
    ...shared,
    sections: [{ id: "section_a", pages: [page("page_a")] }],
};

const sectionsContent: PublisherDocumentContentV2 = {
    ...shared,
    sections: [
        { id: "section_a", pages: [page("page_a")] },
        {
            id: "section_b",
            title: "Revenue",
            description: "By region",
            pages: [page("page_b"), page("page_c")],
        },
    ],
};

function roundTrip(content: PublisherDocumentContentV2): PublisherDocumentContentV2 {
    return publisherDocumentContentSetSectionsV2({
        content,
        sections: publisherDocumentContentSectionsV2(content),
    });
}

describe("publisherDocumentContentSectionsV2", () => {
    it("returns stored sections as they are", () => {
        expect(publisherDocumentContentSectionsV2(sectionsContent)).toBe(sectionsContent.sections);
    });

    it("puts stored pages into one untitled section with a generated id", () => {
        const sections = publisherDocumentContentSectionsV2(pagesContent);

        expect(sections).toEqual([
            { id: expect.stringMatching(/^section_[0-9a-f]{8}$/), pages: pagesContent.pages },
        ]);
    });

    it("generates a new section id on each read of stored pages", () => {
        const [first] = publisherDocumentContentSectionsV2(pagesContent);
        const [second] = publisherDocumentContentSectionsV2(pagesContent);

        expect(first.id).not.toBe(second.id);
    });
});

describe("publisherDocumentContentSetSectionsV2", () => {
    it.each([
        ["pages", pagesContent],
        ["one untitled section", untitledSectionContent],
        ["several sections", sectionsContent],
    ])("round-trips content stored as %s unchanged", (_, content) => {
        expect(roundTrip(content)).toEqual(content);
    });

    it("writes a new document with one untitled section as pages", () => {
        const content = publisherDocumentContentSetSectionsV2({
            content: { pages: [] },
            sections: [{ id: newPublisherSectionIdV2(), pages: [page("page_a")] }],
        });

        expect(content).toEqual({ pages: [page("page_a")] });
    });

    it("writes pages content with no sections as no pages", () => {
        expect(publisherDocumentContentSetSectionsV2({ content: pagesContent, sections: [] })).toEqual({
            ...shared,
            pages: [],
        });
    });

    it("keeps sections content with no sections as sections", () => {
        expect(publisherDocumentContentSetSectionsV2({ content: sectionsContent, sections: [] })).toEqual({
            ...shared,
            sections: [],
        });
    });

    it.each<[string, IPublisherSectionV2[]]>([
        [
            "a second section is added",
            [
                { id: "section_a", pages: [page("page_a")] },
                { id: "section_b", pages: [page("page_b")] },
            ],
        ],
        ["the only section gets a title", [{ id: "section_a", title: "Revenue", pages: [page("page_a")] }]],
        ["the only section gets a description", [{ id: "section_a", description: "By region", pages: [] }]],
    ])("writes pages content as sections when %s", (_, sections) => {
        expect(publisherDocumentContentSetSectionsV2({ content: pagesContent, sections })).toEqual({
            ...shared,
            sections,
        });
    });

    it("writes sections and keeps the page id when a page moves into a new section", () => {
        const [section] = publisherDocumentContentSectionsV2(pagesContent);
        const [pageA, pageB] = section.pages;
        const sections = [
            { ...section, pages: [pageA] },
            { id: newPublisherSectionIdV2(), pages: [pageB] },
        ];

        const content = publisherDocumentContentSetSectionsV2({ content: pagesContent, sections });

        expect(content.sections?.map(({ pages }) => pages.map(({ id }) => id))).toEqual([
            ["page_a"],
            ["page_b"],
        ]);
        expect(content.sections?.[1].pages[0]).toEqual(page("page_b"));
    });
});
