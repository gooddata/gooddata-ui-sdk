// (C) 2026 GoodData Corporation

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";
import { parse } from "yaml";

import {
    type FilterContextItem,
    type IDashboardAttributeFilterConfig,
    type IPublisherDocumentDefinitionV2,
    type IPublisherDocumentPageV2,
    type ObjRef,
    type PublisherLayoutNodeV2,
    idRef,
    uriRef,
} from "@gooddata/sdk-model";

import {
    type DeclarativePublisherDocumentTemplateV2,
    type DeclarativePublisherDocumentV2,
    type DeclarativePublisherPageTemplateV2,
} from "./declarativePublisherTypesV2.js";
import {
    declarativePublisherDocumentTemplateToYamlV2,
    declarativePublisherDocumentToYamlV2,
    declarativePublisherPageTemplateToYamlV2,
    publisherDocumentDefinitionToYamlV2,
    publisherDocumentTemplateDefinitionToYamlV2,
    publisherPageTemplateDefinitionToYamlV2,
} from "./from/declarativePublisherEntityToYamlV2.js";
import {
    type AacDashboardFilters,
    type AacPublisherDocumentTemplateV2,
    type AacPublisherDocumentV2,
    type AacPublisherEntityWithOptionalIdV2,
    type AacPublisherPageTemplateV2,
} from "./schemas/types.js";
import {
    yamlPublisherDocumentTemplateToDeclarativeV2,
    yamlPublisherDocumentTemplateToDefinitionV2,
    yamlPublisherDocumentToDeclarativeV2,
    yamlPublisherDocumentToDefinitionV2,
    yamlPublisherPageTemplateToDeclarativeV2,
    yamlPublisherPageTemplateToDefinitionV2,
} from "./to/yamlPublisherEntityToDeclarativeV2.js";
import { CoreErrorCode, type ICoreError } from "./utils/errors.js";

const fixturesDir = join(import.meta.dirname, "../fixtures/publisherV2/valid");

const regionFilter: FilterContextItem = {
    attributeFilter: {
        displayForm: { identifier: "region.name", type: "displayForm" },
        negativeSelection: true,
        attributeElements: { uris: [] },
        localIdentifier: "document_filter_region_name",
        title: "Region",
        selectionMode: "multi",
    },
};

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

const northwind: DeclarativePublisherDocumentV2 = {
    id: "northwind-h1-2026",
    type: "document",
    version: "2",
    title: "Northwind, H1 2026",
    description: "Half-year revenue review",
    tags: ["revenue", "h1"],
    period: { type: "absolute", granularity: "GDC.time.date", from: "2026-01-01", to: "2026-06-30" },
    content: {
        defaults: {
            pageSize: "widescreen",
            takeaway: { generation: { instructions: "Write for executives. Lead with the change." } },
        },
        style: { backgroundColor: "{theme.colors.backgrounds.inverse}", gap: 40 },
        filters: [regionFilter, shipDateFilter],
        sections: [
            {
                id: "section_5e0a1f3c",
                pages: [
                    {
                        id: "page_7f3a91c4",
                        kind: "cover",
                        style: {
                            backgroundImage: "{theme.coverImage}",
                            padding: "{theme.spacing.padding.spacious}",
                            textColor: "{theme.colors.texts.inverse}",
                        },
                        layout: {
                            type: "column",
                            children: [
                                {
                                    type: "image",
                                    id: "coverLogo",
                                    source: "{theme.logo}",
                                    decorative: true,
                                    style: { fit: "contain", horizontalAlign: "left" },
                                },
                                {
                                    type: "title",
                                    id: "coverTitle",
                                    proportion: 3,
                                    markdown: "{documentName}",
                                    style: { verticalAlign: "bottom" },
                                },
                            ],
                        },
                    },
                ],
            },
            {
                id: "section_9a4d2b71",
                title: "Revenue",
                description: "Sales by region and month",
                pages: [
                    {
                        id: "page_c41d9a07",
                        kind: "content",
                        notes: "Mention the EMEA promotion.",
                        layout: {
                            type: "row",
                            children: [
                                {
                                    type: "visualization",
                                    id: "widget1",
                                    proportion: 2,
                                    visualization: { identifier: "revenue_by_month", type: "insight" },
                                    title: { visible: true, text: "Revenue by month" },
                                    altText: "Monthly revenue from January to June",
                                    dateDataSet: { identifier: "order_date", type: "dataSet" },
                                    ignoreDocumentFilters: [
                                        {
                                            type: "attributeFilterReference",
                                            displayForm: { identifier: "region.name", type: "displayForm" },
                                        },
                                    ],
                                    style: {
                                        backgroundColor: "{theme.colors.backgrounds.surface}",
                                        padding: 24,
                                        borderRadius: "{theme.corners.medium}",
                                    },
                                },
                                {
                                    type: "takeaway",
                                    id: "takeaway",
                                    title: { text: "Key takeaway" },
                                    markdown: "EMEA led growth with **+18 %**.",
                                    generation: { instructions: "Compare the regions." },
                                },
                            ],
                        },
                    },
                    {
                        id: "page_d82e4b10",
                        visible: false,
                        kind: "content",
                        layout: {
                            type: "column",
                            children: [
                                { type: "heading", id: "appendixHeading", level: 1, markdown: "Appendix" },
                                { type: "text", id: "method", markdown: "Revenue is net of returns." },
                            ],
                        },
                    },
                ],
            },
        ],
    },
};

