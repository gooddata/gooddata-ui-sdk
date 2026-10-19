// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type FilterContextItem, type IDashboardAttributeFilter } from "../../dashboard/filterContext.js";

import { type PublisherDocumentContentV2 } from "./content.js";
import {
    type IPublisherDocumentDefinitionV2,
    type IPublisherDocumentTemplateDefinitionV2,
    type IPublisherPageTemplateDefinitionV2,
    type IPublisherPageTemplateV2,
} from "./document.js";
import { type IPublisherDocumentPageV2, type IPublisherPageBodyV2 } from "./page.js";
import {
    validatePublisherDocumentContentV2,
    validatePublisherEntityV2,
    validatePublisherPageBodyV2,
} from "./validation.js";

const body: IPublisherPageBodyV2 = {
    layout: {
        type: "column",
        children: [
            { type: "title", id: "pageTitle", markdown: "Revenue" },
            {
                type: "row",
                children: [
                    { type: "visualization", id: "widget1" },
                    { type: "takeaway", id: "takeaway" },
                ],
            },
        ],
    },
};

function page(id: string): IPublisherDocumentPageV2 {
    return { ...structuredClone(body), id };
}

const regionFilterBody = {
    displayForm: { identifier: "region.name", type: "displayForm" },
    negativeSelection: true,
    attributeElements: { values: [] },
    localIdentifier: "document_filter_region_name",
} satisfies IDashboardAttributeFilter["attributeFilter"];

const regionFilter: FilterContextItem = { attributeFilter: regionFilterBody };

const shipDateFilter: FilterContextItem = {
    dateFilter: {
        type: "relative",
        granularity: "GDC.time.month",
        from: -6,
        to: -1,
        dataSet: { identifier: "ship_date", type: "dataSet" },
        localIdentifier: "document_filter_ship_date",
    },
};

const content: PublisherDocumentContentV2 = {
    filters: [regionFilter, shipDateFilter],
    sections: [
        { id: "section_a", pages: [page("page_a")] },
        { id: "section_b", title: "Revenue", pages: [page("page_b"), page("page_c")] },
    ],
};

const document: IPublisherDocumentDefinitionV2 = {
    type: "document",
    title: "Northwind",
    version: "2",
    period: { type: "absolute", granularity: "GDC.time.date", from: "2026-01-01", to: "2026-06-30" },
    content,
};

const pageTemplate: IPublisherPageTemplateDefinitionV2 = {
    type: "pageTemplate",
    title: "Content",
    version: "2",
    content: body,
};

describe("validatePublisherPageBodyV2", () => {
    it("accepts a valid page", () => {
        expect(validatePublisherPageBodyV2(body)).toEqual([]);
    });

    it("accepts a page without a title widget", () => {
        expect(validatePublisherPageBodyV2({ layout: { type: "text", id: "text" } })).toEqual([]);
    });

    it("rejects a second title widget, however deep it is", () => {
        const issues = validatePublisherPageBodyV2({
            layout: {
                type: "column",
                children: [
                    { type: "title", id: "first" },
                    {
                        type: "row",
                        children: [{ type: "column", children: [{ type: "title", id: "second" }] }],
                    },
                ],
            },
        });

        expect(issues).toEqual([
            { path: "layout.children[1].children[0].children[0]", message: expect.stringContaining("title") },
        ]);
    });

    it("rejects a widget id used twice in the page", () => {
        const issues = validatePublisherPageBodyV2({
            layout: {
                type: "row",
                children: [
                    { type: "text", id: "same" },
                    { type: "column", children: [{ type: "image", id: "same" }] },
                ],
            },
        });

        expect(issues).toEqual([
            { path: "layout.children[1].children[0].id", message: expect.stringContaining('"same"') },
        ]);
    });

    it("accepts a container id equal to a widget id", () => {
        expect(
            validatePublisherPageBodyV2({
                layout: { type: "row", id: "same", children: [{ type: "text", id: "same" }] },
            }),
        ).toEqual([]);
    });
});

