// (C) 2026 GoodData Corporation

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { metadata_v1, type v1 } from "./index.js";

interface ISchemaDef {
    $id?: string;
    title: string;
}

function v2Defs(): Array<[string, ISchemaDef]> {
    return ["document", "documentTemplate", "pageTemplate", "page"].flatMap((file) => {
        const source = readFileSync(join(import.meta.dirname, `../schemas/v1/src/${file}.json`), "utf-8");
        const schema = JSON.parse(source) as { $defs: Record<string, ISchemaDef> };
        return Object.entries(schema.$defs);
    });
}

function titlesIn(node: unknown): string[] {
    if (typeof node !== "object" || node === null) {
        return [];
    }
    const nested = Object.values(node).flatMap(titlesIn);
    return "title" in node && typeof node.title === "string" ? [node.title, ...nested] : nested;
}

function camelCase(title: string): string {
    const [first, ...rest] = title.split(" ");
    return [first.toLowerCase(), ...rest].join("");
}

function boxStyleKeys(properties: object): string[] {
    return Object.keys(properties)
        .filter((key) => /^(background|padding|border|shadow)(_|$)/.test(key) || key === "opacity")
        .sort();
}

describe("sdk-code-schemas v1", () => {
    it("exports Metric type with expected type discriminator", () => {
        const metric: v1.Metric = {
            id: "revenue",
            type: "metric",
            maql: "SELECT SUM({fact/amount})",
        };

        expect(metric.type).toBe("metric");
    });

    it("exports Parameter type with a typed definition", () => {
        const parameter: v1.Parameter = {
            id: "scenario",
            type: "parameter",
            definition: { type: "STRING", defaultValue: "Actual" },
        };

        expect(parameter.definition.type).toBe("STRING");
    });

    it("accepts parameter as a top-level object type in the compiled schema", () => {
        expect(metadata_v1.properties.type.enum).toContain("parameter");
    });

    it("exports PublisherDocumentV2 with pages holding a layout tree", () => {
        const document: v1.PublisherDocumentV2 = {
            id: "northwind",
            type: "document",
            version: "2",
            title: "Northwind",
            period: { granularity: "MONTH", from: -1, to: -1 },
            content: {
                pages: [
                    {
                        id: "cover",
                        layout: {
                            type: "column",
                            children: [{ type: "title", id: "pageTitle", markdown: "{documentName}" }],
                        },
                    },
                ],
            },
        };

        expect(document.content.pages?.[0].layout.type).toBe("column");
    });

    it("rejects a layout node key that its type does not have", () => {
        // @ts-expect-error level belongs to the heading widget only
        const node: v1.PublisherLayoutNodeV2 = { type: "title", id: "pageTitle", level: 2 };

        expect(node.type).toBe("title");
    });

    it("accepts the v2 Publisher entities as top-level object types in the compiled schema", () => {
        expect(metadata_v1.properties.type.enum).toEqual(
            expect.arrayContaining(["document", "document_template", "page_template"]),
        );
    });

    it("accepts only content version 2 on the v2 Publisher entities", () => {
        const { publisherDocumentV2, publisherDocumentTemplateV2, publisherPageTemplateV2 } =
            metadata_v1.$defs;

        expect(
            [publisherDocumentV2, publisherDocumentTemplateV2, publisherPageTemplateV2].map(
                (def) => def.properties.version.enum,
            ),
        ).toEqual([["2"], ["2"], ["2"]]);
    });

    it("names every v2 Publisher def the same in its key, $id and title", () => {
        const defs = v2Defs();
        const misnamed = defs.filter(
            ([key, def]) =>
                !/^publisher\w+V2$/.test(key) ||
                key !== camelCase(def.title) ||
                (def.$id !== undefined && def.$id !== `/gaac/${key}`),
        );

        expect(defs).toHaveLength(50);
        expect(misnamed).toEqual([]);
    });

    it("prefixes every v2 Publisher title nested inside a def too", () => {
        const titles = v2Defs().flatMap(([, def]) => titlesIn(def));

        expect(titles).toHaveLength(60);
        expect(titles.filter((title) => !/^Publisher .+ V2$/.test(title))).toEqual([]);
    });

    it("gives a document page the page body keys plus id and visible", () => {
        const { publisherDocumentPageV2, publisherPageBodyV2 } = metadata_v1.$global.gaac;

        expect(Object.keys(publisherDocumentPageV2.properties).sort()).toEqual(
            [...Object.keys(publisherPageBodyV2.properties), "id", "visible"].sort(),
        );
    });

    it("gives every boxed widget and the container the same box style keys", () => {
        const {
            publisherTextWidgetStyleV2,
            publisherImageWidgetStyleV2,
            publisherVisualizationStyleV2,
            publisherContainerStyleV2,
        } = metadata_v1.$global.gaac;
        const [textKeys, ...otherKeys] = [
            publisherTextWidgetStyleV2,
            publisherImageWidgetStyleV2,
            publisherVisualizationStyleV2,
            publisherContainerStyleV2,
        ].map(({ properties }) => boxStyleKeys(properties));

        expect(textKeys).toHaveLength(45);
        expect(otherKeys).toEqual([textKeys, textKeys, textKeys]);
    });
});
