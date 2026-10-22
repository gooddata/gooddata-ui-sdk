// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type {
    PublisherDocumentContentV2 as AacPublisherDocumentContentV2,
    PublisherLayoutNodeV2 as AacPublisherLayoutNodeV2,
    PublisherVisualizationWidgetV2,
} from "@gooddata/sdk-code-schemas/v1";
import { validatePublisherEntityV2 } from "@gooddata/sdk-model";

import { type AacPublisherDocumentV2 } from "./schemas/types.js";
import { publisherIssueToCodeV2 } from "./to/publisherIssueToCodeV2.js";
import { yamlPublisherDocumentToDefinitionV2 } from "./to/yamlPublisherEntityToDeclarativeV2.js";

const storedFilters = {
    content: {
        filters: [
            { dateFilter: { localIdentifier: "ship_date" } },
            { attributeFilter: { localIdentifier: "region" } },
        ],
        attributeFilterConfigs: [{ localIdentifier: "ship_date" }, { localIdentifier: "region" }],
        pages: [{ filters: [{ attributeFilter: { localIdentifier: "country" } }] }],
    },
};

const pathOf = (path: string, entity: unknown = {}) =>
    publisherIssueToCodeV2({ path, message: "" }, entity).path;

describe("publisherIssueToCodeV2", () => {
    it.each([
        ["", ""],
        ["title", "title"],
        ["tags[1]", "tags[1]"],
        ["period.from", "period.from"],
        ["ref", "id"],
        ["ref.identifier", "id"],
        ["content.defaults.pageSize", "content.defaults.page_size"],
        [
            "content.sections[1].pages[0].layout.children[2].altText",
            "content.sections[1].pages[0].layout.children[2].alt_text",
        ],
        [
            "content.pages[0].layout.children[0].visualization.identifier",
            "content.pages[0].layout.children[0].visualization",
        ],
        ["content.pages[0].layout.children[0].dateDataSet", "content.pages[0].layout.children[0].date"],
        ["content.filters", "content.filters"],
    ])("maps %j to %j", (path, expected) => {
        expect(pathOf(path)).toBe(expected);
    });

    it.each([
        ["content.filters[1].attributeFilter.displayForm", "content.filters.region"],
        ["content.attributeFilterConfigs[0].mode", "content.filters.ship_date"],
        ["content.pages[0].filters[0].attributeFilter", "content.pages[0].filters.country"],
        ["content.filters[5].dateFilter", "content.filters"],
    ])("names the filter of %j by its key in the code", (path, expected) => {
        expect(pathOf(path, storedFilters)).toBe(expected);
    });

    it("quotes a renamed key in the message as the code writes it", () => {
        expect(
            publisherIssueToCodeV2(
                { path: "content.defaults.pageSise", message: 'Unknown key "pageSise".' },
                {},
            ),
        ).toEqual({ path: "content.defaults.page_sise", message: 'Unknown key "page_sise".' });
    });

    it("leaves the message of a key the code writes the same way", () => {
        expect(
            publisherIssueToCodeV2({ path: "content.extra", message: 'Unknown key "extra".' }, {}),
        ).toEqual({
            path: "content.extra",
            message: 'Unknown key "extra".',
        });
    });
});

function documentCode(
    node: AacPublisherLayoutNodeV2,
    content: Partial<AacPublisherDocumentContentV2> = {},
): AacPublisherDocumentV2 {
    return {
        type: "document",
        id: "northwind",
        version: "2",
        title: "Northwind",
        period: { from: "2026-01-01", to: "2026-06-30" },
        content: {
            pages: [{ id: "page_a", layout: { type: "column", children: [node] } }],
            ...content,
        },
    };
}

const widget: PublisherVisualizationWidgetV2 = {
    type: "visualization",
    id: "widget1",
    visualization: "revenue",
};
const node = "content.pages[0].layout.children[0]";

describe("publisherIssueToCodeV2 against the converter and the validator", () => {
    it.each<[string, AacPublisherDocumentV2, string]>([
        ["the id", { ...documentCode(widget), id: ".northwind" }, "id"],
        ["a widget's visualization", documentCode({ ...widget, visualization: "" }), `${node}.visualization`],
        ["a widget's date", documentCode({ ...widget, date: "" }), `${node}.date`],
        ["a snake_case node key", documentCode({ ...widget, alt_text: "" }), `${node}.alt_text`],
        [
            "a snake_case content key",
            documentCode(widget, { style: { background_color: "nope" } }),
            "content.style.background_color",
        ],
        [
            "a key inside a filter",
            documentCode(widget, {
                filters: { region: { type: "attribute_filter", using: "label/region.name", title: "" } },
            }),
            "content.filters.region",
        ],
    ])("names %s as the code writes it", (_, code, expected) => {
        const entity = yamlPublisherDocumentToDefinitionV2(code);
        const issues = validatePublisherEntityV2(entity);

        expect(issues.map((issue) => publisherIssueToCodeV2(issue, entity).path)).toEqual([expected]);
    });

    it("names an unknown snake_case key as the code writes it, in the path and the message", () => {
        const misspelledStyle = { gap: 40, background_colour: "#fff" };
        const entity = yamlPublisherDocumentToDefinitionV2(documentCode(widget, { style: misspelledStyle }));
        const issues = validatePublisherEntityV2(entity);

        expect(issues.map((issue) => publisherIssueToCodeV2(issue, entity))).toEqual([
            { path: "content.style.background_colour", message: 'Unknown key "background_colour".' },
        ]);
    });
});