describe("validatePublisherDocumentContentV2", () => {
    it("accepts valid content", () => {
        expect(validatePublisherDocumentContentV2(content)).toEqual([]);
    });

    it("accepts the same widget ids on different pages", () => {
        expect(validatePublisherDocumentContentV2({ pages: [page("page_a"), page("page_b")] })).toEqual([]);
    });

    it("rejects content with both pages and sections", () => {
        expect(validatePublisherDocumentContentV2({ pages: [page("page_a")], sections: [] })).toEqual([
            { path: "", message: expect.stringContaining("never both") },
        ]);
    });

    it("rejects content with neither pages nor sections", () => {
        expect(validatePublisherDocumentContentV2({ filters: [] })).toEqual([
            { path: "", message: "Content holds pages or sections." },
        ]);
    });

    it("rejects a page id used twice across sections", () => {
        const issues = validatePublisherDocumentContentV2({
            sections: [
                { id: "section_a", pages: [page("page_a")] },
                { id: "section_b", pages: [page("page_b"), page("page_a")] },
            ],
        });

        expect(issues).toEqual([
            { path: "sections[1].pages[1].id", message: expect.stringContaining('"page_a"') },
        ]);
    });

    it("rejects a page id used twice in pages", () => {
        expect(validatePublisherDocumentContentV2({ pages: [page("page_a"), page("page_a")] })).toEqual([
            { path: "pages[1].id", message: expect.stringContaining('"page_a"') },
        ]);
    });

    it("rejects a section id used twice", () => {
        const issues = validatePublisherDocumentContentV2({
            sections: [
                { id: "section_a", pages: [page("page_a")] },
                { id: "section_a", pages: [page("page_b")] },
            ],
        });

        expect(issues).toEqual([{ path: "sections[1].id", message: expect.stringContaining('"section_a"') }]);
    });

    it("rejects a second filter on the same attribute display form, whatever its kind", () => {
        const issues = validatePublisherDocumentContentV2({
            pages: [],
            filters: [
                regionFilter,
                {
                    matchAttributeFilter: {
                        displayForm: { identifier: "region.name", type: "displayForm" },
                        operator: "contains",
                        literal: "EU",
                        localIdentifier: "region_match",
                    },
                },
            ],
        });

        expect(issues).toEqual([{ path: "filters[1]", message: expect.stringContaining("display form") }]);
    });

    it("rejects a second filter on the same date dataset", () => {
        const issues = validatePublisherDocumentContentV2({
            pages: [],
            filters: [
                shipDateFilter,
                {
                    dateFilter: {
                        type: "absolute",
                        granularity: "GDC.time.date",
                        from: "2026-01-01",
                        to: "2026-03-31",
                        dataSet: { identifier: "ship_date", type: "dataSet" },
                        localIdentifier: "ship_date_absolute",
                    },
                },
            ],
        });

        expect(issues).toEqual([{ path: "filters[1]", message: expect.stringContaining("date dataset") }]);
    });

    it("accepts filters on different display forms and datasets", () => {
        const issues = validatePublisherDocumentContentV2({
            pages: [],
            filters: [
                regionFilter,
                shipDateFilter,
                {
                    dateFilter: {
                        type: "relative",
                        granularity: "GDC.time.year",
                        dataSet: { identifier: "order_date", type: "dataSet" },
                        localIdentifier: "order_date",
                    },
                },
            ],
        });

        expect(issues).toEqual([]);
    });

    it("rejects a date filter without a dataSet", () => {
        const issues = validatePublisherDocumentContentV2({
            pages: [],
            filters: [
                {
                    dateFilter: {
                        type: "relative",
                        granularity: "GDC.time.month",
                        from: -1,
                        to: -1,
                        localIdentifier: "period",
                    },
                },
            ],
        });

        expect(issues).toEqual([{ path: "filters[0]", message: expect.stringContaining("dataSet") }]);
    });

    it("accepts a widget that ignores a filter the document no longer has", () => {
        const issues = validatePublisherDocumentContentV2({
            pages: [
                {
                    id: "page_a",
                    layout: {
                        type: "visualization",
                        id: "widget1",
                        ignoreDocumentFilters: [
                            {
                                type: "attributeFilterReference",
                                displayForm: { identifier: "country.name", type: "displayForm" },
                            },
                        ],
                    },
                },
            ],
        });

        expect(issues).toEqual([]);
    });

    it("checks the page rules on every page, with the page's path", () => {
        const broken = page("page_c");
        broken.layout = {
            type: "row",
            children: [
                { type: "title", id: "a" },
                { type: "title", id: "a" },
            ],
        };

        const issues = validatePublisherDocumentContentV2({
            sections: [
                { id: "section_a", pages: [page("page_a")] },
                { id: "section_b", pages: [page("page_b"), broken] },
            ],
        });

        expect(issues.map(({ path }) => path)).toEqual([
            "sections[1].pages[1].layout.children[1]",
            "sections[1].pages[1].layout.children[1].id",
        ]);
    });
});