const monthlyReview: DeclarativePublisherDocumentV2 = {
    id: "monthly_review",
    type: "document",
    version: "2",
    title: "Monthly review",
    period: { type: "relative", granularity: "GDC.time.month", from: -1, to: -1 },
    content: {
        locale: "de-DE",
        formatLocale: "de-DE",
        filters: [],
        pages: [
            { id: "cover", layout: { type: "title", id: "title", markdown: "{documentName}" } },
            {
                id: "appendix",
                visible: false,
                layout: { type: "column", children: [] },
            },
        ],
    },
};

const quarterlyTemplate: DeclarativePublisherDocumentTemplateV2 = {
    id: "quarterly_review",
    type: "documentTemplate",
    version: "2",
    title: "Quarterly review",
    content: {
        defaults: { period: { type: "relative", granularity: "GDC.time.quarter", from: -1, to: -1 } },
        filters: [regionFilter],
        attributeFilterConfigs: [
            {
                localIdentifier: "document_filter_region_name",
                mode: "readonly",
                displayAsLabel: { identifier: "region.code", type: "displayForm" },
                selectionType: "text",
            },
        ],
        sections: [{ id: "intro", title: "Introduction", pages: [] }],
    },
};

const everyWidget: DeclarativePublisherPageTemplateV2 = {
    id: "every_widget",
    type: "pageTemplate",
    version: "2",
    title: "Every widget",
    content: {
        kind: "content",
        pageSize: "widescreen",
        style: { gap: "{theme.spacing.gap.normal}", textStyle: "normalText" },
        layout: {
            type: "column",
            id: "root",
            locked: true,
            style: { borderLeftWidth: 8, borderLeftColor: "{theme.colors.lines.accent}", shadow: "none" },
            children: [
                { type: "title", id: "pageTitle", placeholder: { hint: "Page title", required: true } },
                {
                    type: "image",
                    id: "photo",
                    source: "https://cdn.example.com/{brandName}/hero.png",
                    altText: "{brandName} spring collection",
                    style: { fit: "cover", verticalAlign: "top", borderTopLeftRadius: 16, shadowX: -2 },
                },
                {
                    type: "visualization",
                    id: "widget1",
                    ignoreDocumentPeriod: true,
                    filters: [shipDateFilter],
                    ignoreDocumentFilters: [
                        {
                            type: "dateFilterReference",
                            dataSet: { identifier: "ship_date", type: "dataSet" },
                        },
                        {
                            type: "measureValueFilterReference",
                            measure: { identifier: "revenue", type: "measure" },
                        },
                        {
                            type: "attributeFilterReference",
                            displayForm: { identifier: "region_group", type: "computedAttribute" },
                        },
                    ],
                    display: {
                        legend: { visible: true, position: "bottom" },
                        xAxis: { values: { rotation: -45 } },
                        secondaryYAxis: { name: { visible: false, position: "high" }, min: 0, max: 100 },
                        gridlines: { visible: false },
                        dataLabels: { visible: "auto" },
                    },
                    style: {
                        chart: { axisValueColor: "{theme.colors.texts.muted}", dataLabelSize: 12 },
                        table: { rowHeight: 32, headerBackgroundColor: "#f1f5f9" },
                        headline: { primaryValueColor: "rgb(18, 58, 95)" },
                    },
                },
                {
                    type: "takeaway",
                    id: "takeaway",
                    generation: {
                        instructions: "Compare the regions.",
                        context: { widgets: ["widget1"], pageTitle: true, otherPages: false },
                    },
                    style: { backgroundOpacity: 0.08, textOverflow: "shrink" },
                },
            ],
        },
    },
};

