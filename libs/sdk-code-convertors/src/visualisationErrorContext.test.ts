// (C) 2023-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { declarativeVisualisationToYaml } from "./from/declarativeVisualisationToYaml.js";
import { CoreErrorCode, type ICoreError } from "./utils/errors.js";

describe("declarativeVisualisationToYaml error context", () => {
    it("should include visualization type and basic path", () => {
        const visualisation: any = {
            id: "my_vis",
            // content is empty which is invalid for isInsight
        };

        try {
            declarativeVisualisationToYaml([], visualisation);
            expect.fail("Should have thrown error");
        } catch (err: unknown) {
            const error = err as ICoreError;
            expect(error.context?.type).toBe("visualisation");
            expect(error.context?.path).toEqual(["visualisation", "my_vis"]);
        }
    });

    it("should include full path for invalid attribute in bucket", () => {
        const visualisation: any = {
            id: "my_vis",
            content: {
                visualizationUrl: "local:table",
                buckets: [
                    {
                        localIdentifier: "measures",
                        items: [
                            {
                                attribute: {
                                    localIdentifier: "attr1",
                                    displayForm: { uri: "/unsupported" },
                                },
                            },
                        ],
                    },
                ],
            },
        };

        try {
            declarativeVisualisationToYaml([], visualisation);
            expect.fail("Should have thrown error");
        } catch (err: unknown) {
            const error = err as ICoreError;
            expect(error.context?.path).toEqual([
                "visualisation",
                "my_vis",
                "insight",
                "buckets",
                "0",
                "items",
                "0",
                "attribute",
                "displayForm",
            ]);
        }
    });

    it("should include full path for invalid measure in bucket", () => {
        const visualisation: any = {
            id: "my_vis",
            content: {
                visualizationUrl: "local:table",
                buckets: [
                    {
                        localIdentifier: "measures",
                        items: [
                            {
                                measure: {
                                    localIdentifier: "m1",
                                    definition: {
                                        measureDefinition: {
                                            item: { uri: "/unsupported" },
                                        },
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
        };

        try {
            declarativeVisualisationToYaml([], visualisation);
            expect.fail("Should have thrown error");
        } catch (err: unknown) {
            const error = err as ICoreError;
            expect(error.context?.path).toEqual([
                "visualisation",
                "my_vis",
                "insight",
                "buckets",
                "0",
                "items",
                "0",
                "measure",
                "item",
            ]);
        }
    });

    it("should include full path for unsupported bucket item type", () => {
        const visualisation: any = {
            id: "my_vis",
            content: {
                visualizationUrl: "local:table",
                buckets: [
                    {
                        localIdentifier: "measures",
                        items: [
                            {
                                unknown: "item",
                            },
                        ],
                    },
                ],
            },
        };

        try {
            declarativeVisualisationToYaml([], visualisation);
            expect.fail("Should have thrown error");
        } catch (err: unknown) {
            const error = err as ICoreError;
            // Based on the code, it uses bucketItemErrorContext which has bi and ii
            expect(error.context?.path).toEqual([
                "visualisation",
                "my_vis",
                "insight",
                "buckets",
                "0",
                "items",
                "0",
            ]);
        }
    });

    it("should include full path for invalid filter", () => {
        const visualisation: any = {
            id: "my_vis",
            content: {
                visualizationUrl: "local:table",
                buckets: [],
                filters: [
                    {
                        positiveAttributeFilter: {
                            displayForm: { uri: "/unsupported" },
                        },
                    },
                ],
            },
        };

        try {
            declarativeVisualisationToYaml([], visualisation);
            expect.fail("Should have thrown error");
        } catch (err: unknown) {
            const error = err as ICoreError;
            expect(error.context?.path).toEqual([
                "visualisation",
                "my_vis",
                "insight",
                "filters",
                "0",
                "date",
                "positiveAttributeFilter",
                "displayForm",
            ]);
        }
    });
});

describe("declarativeVisualisationToYaml layer overrides", () => {
    const geoBucket = {
        localIdentifier: "location",
        items: [
            {
                attribute: {
                    localIdentifier: "g1",
                    displayForm: { identifier: "region_geo", type: "displayForm" },
                },
            },
        ],
    };

    type Declarative = Parameters<typeof declarativeVisualisationToYaml>[1];

    const withLayer = (override: Record<string, unknown>) =>
        ({
            id: "my_map",
            title: "My Map",
            content: {
                visualizationUrl: "local:pushpin",
                buckets: [geoBucket],
                filters: [],
                sorts: [],
                properties: {},
                layers: [{ id: "layer1", type: "pushpin", buckets: [geoBucket], ...override }],
            },
        }) as Declarative;

    const attributeFilter = {
        positiveAttributeFilter: {
            displayForm: { identifier: "region_geo", type: "displayForm" },
            in: { values: ["EMEA"] },
        },
    };

    it.each<[string, Record<string, unknown>]>([
        ["filters", { filters: [attributeFilter] }],
        ["sorts", { sorts: [{ attributeSortItem: { attributeIdentifier: "g1", direction: "desc" } }] }],
        [
            "attributeFilterConfigs",
            { attributeFilterConfigs: { f1: { displayAsLabel: { identifier: "x", type: "displayForm" } } } },
        ],
    ])("refuses a layer carrying its own %s, which the grammar cannot express", (field, override) => {
        try {
            declarativeVisualisationToYaml([], withLayer(override));
            expect.fail("Should have thrown error");
        } catch (err: unknown) {
            const error = err as ICoreError;
            expect(error.code).toBe(CoreErrorCode.ItemNotSupported);
            expect(error.message).toContain(`layer "layer1" own ${field}`);
            expect(error.context?.path).toEqual(["visualisation", "my_map", "insight", "layers", "0", field]);
        }
    });

    // Present-but-empty is the shape stored layers carry, and it loses nothing.
    it.each<[string, Record<string, unknown>]>([
        ["nothing of its own", {}],
        ["an empty filter list", { filters: [] }],
        ["an empty sort list", { sorts: [] }],
        ["no attribute filter configs", { attributeFilterConfigs: {} }],
        ["a config carrying no label", { attributeFilterConfigs: { f1: {} } }],
    ])("converts a layer with %s, which the insight's own cover", (_case, override) => {
        expect(declarativeVisualisationToYaml([], withLayer(override)).content).toContain("id: layer1");
    });
});

describe("declarativeVisualisationToYaml geo buckets", () => {
    const attr = (localId: string, df: string) => ({
        attribute: { localIdentifier: localId, displayForm: { identifier: df, type: "displayForm" } },
    });
    // Fresh per use: conversion walks these, and a bucket emptied by one case would not be refused in the
    // next.
    const location = () => ({ localIdentifier: "location", items: [attr("loc", "region_geo")] });
    const area = () => ({ localIdentifier: "area", items: [attr("ar", "region_area")] });
    const tooltip = () => ({ localIdentifier: "tooltipText", items: [attr("t1", "region_name")] });

    type Declarative = Parameters<typeof declarativeVisualisationToYaml>[1];
    const geo = (url: string, buckets: unknown[], layerBuckets = buckets) =>
        ({
            id: "map1",
            title: "Map",
            content: {
                visualizationUrl: url,
                buckets,
                filters: [],
                sorts: [],
                properties: {},
                layers: [
                    {
                        id: "layer1",
                        type: url === "local:pushpin" ? "pushpin" : "area",
                        buckets: layerBuckets,
                    },
                ],
            },
        }) as Declarative;

    const refusalOf = (declarative: Declarative) => {
        try {
            declarativeVisualisationToYaml([], declarative);
            return null;
        } catch (err: unknown) {
            return err as ICoreError;
        }
    };

    it.each<[string, Declarative, string]>([
        ["a pushpin's own buckets", geo("local:pushpin", [location(), tooltip()]), "tooltipText"],
        [
            "a pushpin layer's buckets",
            geo("local:pushpin", [location()], [location(), tooltip()]),
            "tooltipText",
        ],
        ["an area's own buckets", geo("local:choropleth", [area(), tooltip()]), "tooltipText"],
        ["an area carrying a pushpin location", geo("local:choropleth", [area(), location()]), "location"],
    ])("refuses a bucket %s cannot write, which would drop its item", (_case, declarative, bucket) => {
        const error = refusalOf(declarative);

        expect(error?.code).toBe(CoreErrorCode.ItemNotSupported);
        expect(error?.message).toContain(`bucket "${bucket}"`);
    });

    it.each<[string, Declarative]>([
        ["a pushpin", geo("local:pushpin", [location()])],
        ["an area", geo("local:choropleth", [area()])],
    ])("converts %s carrying only buckets it can write", (_case, declarative) => {
        expect(refusalOf(declarative)).toBeNull();
    });

    it("declares no field that nothing goes on to reference", () => {
        const yaml = declarativeVisualisationToYaml([], geo("local:pushpin", [location()])).content;
        const fieldsBlock = yaml.slice(yaml.indexOf("  fields:")).split(/\n(?=\S)/)[0];
        const declared = [...fieldsBlock.matchAll(/^ {4}(\S+):/gm)].map((match) => match[1]);

        expect(declared.length).toBeGreaterThan(0);
        for (const field of declared) {
            expect(yaml).toContain(`- ${field}`);
        }
    });
});

describe("declarativeVisualisationToYaml buckets no type writes", () => {
    const attr = (localId: string, df: string) => ({
        attribute: { localIdentifier: localId, displayForm: { identifier: df, type: "displayForm" } },
    });
    type Declarative = Parameters<typeof declarativeVisualisationToYaml>[1];
    const chart = (url: string, buckets: unknown[], layers?: unknown[]) =>
        ({
            id: "v",
            title: "V",
            content: {
                visualizationUrl: url,
                buckets,
                filters: [],
                sorts: [],
                properties: {},
                ...(layers ? { layers } : {}),
            },
        }) as Declarative;

    const refusalOf = (declarative: Declarative) => {
        try {
            declarativeVisualisationToYaml([], declarative);
            return null;
        } catch (err: unknown) {
            return err as ICoreError;
        }
    };

    it.each<[string, string]>([
        ["a table", "local:table"],
        ["a bar chart", "local:bar"],
    ])("refuses a bucket %s never looks up, which would be dropped whole", (_case, url) => {
        const error = refusalOf(chart(url, [{ localIdentifier: "tooltipText", items: [attr("a1", "x")] }]));

        expect(error?.code).toBe(CoreErrorCode.ItemNotSupported);
        expect(error?.message).toContain('bucket "tooltipText"');
    });

    it("converts a chart whose every bucket it looks up", () => {
        expect(
            refusalOf(chart("local:table", [{ localIdentifier: "attribute", items: [attr("a1", "x")] }])),
        ).toBeNull();
    });

    it("refuses one name declared twice, which the document cannot carry", () => {
        const error = refusalOf(
            chart("local:table", [
                { localIdentifier: "attribute", items: [attr("a1", "x")] },
                { localIdentifier: "columns", items: [attr("a1", "y")] },
            ]),
        );

        expect(error?.code).toBe(CoreErrorCode.DuplicateFieldName);
        expect(error?.message).toContain('"a1"');
    });

    it.each<[string, string]>([
        ["a table", "local:table"],
        ["a bar chart", "local:bar"],
    ])("refuses layers %s cannot write, which would drop them whole", (_case, url) => {
        const error = refusalOf(
            chart(
                url,
                [],
                [
                    {
                        id: "layer1",
                        type: "pushpin",
                        buckets: [{ localIdentifier: "location", items: [attr("loc", "geo")] }],
                    },
                ],
            ),
        );

        expect(error?.code).toBe(CoreErrorCode.ItemNotSupported);
        expect(error?.context?.path).toEqual(["visualisation", "v", "layers"]);
    });

    it("refuses the second of two buckets sharing a name, which only one lookup reaches", () => {
        const error = refusalOf(
            chart("local:table", [
                { localIdentifier: "attribute", items: [attr("a1", "x")] },
                { localIdentifier: "attribute", items: [attr("a2", "y")] },
            ]),
        );

        expect(error?.code).toBe(CoreErrorCode.ItemNotSupported);
        expect(error?.message).toContain('bucket "attribute"');
    });
});