describe("validatePublisherEntityV2", () => {
    it("accepts valid entities", () => {
        const documentTemplate: IPublisherDocumentTemplateDefinitionV2 = {
            type: "documentTemplate",
            title: "Half-year review",
            version: "2",
            content: {
                defaults: { period: { type: "relative", granularity: "GDC.time.month", from: -6, to: -1 } },
                pages: [page("page_a")],
            },
        };

        expect([document, documentTemplate, pageTemplate].map(validatePublisherEntityV2)).toEqual([
            [],
            [],
            [],
        ]);
    });

    it("rejects another content version", () => {
        expect(validatePublisherEntityV2({ ...document, version: "1" })).toEqual([
            { path: "version", message: expect.stringContaining('"1"') },
        ]);
    });

    it("rejects a default period on a document", () => {
        const issues = validatePublisherEntityV2({
            ...document,
            content: {
                ...content,
                defaults: { period: { type: "relative", granularity: "GDC.time.month", from: -1, to: -1 } },
            },
        });

        expect(issues).toEqual([{ path: "content.defaults.period", message: expect.any(String) }]);
    });

    it("checks document content with the content path", () => {
        const issues = validatePublisherEntityV2({
            ...document,
            content: { pages: [page("page_a"), page("page_a")] },
        });

        expect(issues).toEqual([{ path: "content.pages[1].id", message: expect.any(String) }]);
    });

    it("checks page template content with the content path", () => {
        const issues = validatePublisherEntityV2({
            ...pageTemplate,
            content: {
                layout: {
                    type: "row",
                    children: [
                        { type: "title", id: "a" },
                        { type: "title", id: "b" },
                    ],
                },
            },
        });

        expect(issues).toEqual([{ path: "content.layout.children[1]", message: expect.any(String) }]);
    });

    it.each([
        ["a document", { ...document, ref: { identifier: "default.northwind" } }],
        [
            "a page template that is not a default one",
            { ...pageTemplate, ref: { identifier: "default.cover" } },
        ],
    ])("rejects a reserved id on %s", (_, entity) => {
        expect(validatePublisherEntityV2(entity)).toEqual([
            { path: "ref", message: expect.stringContaining("default.") },
        ]);
    });

    it("accepts a reserved id on a default page template", () => {
        const defaultTemplate: IPublisherPageTemplateV2 = {
            ...pageTemplate,
            ref: { identifier: "default.pageTemplate.cover" },
            isDefault: true,
        };

        expect(validatePublisherEntityV2(defaultTemplate)).toEqual([]);
    });

    it("accepts ids that only contain the reserved prefix later on", () => {
        expect(
            validatePublisherEntityV2({ ...document, ref: { identifier: "northwind.default.2026" } }),
        ).toEqual([]);
    });
});

function paths(issues: Array<{ path: string }>): string[] {
    return issues.map(({ path }) => path);
}

function pageWith(node: unknown): unknown {
    return { layout: { type: "column", children: [node] } };
}