/** The YAML goes through its text, as the editors and the wheel hand it over. */
function viaText<T>(content: string): T {
    return parse(content) as T;
}

function thrown(convert: () => unknown): ICoreError | undefined {
    try {
        convert();
    } catch (error) {
        return error as ICoreError;
    }
    return undefined;
}

function withoutId<T extends { id: string }>({ id: _, ...stored }: T): Omit<T, "id"> {
    return stored;
}

function namedByUri<T extends { id: string }>({ id: _, ...stored }: T): Omit<T, "id"> & { ref: ObjRef } {
    return { ...stored, ref: uriRef("/gdc/md/workspace/obj/1") };
}

const orderAmountFilter = {
    type: "metric_value_filter",
    using: "metric/order_amount",
    conditions: [{ condition: "GREATER_THAN", value: 1 }],
} as const;

function withYamlContent(
    document: DeclarativePublisherDocumentV2,
    content: AacPublisherDocumentV2["content"],
) {
    return { ...declarativePublisherDocumentToYamlV2(document).json, content };
}

function thrownCode(convert: () => unknown): CoreErrorCode | undefined {
    return thrown(convert)?.code;
}

function withPage(document: DeclarativePublisherDocumentV2, page: IPublisherDocumentPageV2) {
    return { ...document, content: { pages: [page] } };
}

