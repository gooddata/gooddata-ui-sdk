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
    getDateFilterGranularities,
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
import { validateDeclarativePublisherEntityV2 } from "./validateDeclarativePublisherEntityV2.js";

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

function asDefinition<T extends { id: string }, K extends string>(
    { id: _, ...stored }: T,
    type: K,
): Omit<T, "id"> & { type: K } {
    return { type, ...stored };
}

function namedByUri<T extends { id: string }, K extends string>(
    stored: T,
    type: K,
): Omit<T, "id"> & { type: K; ref: ObjRef } {
    return { ...asDefinition(stored, type), ref: uriRef("/gdc/md/workspace/obj/1") };
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

type AacPublisherEntityV2 =
    | AacPublisherDocumentV2
    | AacPublisherDocumentTemplateV2
    | AacPublisherPageTemplateV2;

function fixture(file: string): AacPublisherEntityV2 {
    return parse(readFileSync(join(fixturesDir, file), "utf8")) as AacPublisherEntityV2;
}

type StoredEntityV2 =
    | { kind: "document"; stored: DeclarativePublisherDocumentV2 }
    | { kind: "documentTemplate"; stored: DeclarativePublisherDocumentTemplateV2 }
    | { kind: "pageTemplate"; stored: DeclarativePublisherPageTemplateV2 };

function storedFrom(written: AacPublisherEntityV2): StoredEntityV2 {
    if (written.type === "document") {
        return { kind: "document", stored: yamlPublisherDocumentToDeclarativeV2(written) };
    }
    return written.type === "document_template"
        ? { kind: "documentTemplate", stored: yamlPublisherDocumentTemplateToDeclarativeV2(written) }
        : { kind: "pageTemplate", stored: yamlPublisherPageTemplateToDeclarativeV2(written) };
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
        const written = fixture(file);
        const entity = storedFrom(written);

        const { json, content } =
            entity.kind === "document"
                ? declarativePublisherDocumentToYamlV2(entity.stored)
                : entity.kind === "documentTemplate"
                  ? declarativePublisherDocumentTemplateToYamlV2(entity.stored)
                  : declarativePublisherPageTemplateToYamlV2(entity.stored);

        expect(json).toEqual(written);
        expect(Object.keys(json)).toEqual(Object.keys(written));
        expect(parse(content)).toEqual(json);
        expect(parse(content, { version: "1.1" })).toEqual(json);
    });

    it.each(readdirSync(fixturesDir))("reads %s into an entity the stored validator accepts", (file) => {
        const { kind, stored } = storedFrom(fixture(file));

        expect(validateDeclarativePublisherEntityV2(stored, kind)).toEqual([]);
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
        const definition: IPublisherDocumentDefinitionV2 = asDefinition(northwind, "document");

        expect(publisherDocumentDefinitionToYamlV2(definition).json).not.toHaveProperty("id");
    });

    it.each([
        [
            "document",
            asDefinition(northwind, "document"),
            () =>
                yamlPublisherDocumentToDefinitionV2(
                    viaText<AacPublisherEntityWithOptionalIdV2<AacPublisherDocumentV2>>(
                        publisherDocumentDefinitionToYamlV2(asDefinition(northwind, "document")).content,
                    ),
                ),
        ],
        [
            "document template",
            asDefinition(quarterlyTemplate, "documentTemplate"),
            () =>
                yamlPublisherDocumentTemplateToDefinitionV2(
                    viaText<AacPublisherEntityWithOptionalIdV2<AacPublisherDocumentTemplateV2>>(
                        publisherDocumentTemplateDefinitionToYamlV2(
                            asDefinition(quarterlyTemplate, "documentTemplate"),
                        ).content,
                    ),
                ),
        ],
        [
            "page template",
            asDefinition(everyWidget, "pageTemplate"),
            () =>
                yamlPublisherPageTemplateToDefinitionV2(
                    viaText<AacPublisherEntityWithOptionalIdV2<AacPublisherPageTemplateV2>>(
                        publisherPageTemplateDefinitionToYamlV2(asDefinition(everyWidget, "pageTemplate"))
                            .content,
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
        ["document", () => publisherDocumentDefinitionToYamlV2(namedByUri(northwind, "document"))],
        [
            "document template",
            () =>
                publisherDocumentTemplateDefinitionToYamlV2(
                    namedByUri(quarterlyTemplate, "documentTemplate"),
                ),
        ],
        [
            "page template",
            () => publisherPageTemplateDefinitionToYamlV2(namedByUri(everyWidget, "pageTemplate")),
        ],
    ])("rejects a %s definition named by a uri", (_, write) => {
        expect(thrownCode(write)).toBe(CoreErrorCode.ReferenceTypeNotSupported);
    });

    describe("a version it does not know", () => {
        function withVersion<T extends { version: string }>(entity: T, version: unknown) {
            return { ...entity, version };
        }

        function withoutVersion<T extends { version: string }>({ version: _, ...rest }: T) {
            return rest;
        }

        const writtenDocument = declarativePublisherDocumentToYamlV2(northwind).json;
        const tooLong = "9".repeat(100);
        const selfReferencing: Record<string, unknown> = {};
        selfReferencing["self"] = selfReferencing;

        it.each([
            {
                name: "the number 2",
                written: withVersion(writtenDocument, 2),
                code: CoreErrorCode.UnsupportedContentVersion,
                message: 'Expected "2", got 2. in: version',
            },
            {
                name: "another version",
                written: withVersion(writtenDocument, "3"),
                code: CoreErrorCode.UnsupportedContentVersion,
                message: 'Expected "2", got "3". in: version',
            },
            {
                name: "a null version",
                written: withVersion(writtenDocument, null),
                code: CoreErrorCode.UnsupportedContentVersion,
                message: 'Expected "2", got null. in: version',
            },
            {
                name: "an array as the version",
                written: withVersion(writtenDocument, ["2"]),
                code: CoreErrorCode.UnsupportedContentVersion,
                message: 'Expected "2", got an array. in: version',
            },
            {
                name: "a version longer than 80 characters",
                written: withVersion(writtenDocument, tooLong),
                code: CoreErrorCode.UnsupportedContentVersion,
                message: `Expected "2", got "${"9".repeat(78)}…. in: version`,
            },
            {
                name: "a bigint as the version",
                written: withVersion(writtenDocument, 2n),
                code: CoreErrorCode.UnsupportedContentVersion,
                message: 'Expected "2", got a bigint. in: version',
            },
            {
                name: "a version that refers to itself",
                written: withVersion(writtenDocument, selfReferencing),
                code: CoreErrorCode.UnsupportedContentVersion,
                message: 'Expected "2", got an object. in: version',
            },
            {
                name: "NaN as the version",
                written: withVersion(writtenDocument, Number.NaN),
                code: CoreErrorCode.UnsupportedContentVersion,
                message: 'Expected "2", got NaN. in: version',
            },
            {
                name: "Infinity as the version",
                written: withVersion(writtenDocument, Number.POSITIVE_INFINITY),
                code: CoreErrorCode.UnsupportedContentVersion,
                message: 'Expected "2", got Infinity. in: version',
            },
            {
                name: "-Infinity as the version",
                written: withVersion(writtenDocument, Number.NEGATIVE_INFINITY),
                code: CoreErrorCode.UnsupportedContentVersion,
                message: 'Expected "2", got -Infinity. in: version',
            },
            {
                name: "no version",
                written: withoutVersion(writtenDocument),
                code: CoreErrorCode.MissingRequiredKey,
                message: 'Missing required key "version". in: version',
            },
        ])("says what is wrong with a document written with $name", ({ written, code, message }) => {
            const error = thrown(() =>
                yamlPublisherDocumentToDeclarativeV2(written as AacPublisherDocumentV2),
            );

            expect(error?.code).toBe(code);
            expect(error?.message).toBe(message);
        });

        it.each([
            {
                kind: "document",
                direction: "read",
                convert: () =>
                    yamlPublisherDocumentToDeclarativeV2(
                        withVersion(writtenDocument, "3") as AacPublisherDocumentV2,
                    ),
            },
            {
                kind: "document",
                direction: "written",
                convert: () =>
                    declarativePublisherDocumentToYamlV2(
                        withVersion(northwind, "3") as DeclarativePublisherDocumentV2,
                    ),
            },
            {
                kind: "document template",
                direction: "read",
                convert: () =>
                    yamlPublisherDocumentTemplateToDeclarativeV2(
                        withVersion(
                            declarativePublisherDocumentTemplateToYamlV2(quarterlyTemplate).json,
                            "3",
                        ) as AacPublisherDocumentTemplateV2,
                    ),
            },
            {
                kind: "document template",
                direction: "written",
                convert: () =>
                    declarativePublisherDocumentTemplateToYamlV2(
                        withVersion(quarterlyTemplate, "3") as DeclarativePublisherDocumentTemplateV2,
                    ),
            },
            {
                kind: "page template",
                direction: "read",
                convert: () =>
                    yamlPublisherPageTemplateToDeclarativeV2(
                        withVersion(
                            declarativePublisherPageTemplateToYamlV2(everyWidget).json,
                            "3",
                        ) as AacPublisherPageTemplateV2,
                    ),
            },
            {
                kind: "page template",
                direction: "written",
                convert: () =>
                    declarativePublisherPageTemplateToYamlV2(
                        withVersion(everyWidget, "3") as DeclarativePublisherPageTemplateV2,
                    ),
            },
        ])("checks the version of a $kind when it is $direction", ({ convert }) => {
            const error = thrown(convert);

            expect(error?.code).toBe(CoreErrorCode.UnsupportedContentVersion);
            expect(error?.message).toBe('Expected "2", got "3". in: version');
        });
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
        expect(error?.context?.path).toEqual(["content", "pages", "p", "filters"]);
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
            "Item is not supported. Item: d in: content/pages/p/filters",
        );
    });

    it("rejects an ignored filter whose reference type is not a filter", () => {
        const written: AacPublisherPageTemplateV2 = {
            ...declarativePublisherPageTemplateToYamlV2(everyWidget).json,
            content: {
                layout: { type: "visualization", id: "widget1", ignored_filters: ["attribute/x"] },
            },
        };

        const error = thrown(() => yamlPublisherPageTemplateToDeclarativeV2(written));

        expect(error?.code).toBe(CoreErrorCode.ReferenceTypeNotSupported);
        expect(error?.context?.path).toEqual(["content", "widget1", "ignored_filters"]);
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

describe("v2 Publisher granularities as code", () => {
    const allowed =
        "SECOND, MINUTE, HOUR, DAY, WEEK, WEEK_US, MONTH, QUARTER, YEAR, FISCAL_YEAR, FISCAL_QUARTER, FISCAL_MONTH";
    const writtenDocument = declarativePublisherDocumentToYamlV2(monthlyReview).json;
    const writtenTemplate = declarativePublisherDocumentTemplateToYamlV2(quarterlyTemplate).json;

    function relativeFilter(granularity: unknown) {
        return { week: { type: "date_filter", date: "order_date", granularity, from: -1, to: -1 } };
    }

    function documentWith(granularity: unknown): AacPublisherDocumentV2 {
        return { ...writtenDocument, period: { granularity, from: -1, to: -1 } } as AacPublisherDocumentV2;
    }

    function templateWith(granularity: unknown): AacPublisherDocumentTemplateV2 {
        return {
            ...writtenTemplate,
            content: { ...writtenTemplate.content, defaults: { period: { granularity, from: -1, to: -1 } } },
        } as AacPublisherDocumentTemplateV2;
    }

    function documentFilterWith(granularity: unknown): AacPublisherDocumentV2 {
        return {
            ...writtenDocument,
            content: { ...writtenDocument.content, filters: relativeFilter(granularity) },
        } as AacPublisherDocumentV2;
    }

    function pageFilterWith(granularity: unknown): AacPublisherDocumentV2 {
        return {
            ...writtenDocument,
            content: {
                pages: [
                    { id: "p", layout: { type: "row", children: [] }, filters: relativeFilter(granularity) },
                ],
            },
        } as AacPublisherDocumentV2;
    }

    function pageTemplateFilterWith(granularity: unknown): AacPublisherPageTemplateV2 {
        const written = declarativePublisherPageTemplateToYamlV2(everyWidget).json;
        return {
            ...written,
            content: { layout: { type: "row", children: [] }, filters: relativeFilter(granularity) },
        } as AacPublisherPageTemplateV2;
    }

    function widgetFilterWith(granularity: unknown): AacPublisherDocumentV2 {
        const widget = { type: "visualization", id: "chart", filters: relativeFilter(granularity) };
        return {
            ...writtenDocument,
            content: { pages: [{ id: "p", layout: { type: "row", children: [widget] } }] },
        } as AacPublisherDocumentV2;
    }

    function asDocument(granularity: unknown, written: (granularity: unknown) => AacPublisherDocumentV2) {
        const stored = yamlPublisherDocumentToDeclarativeV2(written(granularity));
        return {
            stored,
            issues: validateDeclarativePublisherEntityV2(stored, "document"),
            rewritten: declarativePublisherDocumentToYamlV2(stored).json,
        };
    }

    const periodHolders = [
        {
            name: "the period",
            read: (g: unknown) => asDocument(g, documentWith),
            path: "period/granularity",
        },
        {
            name: "a template's default period",
            read: (g: unknown) => {
                const stored = yamlPublisherDocumentTemplateToDeclarativeV2(templateWith(g));
                return {
                    stored,
                    issues: validateDeclarativePublisherEntityV2(stored, "documentTemplate"),
                    rewritten: declarativePublisherDocumentTemplateToYamlV2(stored).json,
                };
            },
            path: "content/defaults/period/granularity",
        },
    ];

    const filterHolders = [
        {
            name: "a document date filter",
            read: (g: unknown) => asDocument(g, documentFilterWith),
            path: "content/filters/week/granularity",
        },
        {
            name: "a document page date filter",
            read: (g: unknown) => asDocument(g, pageFilterWith),
            path: "content/pages/p/filters/week/granularity",
        },
        {
            name: "a page template date filter",
            read: (g: unknown) => {
                const stored = yamlPublisherPageTemplateToDeclarativeV2(pageTemplateFilterWith(g));
                return {
                    stored,
                    issues: validateDeclarativePublisherEntityV2(stored, "pageTemplate"),
                    rewritten: declarativePublisherPageTemplateToYamlV2(stored).json,
                };
            },
            path: "content/filters/week/granularity",
        },
        {
            name: "a widget date filter",
            read: (g: unknown) => asDocument(g, widgetFilterWith),
            path: "content/pages/p/chart/filters/week/granularity",
        },
    ];

    const holders = [...periodHolders, ...filterHolders];

    function granularitiesIn(value: unknown): unknown[] {
        if (typeof value !== "object" || value === null) {
            return [];
        }
        const nested = Object.values(value).flatMap(granularitiesIn);
        return "granularity" in value ? [value.granularity, ...nested] : nested;
    }

    it.each(holders)(
        "stores WEEK in $name as the US week, which the stored validator accepts",
        ({ read }) => {
            const { stored, issues } = read("WEEK");

            expect(granularitiesIn(stored)).toContain("GDC.time.week_us");
            expect(granularitiesIn(stored)).not.toContain("GDC.time.week");
            expect(issues).toEqual([]);
        },
    );

    it.each(holders)("writes WEEK in $name back as WEEK_US", ({ read }) => {
        const { rewritten } = read("WEEK");

        expect(granularitiesIn(rewritten)).toContain("WEEK_US");
        expect(granularitiesIn(rewritten)).not.toContain("WEEK");
    });

    it.each(holders)("round-trips WEEK_US in $name", ({ read }) => {
        const { stored, issues, rewritten } = read("WEEK_US");

        expect(granularitiesIn(stored)).toContain("GDC.time.week_us");
        expect(issues).toEqual([]);
        expect(granularitiesIn(rewritten)).toContain("WEEK_US");
    });

    it.each(holders)("rejects a granularity no date filter has in $name", ({ read, path }) => {
        const error = thrown(() => read("FORTNIGHT"));

        expect(error?.code).toBe(CoreErrorCode.UnsupportedGranularity);
        expect(error?.message).toBe(
            `Granularity "FORTNIGHT" is not supported. Supported granularities: ${allowed}. in: ${path}`,
        );
    });

    it.each(filterHolders)("reads an empty granularity in $name as DAY, as dashboards do", ({ read }) => {
        const { stored, issues } = read(null);

        expect(stored).toEqual(read("DAY").stored);
        expect(issues).toEqual([]);
    });

    it.each(getDateFilterGranularities({ calendars: [{ type: "standard" }, { type: "fiscal" }] }))(
        "round-trips a %s period",
        (granularity) => {
            const stored = {
                ...monthlyReview,
                period: { type: "relative", granularity, from: -1, to: -1 },
            } as const;

            const read = yamlPublisherDocumentToDeclarativeV2(
                declarativePublisherDocumentToYamlV2(stored).json,
            );

            expect(read.period).toEqual(stored.period);
        },
    );

    it("stores WEEK in an absolute document date filter as the US week", () => {
        const written = {
            ...writtenDocument,
            content: {
                ...writtenDocument.content,
                filters: {
                    week: {
                        type: "date_filter",
                        date: "order_date",
                        granularity: "WEEK",
                        from: "2026-01-05",
                        to: "2026-01-11",
                    },
                },
            },
        } as AacPublisherDocumentV2;

        const stored = yamlPublisherDocumentToDeclarativeV2(written);

        expect(granularitiesIn(stored)).toContain("GDC.time.week_us");
        expect(granularitiesIn(stored)).not.toContain("GDC.time.week");
        expect(validateDeclarativePublisherEntityV2(stored, "document")).toEqual([]);
    });

    it("checks the granularity of date filters only", () => {
        const written = {
            ...writtenDocument,
            content: {
                ...writtenDocument.content,
                filters: {
                    region: { type: "attribute_filter", using: "label/region", granularity: "FORTNIGHT" },
                },
            },
        } as AacPublisherDocumentV2;

        expect(yamlPublisherDocumentToDeclarativeV2(written).content.filters).toHaveLength(1);
    });

    const selfReferencing: Record<string, unknown> = {};
    selfReferencing["self"] = selfReferencing;

    it.each([
        { name: "a number", granularity: 7, described: "7" },
        { name: "NaN", granularity: Number.NaN, described: "NaN" },
        { name: "a bigint", granularity: 2n, described: "a bigint" },
        { name: "null", granularity: null, described: "null" },
        { name: "an array", granularity: ["MONTH"], described: "an array" },
        { name: "an object", granularity: { month: 1 }, described: '{"month":1}' },
        { name: "an object that refers to itself", granularity: selfReferencing, described: "an object" },
        { name: "a long string", granularity: "W".repeat(100), described: `"${"W".repeat(78)}…` },
    ])("describes $name written as the granularity", ({ granularity, described }) => {
        const error = thrown(() => yamlPublisherDocumentToDeclarativeV2(documentWith(granularity)));

        expect(error?.message).toBe(
            `Granularity ${described} is not supported. Supported granularities: ${allowed}. in: period/granularity`,
        );
    });
});