describe("page structure", () => {
    it.each([
        ["proportion is positive", { type: "text", id: "a", proportion: 0 }, "proportion"],
        ["level is 1 to 6", { type: "heading", id: "a", level: 7 }, "level"],
        ["opacity is 0 to 1", { type: "text", id: "a", style: { opacity: 1.5 } }, "style.opacity"],
        ["fontWeight is 1 to 1000", { type: "text", id: "a", style: { fontWeight: 0 } }, "style.fontWeight"],
        [
            "axis rotation is -90 to 90",
            { type: "visualization", id: "a", display: { xAxis: { values: { rotation: 91 } } } },
            "display.xAxis.values.rotation",
        ],
        ["a length is 0 or more", { type: "text", id: "a", style: { borderWidth: -1 } }, "style.borderWidth"],
        ["a length is finite", { type: "text", id: "a", style: { fontSize: Infinity } }, "style.fontSize"],
    ])("rejects a value out of range: %s", (_, node, key) => {
        expect(paths(validatePublisherPageBodyV2(pageWith(node)))).toEqual([`layout.children[0].${key}`]);
    });

    it("accepts negative shadow offsets and spread", () => {
        const node = { type: "text", id: "a", style: { shadowX: -2, shadowY: -4, shadowSpread: -1 } };

        expect(validatePublisherPageBodyV2(pageWith(node))).toEqual([]);
    });

    it.each([
        ["an empty string", { type: "text", id: "a", markdown: "" }, "markdown"],
        ["null", { type: "image", id: "a", altText: null }, "altText"],
    ])("rejects %s instead of an absent key", (_, node, key) => {
        expect(validatePublisherPageBodyV2(pageWith(node))).toEqual([
            { path: `layout.children[0].${key}`, message: expect.stringContaining("Leave the key out") },
        ]);
    });

    it("rejects an empty value on a required key", () => {
        expect(validatePublisherPageBodyV2(pageWith({ type: "text", id: "" }))).toEqual([
            { path: "layout.children[0].id", message: 'Expected a value, got "".' },
        ]);
    });

    it.each(["", "has space", "a/b", "x".repeat(65)])("rejects the id %j", (badId) => {
        expect(paths(validatePublisherPageBodyV2(pageWith({ type: "text", id: badId })))).toEqual([
            "layout.children[0].id",
        ]);
    });

    it("accepts ids with dots, dashes and underscores up to 64 characters", () => {
        const ids = ["a.b-c_d", "x".repeat(64), "default.cover"];

        expect(ids.map((id) => validatePublisherPageBodyV2(pageWith({ type: "text", id })))).toEqual([
            [],
            [],
            [],
        ]);
    });

    it.each([
        "{theme.logo}",
        "{theme.coverImage}",
        "{theme.assets.images.hero_1}",
        "https://example.com/a.png",
        "https://cdn.example.com/{documentName}.png",
    ])("accepts the image source %s", (source) => {
        expect(validatePublisherPageBodyV2(pageWith({ type: "image", id: "a", source }))).toEqual([]);
    });

    it.each([
        "http://example.com/a.png",
        "data:image/png;base64,AAAA",
        "javascript:alert(1)",
        "https://",
        "https://a b",
        "{theme.assets.videos.a}",
        "prefix {theme.logo}",
    ])("rejects the image source %s", (source) => {
        expect(paths(validatePublisherPageBodyV2(pageWith({ type: "image", id: "a", source })))).toEqual([
            "layout.children[0].source",
        ]);
    });

    it.each([
        "#abc",
        "#aabbcc",
        "#aabbcc80",
        "rgb(10, 20, 30)",
        "rgb(10,20,30,0.5)",
        "rgb(10, 20, 30, .5)",
        "{theme.colors.backgrounds.surface}",
        "{theme.colors.lines.default}",
        "{theme.palette.primary}",
    ])("accepts the color %s", (color) => {
        expect(
            validatePublisherPageBodyV2(pageWith({ type: "text", id: "a", style: { textColor: color } })),
        ).toEqual([]);
    });

    it.each([
        "#abcd",
        "#abcde",
        "red",
        "rgb(10, 20)",
        "rgb(10, 20, 30, 0.5, 1)",
        "rgb(256, 0, 0)",
        "rgb(0, 0, 0, 2)",
        "rgba(0, 0, 0, 0.5)",
        "rgb(0, 0, 0, 1.)",
        "{theme.colors.fills.surface}",
        "{theme.palette.info}",
    ])("rejects the color %s", (color) => {
        expect(
            paths(
                validatePublisherPageBodyV2(pageWith({ type: "text", id: "a", style: { textColor: color } })),
            ),
        ).toEqual(["layout.children[0].style.textColor"]);
    });

    it("rejects a long malformed rgb() color quickly", { timeout: 1000 }, () => {
        const textColor = `rgb(1, 1, 1, ${"1".repeat(100_000)}`;

        expect(
            paths(validatePublisherPageBodyV2(pageWith({ type: "text", id: "a", style: { textColor } }))),
        ).toEqual(["layout.children[0].style.textColor"]);
    });

    it("rejects an unknown node type", () => {
        expect(paths(validatePublisherPageBodyV2(pageWith({ type: "paragraph", id: "a" })))).toEqual([
            "layout.children[0].type",
        ]);
    });

    it.each([
        ["a widget", { type: "text", id: "a", color: "#fff" }, "color"],
        ["a style", { type: "text", id: "a", style: { gap: 8 } }, "style.gap"],
        ["a container", { type: "row", children: [], weight: 1 }, "weight"],
    ])("rejects an unknown key on %s", (_, node, key) => {
        expect(paths(validatePublisherPageBodyV2(pageWith(node)))).toEqual([`layout.children[0].${key}`]);
    });

    it("rejects an unknown key on the page", () => {
        expect(paths(validatePublisherPageBodyV2({ ...body, format: "a4" }))).toEqual(["format"]);
    });

    it.each([
        [
            "a padding step as a gap",
            { type: "row", children: [], style: { gap: "{theme.spacing.padding.normal}" } },
        ],
        ["an unknown gap step", { type: "row", children: [], style: { gap: "{theme.spacing.gap.huge}" } }],
        [
            "a corner that is not a step",
            { type: "row", children: [], style: { borderRadius: "{theme.corners.round}" } },
        ],
        [
            "a color reference as a shadow",
            { type: "row", children: [], style: { shadow: "{theme.palette.primary}" } },
        ],
    ])("rejects a theme reference that does not fit its key: %s", (_, node) => {
        expect(validatePublisherPageBodyV2(pageWith(node))).toHaveLength(1);
    });

    it("names both accepted forms when a gap is neither", () => {
        const node = { type: "row", children: [], style: { gap: "12px" } };

        expect(validatePublisherPageBodyV2(pageWith(node))).toEqual([
            {
                path: "layout.children[0].style.gap",
                message: expect.stringContaining(
                    "a length of 0 or more, or one of {theme.spacing.gap.compact}",
                ),
            },
        ]);
    });

    it("rejects a padding step as the page gap", () => {
        expect(
            paths(validatePublisherPageBodyV2({ ...body, style: { gap: "{theme.spacing.padding.normal}" } })),
        ).toEqual(["style.gap"]);
    });

    it("accepts theme references that fit their keys", () => {
        const node = {
            type: "row",
            children: [],
            style: {
                gap: "{theme.spacing.gap.normal}",
                padding: "{theme.spacing.padding.spacious}",
                borderRadius: "{theme.corners.full}",
                shadow: "{theme.shadows.soft}",
            },
        };

        expect(validatePublisherPageBodyV2(pageWith(node))).toEqual([]);
    });

    it("accepts containers nested to any depth and an empty children list", () => {
        let layout: unknown = { type: "row", children: [] };
        for (let depth = 0; depth < 50; depth++) {
            layout = { type: depth % 2 ? "row" : "column", children: [layout] };
        }

        expect(validatePublisherPageBodyV2({ layout })).toEqual([]);
    });

    it("accepts references to visualizations and datasets that may not exist", () => {
        const node = {
            type: "visualization",
            id: "a",
            visualization: { identifier: "deleted_visualization", type: "insight" },
            dateDataSet: { identifier: "deleted_dataset", type: "dataSet" },
        };

        expect(validatePublisherPageBodyV2(pageWith(node))).toEqual([]);
    });

    it("rejects a page size other than widescreen", () => {
        expect(paths(validatePublisherPageBodyV2({ ...body, pageSize: "a4Portrait" }))).toEqual(["pageSize"]);
    });

    it.each([null, "page", [], { kind: "content" }])("rejects %j as a page body", (value) => {
        expect(validatePublisherPageBodyV2(value)).not.toEqual([]);
    });

    it("reports structure problems without running the cross-node rules", () => {
        const issues = validatePublisherPageBodyV2({
            layout: {
                type: "row",
                children: [
                    { type: "title", id: "a" },
                    { type: "title", id: "a", bad: 1 },
                ],
            },
        });

        expect(paths(issues)).toEqual(["layout.children[1].bad"]);
    });
});