describe("v2 Publisher entities as code", () => {
    it.each([
        ["a document with sections, a hidden page and an absolute period", northwind],
        ["a document with a relative period, a hidden page and no filters", monthlyReview],
    ])("round-trips %s", (_, document) => {
        const { content } = declarativePublisherDocumentToYamlV2(document);

        expect(yamlPublisherDocumentToDeclarativeV2(viaText<AacPublisherDocumentV2>(content))).toEqual(
            document,
        );
    });

    it("round-trips a document template with sections, a default period and filter settings", () => {
        const { content } = declarativePublisherDocumentTemplateToYamlV2(quarterlyTemplate);

        expect(
            yamlPublisherDocumentTemplateToDeclarativeV2(viaText<AacPublisherDocumentTemplateV2>(content)),
        ).toEqual(quarterlyTemplate);
    });

    it("round-trips a page template with every widget type", () => {
        const { content } = declarativePublisherPageTemplateToYamlV2(everyWidget);

        expect(
            yamlPublisherPageTemplateToDeclarativeV2(viaText<AacPublisherPageTemplateV2>(content)),
        ).toEqual(everyWidget);
    });

    it.each(readdirSync(fixturesDir))("writes back what it reads: %s", (file) => {
        const written = parse(readFileSync(join(fixturesDir, file), "utf8")) as
            | AacPublisherDocumentV2
            | AacPublisherDocumentTemplateV2
            | AacPublisherPageTemplateV2;

        const { json, content } =
            written.type === "document"
                ? declarativePublisherDocumentToYamlV2(yamlPublisherDocumentToDeclarativeV2(written))
                : written.type === "document_template"
                  ? declarativePublisherDocumentTemplateToYamlV2(
                        yamlPublisherDocumentTemplateToDeclarativeV2(written),
                    )
                  : declarativePublisherPageTemplateToYamlV2(
                        yamlPublisherPageTemplateToDeclarativeV2(written),
                    );

        expect(json).toEqual(written);
        expect(Object.keys(json)).toEqual(Object.keys(written));
        expect(parse(content)).toEqual(json);
        expect(parse(content, { version: "1.1" })).toEqual(json);
    });

    it("writes strings that YAML 1.1 or 1.2 would read as another type quoted", () => {
        const { content, json } = declarativePublisherDocumentToYamlV2(
            withPage(northwind, {
                id: "page",
                layout: {
                    type: "column",
                    children: [
                        { type: "text", id: "no", markdown: "no" },
                        { type: "heading", id: "yes", level: 1, markdown: "Yes" },
                        { type: "text", id: "on", markdown: "on" },
                        { type: "text", id: "octal", markdown: "0o17" },
                        { type: "text", id: "value", markdown: "=" },
                        { type: "text", id: "merge", markdown: "<<" },
                        { type: "image", id: "photo", source: "x.png", altText: "2026-01-01 10:00:00" },
                    ],
                },
            }),
        );

        expect(content).toContain('version: "2"');
        expect(content).toContain('from: "2026-01-01"');
        expect(content).toContain('to: "2026-06-30"');
        expect(content).toContain('markdown: "no"');
        expect(content).toContain('markdown: "Yes"');
        expect(content).toContain('markdown: "on"');
        expect(content).toContain('markdown: "0o17"');
        expect(content).toContain('markdown: "="');
        expect(content).toContain('markdown: "<<"');
        expect(content).toContain('alt_text: "2026-01-01 10:00:00"');
        expect(content).not.toContain("%YAML");
        expect(parse(content)).toEqual(json);
        expect(parse(content, { version: "1.1" })).toEqual(json);
    });

    it("writes the entity keys in the as-code order", () => {
        const { json } = declarativePublisherDocumentToYamlV2(northwind);

        expect(Object.keys(json)).toEqual([
            "type",
            "id",
            "version",
            "title",
            "description",
            "tags",
            "period",
            "content",
        ]);
    });

    it("keeps unset defaults out, either way", () => {
        const template: DeclarativePublisherDocumentTemplateV2 = {
            ...quarterlyTemplate,
            content: { pages: [], defaults: { pageSize: "widescreen" } },
        };
        const { json, content } = declarativePublisherDocumentTemplateToYamlV2(template);
        const stored = yamlPublisherDocumentTemplateToDeclarativeV2(
            viaText<AacPublisherDocumentTemplateV2>(content),
        );

        expect(Object.keys(json.content.defaults ?? {})).toEqual(["page_size"]);
        expect(Object.keys(stored.content.defaults ?? {})).toEqual(["pageSize"]);
    });

    it("names a definition by its reference and writes the reference back as the id", () => {
        const { content } = declarativePublisherDocumentToYamlV2(northwind);
        const definition = yamlPublisherDocumentToDefinitionV2(viaText<AacPublisherDocumentV2>(content));

        expect(definition.ref).toEqual(idRef("northwind-h1-2026"));
        expect(publisherDocumentDefinitionToYamlV2(definition).json.id).toBe("northwind-h1-2026");
    });

    it("writes a definition without a reference without an id", () => {
        const definition: IPublisherDocumentDefinitionV2 = withoutId(northwind);

        expect(publisherDocumentDefinitionToYamlV2(definition).json).not.toHaveProperty("id");
    });

    it.each([
        [
            "document",
            withoutId(northwind),
            () =>
                yamlPublisherDocumentToDefinitionV2(
                    viaText<AacPublisherEntityWithOptionalIdV2<AacPublisherDocumentV2>>(
                        publisherDocumentDefinitionToYamlV2(withoutId(northwind)).content,
                    ),
                ),
        ],
        [
            "document template",
            withoutId(quarterlyTemplate),
            () =>
                yamlPublisherDocumentTemplateToDefinitionV2(
                    viaText<AacPublisherEntityWithOptionalIdV2<AacPublisherDocumentTemplateV2>>(
                        publisherDocumentTemplateDefinitionToYamlV2(withoutId(quarterlyTemplate)).content,
                    ),
                ),
        ],
        [
            "page template",
            withoutId(everyWidget),
            () =>
                yamlPublisherPageTemplateToDefinitionV2(
                    viaText<AacPublisherEntityWithOptionalIdV2<AacPublisherPageTemplateV2>>(
                        publisherPageTemplateDefinitionToYamlV2(withoutId(everyWidget)).content,
                    ),
                ),
        ],
    ])("reads a %s definition written without a reference back without one", (_, definition, readBack) => {
        expect(readBack()).toEqual(definition);
    });

    it("reads a definition whose id is written without a value back without a reference", () => {
        const { content } = declarativePublisherDocumentToYamlV2(northwind);
        const emptyId = content.replace("id: northwind-h1-2026\n", "id:\n");

        expect(emptyId).not.toBe(content);
        expect(
            yamlPublisherDocumentToDefinitionV2(viaText<AacPublisherDocumentV2>(emptyId)),
        ).not.toHaveProperty("ref");
    });
});

