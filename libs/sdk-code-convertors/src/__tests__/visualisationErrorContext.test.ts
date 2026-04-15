// (C) 2023-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { declarativeVisualisationToYaml } from "../from/declarativeVisualisationToYaml.js";
import { type ICoreError } from "../utils/errors.js";

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