describe("document structure", () => {
    it("rejects an unknown section key", () => {
        const issues = validatePublisherDocumentContentV2({
            sections: [{ id: "section_a", collapsed: true, pages: [] }],
        });

        expect(paths(issues)).toEqual(["sections[0].collapsed"]);
    });

    it("rejects an unknown content key", () => {
        expect(paths(validatePublisherDocumentContentV2({ pages: [], variables: [] }))).toEqual([
            "variables",
        ]);
    });

    it("accepts a document filter copied from a dashboard", () => {
        expect(
            validatePublisherDocumentContentV2({ pages: [], filters: [regionFilter, shipDateFilter] }),
        ).toEqual([]);
    });

    it("rejects the dashboard's common date filter, which has no dataSet", () => {
        const commonDateFilter = {
            dateFilter: {
                type: "relative",
                granularity: "GDC.time.month",
                from: -1,
                to: -1,
                localIdentifier: "common_date",
            },
        };

        expect(paths(validatePublisherDocumentContentV2({ pages: [], filters: [commonDateFilter] }))).toEqual(
            ["filters[0]"],
        );
    });

    it.each([
        [
            "an unknown filter key",
            { attributeFilter: { ...regionFilterBody, foo: 1 } },
            "filters[0].attributeFilter.foo",
        ],
        ["an unknown filter kind", { rankingFilter: {} }, "filters[0]"],
        [
            "a local identifier outside the id grammar",
            { attributeFilter: { ...regionFilterBody, localIdentifier: "region name" } },
            "filters[0].attributeFilter.localIdentifier",
        ],
        [
            "a granularity that does not exist",
            {
                dateFilter: {
                    type: "relative",
                    granularity: "GDC.time.decade",
                    dataSet: { identifier: "d", type: "dataSet" },
                    localIdentifier: "d",
                },
            },
            "filters[0].dateFilter.granularity",
        ],
    ])("rejects %s", (_, filter, path) => {
        expect(paths(validatePublisherDocumentContentV2({ pages: [], filters: [filter] }))).toEqual([path]);
    });

    it("accepts page and widget filters and widget filter references", () => {
        const filtered: IPublisherDocumentPageV2 = {
            id: "page_a",
            filters: [regionFilter],
            layout: {
                type: "visualization",
                id: "widget1",
                filters: [shipDateFilter],
                ignoreDocumentFilters: [
                    { type: "dateFilterReference", dataSet: { identifier: "ship_date", type: "dataSet" } },
                ],
            },
        };

        expect(validatePublisherDocumentContentV2({ pages: [filtered] })).toEqual([]);
    });

    it("rejects an unknown filter reference type", () => {
        const node = {
            type: "visualization",
            id: "a",
            ignoreDocumentFilters: [{ type: "rankingFilterReference" }],
        };

        expect(
            paths(validatePublisherDocumentContentV2({ pages: [{ id: "page_a", layout: node }] })),
        ).toEqual(["pages[0].layout.ignoreDocumentFilters[0]"]);
    });

    it("accepts attribute filter configs from a dashboard", () => {
        const content = {
            pages: [],
            attributeFilterConfigs: [{ localIdentifier: "document_filter_region_name", mode: "readonly" }],
        };

        expect(validatePublisherDocumentContentV2(content)).toEqual([]);
    });
});