describe("v2 Publisher entities as code: what the convertor rejects", () => {
    it.each([
        ["document", () => publisherDocumentDefinitionToYamlV2(namedByUri(northwind))],
        [
            "document template",
            () => publisherDocumentTemplateDefinitionToYamlV2(namedByUri(quarterlyTemplate)),
        ],
        ["page template", () => publisherPageTemplateDefinitionToYamlV2(namedByUri(everyWidget))],
    ])("rejects a %s definition named by a uri", (_, write) => {
        expect(thrownCode(write)).toBe(CoreErrorCode.ReferenceTypeNotSupported);
    });

    it.each([2, "3", undefined])("rejects as-code version %s", (version) => {
        const written = { ...declarativePublisherDocumentToYamlV2(northwind).json, version };

        expect(
            thrownCode(() => yamlPublisherDocumentToDeclarativeV2(written as AacPublisherDocumentV2)),
        ).toBe(CoreErrorCode.UnsupportedContentVersion);
    });

    it("rejects a stored version it does not know", () => {
        const stored = { ...northwind, version: "3" };

        expect(
            thrownCode(() =>
                declarativePublisherDocumentToYamlV2(stored as unknown as DeclarativePublisherDocumentV2),
            ),
        ).toBe(CoreErrorCode.UnsupportedContentVersion);
    });

    describe("a layout node of a type it does not know", () => {
        const unknownNode = { type: "chart", id: "chart" } as unknown as PublisherLayoutNodeV2;

        it("is refused when written", () => {
            const stored: DeclarativePublisherPageTemplateV2 = {
                ...everyWidget,
                content: { layout: { type: "column", id: "root", children: [unknownNode] } },
            };

            expect(thrownCode(() => declarativePublisherPageTemplateToYamlV2(stored))).toBe(
                CoreErrorCode.ItemNotSupported,
            );
        });

        it("is refused when read", () => {
            const written = {
                ...declarativePublisherPageTemplateToYamlV2(everyWidget).json,
                content: { layout: unknownNode },
            } as unknown as AacPublisherPageTemplateV2;

            expect(thrownCode(() => yamlPublisherPageTemplateToDeclarativeV2(written))).toBe(
                CoreErrorCode.ItemNotSupported,
            );
        });
    });

    it("rejects a document date filter that names no dataset, either way", () => {
        const unnamed: FilterContextItem = {
            dateFilter: {
                type: "relative",
                granularity: "GDC.time.month",
                from: -1,
                to: -1,
                localIdentifier: "f",
            },
        };
        const stored: DeclarativePublisherDocumentV2 = {
            ...monthlyReview,
            content: { pages: [], filters: [unnamed] },
        };
        const written: AacPublisherDocumentV2 = {
            ...declarativePublisherDocumentToYamlV2(monthlyReview).json,
            content: {
                pages: [],
                filters: { f: { type: "date_filter", granularity: "MONTH", from: -1, to: -1 } },
            },
        };

        expect(thrownCode(() => declarativePublisherDocumentToYamlV2(stored))).toBe(
            CoreErrorCode.DateFilterWithoutDataSet,
        );
        expect(thrownCode(() => yamlPublisherDocumentToDeclarativeV2(written))).toBe(
            CoreErrorCode.DateFilterWithoutDataSet,
        );
    });

    it.each([
        ["a filter group", { g: { type: "filter_group", title: "Group", filters: {} } }],
        [
            "a date filter title",
            { d: { type: "date_filter", date: "ship_date", from: -1, to: -1, title: "Ship" } },
        ],
        [
            "a date filter titled active",
            { d: { type: "date_filter", date: "ship_date", from: -1, to: -1, title: "active" } },
        ],
        [
            "a date filter mode",
            { d: { type: "date_filter", date: "ship_date", from: -1, to: -1, mode: "hidden" } },
        ],
    ])("rejects %s, which a document cannot store", (_, filters) => {
        const written = {
            ...declarativePublisherDocumentToYamlV2(monthlyReview).json,
            content: { pages: [], filters },
        };

        expect(
            thrownCode(() => yamlPublisherDocumentToDeclarativeV2(written as AacPublisherDocumentV2)),
        ).toBe(CoreErrorCode.FilterSettingNotStorable);
    });

    it("rejects attribute filter settings on a page, which only a document stores", () => {
        const written: AacPublisherPageTemplateV2 = {
            ...declarativePublisherPageTemplateToYamlV2(everyWidget).json,
            content: {
                layout: { type: "row", children: [] },
                filters: {
                    r: {
                        type: "attribute_filter",
                        using: "label/region.name",
                        display_as: "label/region.code",
                    },
                },
            },
        };

        expect(thrownCode(() => yamlPublisherPageTemplateToDeclarativeV2(written))).toBe(
            CoreErrorCode.FilterSettingNotStorable,
        );
    });

    const convertWithFilters: Record<
        "document" | "page template",
        (filters: AacDashboardFilters) => unknown
    > = {
        document: (filters) =>
            yamlPublisherDocumentToDeclarativeV2({
                ...declarativePublisherDocumentToYamlV2(monthlyReview).json,
                content: { pages: [], filters },
            }),
        "page template": (filters) =>
            yamlPublisherPageTemplateToDeclarativeV2({
                ...declarativePublisherPageTemplateToYamlV2(everyWidget).json,
                content: { layout: { type: "row", children: [] }, filters },
            }),
    };

    it.each([
        ["page template", "readonly"],
        ["page template", "hidden"],
        ["document", "readonly"],
        ["document", "hidden"],
    ] as const)("rejects a metric value filter mode on a %s: %s", (holder, mode) => {
        const filters: AacDashboardFilters = { revenue: { ...orderAmountFilter, mode } };

        expect(thrownCode(() => convertWithFilters[holder](filters))).toBe(
            CoreErrorCode.FilterSettingNotStorable,
        );
    });

    it("names a stored document date filter without a local id by its position", () => {
        const unnamed: FilterContextItem = {
            dateFilter: { type: "relative", granularity: "GDC.time.month", from: -1, to: -1 },
        };
        const stored: DeclarativePublisherDocumentV2 = {
            ...monthlyReview,
            content: { pages: [], filters: [regionFilter, unnamed] },
        };

        expect(thrown(() => declarativePublisherDocumentToYamlV2(stored))?.message).toContain('"#1"');
    });

    it("rejects a stored page filter the dashboard writer would skip, naming it and its page", () => {
        const allTime: FilterContextItem = {
            dateFilter: { type: "relative", granularity: "GDC.time.year", localIdentifier: "x" },
        };
        const stored: DeclarativePublisherDocumentV2 = {
            ...monthlyReview,
            content: {
                sections: [
                    {
                        id: "s",
                        pages: [{ id: "p", layout: { type: "row", children: [] }, filters: [allTime] }],
                    },
                ],
            },
        };

        const error = thrown(() => declarativePublisherDocumentToYamlV2(stored));

        expect(error?.code).toBe(CoreErrorCode.ItemNotSupported);
        expect(error?.message).toBe("Item is not supported. Item: x in: content/sections/s/pages/p");
    });

    it("rejects a stored page filter the dashboard writer would skip, even when a kept filter shares its key", () => {
        const allTime: FilterContextItem = {
            dateFilter: { type: "relative", granularity: "GDC.time.year", localIdentifier: "x" },
        };
        const region: FilterContextItem = {
            attributeFilter: { ...regionFilter.attributeFilter, localIdentifier: "x" },
        };
        const stored = withPage(monthlyReview, {
            id: "p",
            layout: { type: "row", children: [] },
            filters: [allTime, region],
        });

        expect(thrownCode(() => declarativePublisherDocumentToYamlV2(stored))).toBe(
            CoreErrorCode.ItemNotSupported,
        );
    });

    it("rejects a YAML page filter the dashboard reader drops", () => {
        const written: AacPublisherDocumentV2 = {
            ...declarativePublisherDocumentToYamlV2(monthlyReview).json,
            content: {
                pages: [
                    {
                        id: "p",
                        layout: { type: "row", children: [] },
                        filters: { d: { type: "date_filter" } },
                    },
                ],
            },
        };

        const error = thrown(() => yamlPublisherDocumentToDeclarativeV2(written));

        expect(error?.code).toBe(CoreErrorCode.ItemNotSupported);
        expect(error?.context?.path).toEqual(["content", "pages", "p"]);
    });

    it("rejects a YAML all-time page date filter the dashboard writer would skip", () => {
        const written: AacPublisherDocumentV2 = {
            ...declarativePublisherDocumentToYamlV2(monthlyReview).json,
            content: {
                pages: [
                    {
                        id: "p",
                        layout: { type: "row", children: [] },
                        filters: { d: { type: "date_filter", granularity: "YEAR" } },
                    },
                ],
            },
        };

        expect(thrown(() => yamlPublisherDocumentToDeclarativeV2(written))?.message).toBe(
            "Item is not supported. Item: d in: content/pages/p",
        );
    });

    it("rejects an ignored filter whose reference type is not a filter", () => {
        const written: AacPublisherPageTemplateV2 = {
            ...declarativePublisherPageTemplateToYamlV2(everyWidget).json,
            content: {
                layout: { type: "visualization", id: "widget1", ignored_filters: ["attribute/x"] },
            },
        };

        expect(thrownCode(() => yamlPublisherPageTemplateToDeclarativeV2(written))).toBe(
            CoreErrorCode.ReferenceTypeNotSupported,
        );
    });

    it.each([
        ["with no filters", undefined],
        ["for a filter it does not hold", [regionFilter]],
    ])("rejects stored attribute filter settings %s", (_, filters) => {
        const template: DeclarativePublisherDocumentTemplateV2 = {
            ...quarterlyTemplate,
            content: {
                pages: [],
                ...(filters === undefined ? {} : { filters }),
                attributeFilterConfigs: [{ localIdentifier: "unknown", mode: "readonly" }],
            },
        };

        expect(thrownCode(() => declarativePublisherDocumentTemplateToYamlV2(template))).toBe(
            CoreErrorCode.ItemNotSupported,
        );
    });

    it.each([
        ["document", () => yamlPublisherDocumentToDeclarativeV2(withYamlContent(monthlyReview, {}))],
        [
            "document template",
            () =>
                yamlPublisherDocumentTemplateToDeclarativeV2({
                    ...declarativePublisherDocumentTemplateToYamlV2(quarterlyTemplate).json,
                    content: {},
                }),
        ],
    ])("rejects a %s as code with neither pages nor sections", (_, read) => {
        expect(thrownCode(read)).toBe(CoreErrorCode.PagesOrSectionsRequired);
    });

    it.each([
        [
            "both pages and sections, which would lose the top-level pages",
            CoreErrorCode.PagesAndSectionsMutuallyExclusive,
            true,
        ],
        ["neither pages nor sections", CoreErrorCode.PagesOrSectionsRequired, false],
    ])("rejects stored content with %s", (_, code, both) => {
        const [page] = monthlyReview.content.pages ?? [];
        const content = both ? { pages: [page], sections: [{ id: "s", pages: [page] }] } : {};
        const document = { ...monthlyReview, content } as unknown as DeclarativePublisherDocumentV2;
        const template = {
            ...quarterlyTemplate,
            content,
        } as unknown as DeclarativePublisherDocumentTemplateV2;

        expect(thrownCode(() => declarativePublisherDocumentToYamlV2(document))).toBe(code);
        expect(thrownCode(() => declarativePublisherDocumentTemplateToYamlV2(template))).toBe(code);
    });

    it("reads a pages key written without a value as no pages", () => {
        const written = parse(
            'type: document\nid: d\nversion: "2"\ntitle: D\nperiod: {from: "2026-01-01", to: "2026-01-31"}\ncontent:\n  pages:\n',
        );

        expect(
            thrownCode(() => yamlPublisherDocumentToDeclarativeV2(written as AacPublisherDocumentV2)),
        ).toBe(CoreErrorCode.PagesOrSectionsRequired);
    });

    it("rejects a pages key written without a value next to sections, as the schema does", () => {
        const written = parse(
            'type: document\nid: d\nversion: "2"\ntitle: D\nperiod: {from: "2026-01-01", to: "2026-01-31"}\ncontent:\n  pages:\n  sections: []\n',
        );

        expect(
            thrownCode(() => yamlPublisherDocumentToDeclarativeV2(written as AacPublisherDocumentV2)),
        ).toBe(CoreErrorCode.PagesAndSectionsMutuallyExclusive);
    });

    it("rejects content with both pages and sections", () => {
        const written: AacPublisherDocumentV2 = {
            ...declarativePublisherDocumentToYamlV2(monthlyReview).json,
            content: { pages: [], sections: [] },
        };

        expect(thrownCode(() => yamlPublisherDocumentToDeclarativeV2(written))).toBe(
            CoreErrorCode.PagesAndSectionsMutuallyExclusive,
        );
    });
});