describe("entity structure", () => {
    it("rejects an unknown entity key", () => {
        expect(paths(validatePublisherEntityV2({ ...document, periodStart: "2026-01-01" }))).toEqual([
            "periodStart",
        ]);
    });

    it("rejects a document without a period", () => {
        const { period: _period, ...withoutPeriod } = document;

        expect(paths(validatePublisherEntityV2(withoutPeriod))).toEqual(["period"]);
    });

    it.each([
        [
            "an absolute period with a relative granularity",
            { type: "absolute", granularity: "GDC.time.month", from: "2026-01-01", to: "2026-01-31" },
            "period.granularity",
        ],
        [
            "an absolute period with a bad date",
            { type: "absolute", granularity: "GDC.time.date", from: "2026-1-1", to: "2026-01-31" },
            "period.from",
        ],
        [
            "an absolute period with February 31",
            { type: "absolute", granularity: "GDC.time.date", from: "2026-02-31", to: "2026-03-31" },
            "period.from",
        ],
        [
            "an absolute period with month 13",
            { type: "absolute", granularity: "GDC.time.date", from: "2026-01-01", to: "2026-13-45" },
            "period.to",
        ],
        [
            "a relative period with a fractional offset",
            { type: "relative", granularity: "GDC.time.month", from: -1.5, to: 0 },
            "period.from",
        ],
    ])("rejects %s", (_, period, path) => {
        expect(paths(validatePublisherEntityV2({ ...document, period }))).toEqual([path]);
    });

    it("rejects an unknown period type", () => {
        const period = {
            type: "absolut",
            granularity: "GDC.time.date",
            from: "2026-01-01",
            to: "2026-06-30",
        };

        expect(validatePublisherEntityV2({ ...document, period })).toEqual([
            { path: "period.type", message: 'Expected "absolute" or "relative", got "absolut".' },
        ]);
    });

    it("accepts February 29 in a leap year", () => {
        const period = {
            type: "absolute",
            granularity: "GDC.time.date",
            from: "2028-02-29",
            to: "2028-03-31",
        };

        expect(validatePublisherEntityV2({ ...document, period })).toEqual([]);
    });

    it("rejects an unknown entity type", () => {
        expect(paths(validatePublisherEntityV2({ ...document, type: "report" }))).toEqual(["type"]);
    });

    it("accepts a persisted entity with its metadata", () => {
        const persisted = {
            ...pageTemplate,
            ref: { identifier: "cover" },
            created: "2026-10-01 10:00:00",
            updated: "2026-10-02 10:00:00",
            createdBy: { ref: { identifier: "user" }, login: "user" },
            isLocked: false,
            isDefault: false,
        };

        expect(validatePublisherEntityV2(persisted)).toEqual([]);
    });
});

function documentFilterPaths(filter: unknown): string[] {
    return paths(validatePublisherDocumentContentV2({ pages: [], filters: [filter] }));
}

function regionFilterWith(keys: Record<string, unknown>): unknown {
    return { attributeFilter: { ...regionFilterBody, ...keys } };
}

function shipDateFilterWith(keys: Record<string, unknown>): unknown {
    return { dateFilter: { ...(shipDateFilter as { dateFilter: object }).dateFilter, ...keys } };
}

function measureFilterWith(conditions: unknown[]): unknown {
    return {
        dashboardMeasureValueFilter: {
            measure: { identifier: "revenue", type: "measure" },
            localIdentifier: "revenue_filter",
            conditions,
        },
    };
}