describe("v2 Publisher filters as code: the normal form", () => {
    it("keeps page filters whose mode only says they are active, and stores no mode", () => {
        const { content } = yamlPublisherPageTemplateToDeclarativeV2({
            ...declarativePublisherPageTemplateToYamlV2(everyWidget).json,
            content: {
                layout: { type: "row", children: [] },
                filters: {
                    region: { type: "attribute_filter", using: "label/region.name", mode: "active" },
                    revenue: { ...orderAmountFilter, mode: "active" },
                },
            },
        });

        expect(content.filters).toHaveLength(2);
        expect(JSON.stringify(content.filters)).not.toMatch(/"mode"|"active"/);
    });

    function roundTripFilters(
        filters: FilterContextItem[],
        attributeFilterConfigs?: IDashboardAttributeFilterConfig[],
    ): DeclarativePublisherDocumentTemplateV2["content"] {
        const template: DeclarativePublisherDocumentTemplateV2 = {
            ...quarterlyTemplate,
            content: { pages: [], filters, ...(attributeFilterConfigs ? { attributeFilterConfigs } : {}) },
        };
        const { content } = declarativePublisherDocumentTemplateToYamlV2(template);
        return yamlPublisherDocumentTemplateToDeclarativeV2(viaText<AacPublisherDocumentTemplateV2>(content))
            .content;
    }

    it("stores attribute elements as uris, even when they were values", () => {
        const byValue: FilterContextItem = {
            attributeFilter: {
                displayForm: { identifier: "region.name", type: "displayForm" },
                negativeSelection: false,
                attributeElements: { values: ["EMEA"] },
                localIdentifier: "document_filter_region_name",
                selectionMode: "multi",
            },
        };

        expect(roundTripFilters([byValue]).filters).toEqual([
            {
                attributeFilter: {
                    ...byValue.attributeFilter,
                    attributeElements: { uris: ["EMEA"] },
                },
            },
        ]);
    });

    it("stores an attribute filter without a selection mode as a multi-select one", () => {
        const { selectionMode: _, ...withoutMode } = regionFilter.attributeFilter;

        expect(roundTripFilters([{ attributeFilter: withoutMode }]).filters).toEqual([regionFilter]);
    });

    it("drops an attribute filter setting that only says the filter is active", () => {
        const content = roundTripFilters(
            [regionFilter],
            [{ localIdentifier: "document_filter_region_name", mode: "active" }],
        );

        expect(content.attributeFilterConfigs).toBeUndefined();
    });
});