describe("filters as the backend reads them", () => {
    it.each([
        ["without a type", { identifier: "region.name" }, "displayForm.type"],
        ["by uri", { uri: "/gdc/md/workspace/obj/1" }, "displayForm.uri"],
        [
            "with another key",
            { identifier: "region.name", type: "displayForm", title: "Region" },
            "displayForm.title",
        ],
        [
            "with a wrapped identifier",
            { identifier: { id: "region.name", type: "label" } },
            "displayForm.identifier",
        ],
    ])("rejects a reference %s", (_, displayForm, key) => {
        expect(documentFilterPaths(regionFilterWith({ displayForm }))).toContain(
            `filters[0].attributeFilter.${key}`,
        );
    });

    it("accepts any object type on a shared filter reference", () => {
        const displayForm = { identifier: "region", type: "attribute" };

        expect(documentFilterPaths(regionFilterWith({ displayForm }))).toEqual([]);
    });

    it.each([
        ["both values and uris", { values: [], uris: [] }, "attributeElements.uris"],
        ["neither values nor uris", {}, "attributeElements"],
        ["another key", { values: [], extra: 1 }, "attributeElements.extra"],
        ["a number among the values", { values: [1] }, "attributeElements.values[0]"],
    ])("rejects attribute elements with %s", (_, attributeElements, key) => {
        expect(documentFilterPaths(regionFilterWith({ attributeElements }))).toEqual([
            `filters[0].attributeFilter.${key}`,
        ]);
    });

    it("accepts attribute elements by uri, null among them", () => {
        expect(
            documentFilterPaths(regionFilterWith({ attributeElements: { uris: ["/e/1", null] } })),
        ).toEqual([]);
    });

    it.each([
        [
            "a parent filter without over",
            { filterElementsBy: [{ filterLocalIdentifier: "p" }] },
            "filterElementsBy[0].over",
        ],
        [
            "labels in over",
            { filterElementsBy: [{ filterLocalIdentifier: "p", over: { attributes: [], labels: [] } }] },
            "filterElementsBy[0].over.labels",
        ],
        [
            "a date dependency without isCommonDate",
            { filterElementsByDate: [{ filterLocalIdentifier: "d" }] },
            "filterElementsByDate[0].isCommonDate",
        ],
        [
            "a granularity on a date dependency",
            {
                filterElementsByDate: [
                    { filterLocalIdentifier: "d", isCommonDate: false, granularity: "GDC.time.year" },
                ],
            },
            "filterElementsByDate[0].granularity",
        ],
    ])("rejects %s", (_, keys, key) => {
        expect(documentFilterPaths(regionFilterWith(keys))).toEqual([`filters[0].attributeFilter.${key}`]);
    });

    it("accepts dependencies on a parent filter and on a common date", () => {
        const keys = {
            filterElementsBy: [
                {
                    filterLocalIdentifier: "p",
                    over: { attributes: [{ identifier: "a", type: "attribute" }] },
                },
            ],
            filterElementsByDate: [
                {
                    filterLocalIdentifier: "d",
                    isCommonDate: true,
                    dataSet: { identifier: "ship_date", type: "dataSet" },
                },
            ],
        };

        expect(documentFilterPaths(regionFilterWith(keys))).toEqual([]);
    });

    it.each([
        ["both ends", { granularity: "GDC.time.month", from: -1, to: 0 }, "boundedFilter.to"],
        ["no end", { granularity: "GDC.time.month" }, "boundedFilter"],
        ["a fraction", { granularity: "GDC.time.month", from: -1.5 }, "boundedFilter.from"],
        ["an end beyond 32 bits", { granularity: "GDC.time.month", to: 2 ** 31 }, "boundedFilter.to"],
        ["another key", { granularity: "GDC.time.month", from: -1, limit: 1 }, "boundedFilter.limit"],
    ])("rejects a bounded filter with %s", (_, boundedFilter, key) => {
        expect(documentFilterPaths(shipDateFilterWith({ boundedFilter }))).toEqual([
            `filters[0].dateFilter.${key}`,
        ]);
    });

    it("accepts a bounded filter with one end", () => {
        const boundedFilter = { granularity: "GDC.time.month", from: -12 };

        expect(documentFilterPaths(shipDateFilterWith({ boundedFilter }))).toEqual([]);
    });

    it.each([
        ["a fraction", -1.5],
        ["an offset below 32 bits", -(2 ** 31) - 1],
        ["an offset above 32 bits", 2 ** 31],
    ])("rejects a date filter offset that is %s", (_, from) => {
        expect(documentFilterPaths(shipDateFilterWith({ from }))).toEqual(["filters[0].dateFilter.from"]);
    });

    it("accepts date filter offsets at the 32-bit limits", () => {
        expect(documentFilterPaths(shipDateFilterWith({ from: -(2 ** 31), to: 2 ** 31 - 1 }))).toEqual([]);
    });

    it.each([
        ["of no known kind", [{ ranking: {} }], "conditions[0]"],
        [
            "of two kinds",
            [{ comparison: { operator: "EQUAL_TO", value: 1 }, range: {} }],
            "conditions[0].range",
        ],
        [
            "with a comparison operator on a range",
            [{ range: { operator: "GREATER_THAN", from: 1, to: 2 } }],
            "conditions[0].range.operator",
        ],
        [
            "with another key",
            [{ comparison: { operator: "EQUAL_TO", value: 1, measure: {} } }],
            "conditions[0].comparison.measure",
        ],
    ])("rejects a metric value condition %s", (_, conditions, key) => {
        expect(documentFilterPaths(measureFilterWith(conditions))).toEqual([
            `filters[0].dashboardMeasureValueFilter.${key}`,
        ]);
    });

    it("accepts comparison and range conditions", () => {
        const conditions = [
            { comparison: { operator: "GREATER_THAN", value: 10, treatNullValuesAs: 0 } },
            { range: { operator: "NOT_BETWEEN", from: 1, to: 2 } },
        ];

        expect(documentFilterPaths(measureFilterWith(conditions))).toEqual([]);
    });

    it.each([
        ["attributeFilter", regionFilterWith({ localIdentifier: undefined })],
        ["dateFilter", shipDateFilterWith({ localIdentifier: undefined })],
        [
            "matchAttributeFilter",
            {
                matchAttributeFilter: {
                    displayForm: { identifier: "region.name", type: "displayForm" },
                    operator: "contains",
                    literal: "EU",
                },
            },
        ],
        [
            "arbitraryAttributeFilter",
            {
                arbitraryAttributeFilter: {
                    displayForm: { identifier: "region.name", type: "displayForm" },
                    values: ["EU"],
                    negativeSelection: false,
                },
            },
        ],
    ])("requires a localIdentifier on a document %s", (variant, filter) => {
        expect(documentFilterPaths(filter)).toEqual([`filters[0].${variant}.localIdentifier`]);
    });

    it.each([
        ["empty", ""],
        ["null", null],
    ])("asks for a value when a document filter's localIdentifier is %s", (_, localIdentifier) => {
        const issues = validatePublisherDocumentContentV2({
            pages: [],
            filters: [regionFilterWith({ localIdentifier })],
        });

        expect(issues).toEqual([
            {
                path: "filters[0].attributeFilter.localIdentifier",
                message: `Expected a value, got ${JSON.stringify(localIdentifier)}.`,
            },
        ]);
    });

    it("reports a document metric value filter without a localIdentifier once", () => {
        const filter = {
            dashboardMeasureValueFilter: { measure: { identifier: "revenue", type: "measure" } },
        };

        expect(documentFilterPaths(filter)).toEqual([
            "filters[0].dashboardMeasureValueFilter.localIdentifier",
        ]);
    });

    it("leaves the localIdentifier optional on page and widget filters", () => {
        const unnamed = regionFilterWith({ localIdentifier: undefined });
        const filtered = {
            filters: [unnamed],
            layout: { type: "visualization", id: "widget1", filters: [unnamed] },
        };

        expect(validatePublisherPageBodyV2(filtered)).toEqual([]);
    });

    it.each([
        ["all", false],
        ["none", true],
    ])("accepts an empty match literal, which means %s", (_, negativeSelection) => {
        const filter = {
            matchAttributeFilter: {
                displayForm: { identifier: "region.name", type: "displayForm" },
                operator: "contains",
                literal: "",
                negativeSelection,
                localIdentifier: "region_match",
            },
        };

        expect(documentFilterPaths(filter)).toEqual([]);
    });

    it.each([
        ["null", null],
        ["a number", 1],
    ])("rejects a match literal that is %s", (_, literal) => {
        const filter = {
            matchAttributeFilter: {
                displayForm: { identifier: "region.name", type: "displayForm" },
                operator: "contains",
                literal,
                localIdentifier: "region_match",
            },
        };

        expect(documentFilterPaths(filter)).toEqual(["filters[0].matchAttributeFilter.literal"]);
    });

    it.each([
        ["a fraction", -1.5],
        ["beyond 32 bits", -(2 ** 31) - 1],
    ])("rejects a relative period offset that is %s", (_, from) => {
        const period = { type: "relative", granularity: "GDC.time.month", from, to: -1 };

        expect(paths(validatePublisherEntityV2({ ...document, period }))).toEqual(["period.from"]);
    });

    it("keeps an entity's own reference as the model writes it", () => {
        expect(validatePublisherEntityV2({ ...document, ref: { identifier: "northwind" } })).toEqual([]);
    });
});

describe("text keys on pages and containers", () => {
    const textKeys = {
        fontSize: 14,
        fontWeight: 600,
        fontStyle: "italic",
        lineHeight: 1.4,
        letterSpacing: 0.02,
        textTransform: "uppercase",
        textOverflow: "ellipsis",
    };

    it("accepts the full text group on a page and on a container", () => {
        const styled = { style: textKeys, layout: { type: "column", style: textKeys, children: [] } };

        expect(validatePublisherPageBodyV2(styled)).toEqual([]);
    });

    it.each([
        [
            "a page",
            { style: { fontWeight: 0 }, layout: { type: "column", children: [] } },
            "style.fontWeight",
        ],
        [
            "a container",
            { layout: { type: "column", style: { fontWeight: 0 }, children: [] } },
            "layout.style.fontWeight",
        ],
    ])("checks the ranges of the text keys on %s", (_, styled, key) => {
        expect(paths(validatePublisherPageBodyV2(styled))).toEqual([key]);
    });
});
