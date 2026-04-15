// (C) 2023-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { declarativeAttributeHierarchyToYaml } from "../from/declarativeAttributeHierarchyToYaml.js";
import { declarativeDashboardToYaml } from "../from/declarativeDashboardToYaml.js";
import { declarativeVisualisationToYaml } from "../from/declarativeVisualisationToYaml.js";
import { type ICoreError } from "../utils/errors.js";

describe("error context propagation", () => {
    describe("declarativeDashboardToYaml", () => {
        it("should include dashboard id and path in error context", () => {
            const dashboard: any = {
                id: "my_dash",
                content: {
                    layout: {
                        sections: [
                            {
                                items: [
                                    {
                                        widget: {
                                            type: "insight",
                                            insight: { uri: "/unsupported" }, // triggers getIdentifier error
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                },
            };

            try {
                declarativeDashboardToYaml([], dashboard);
                expect.fail("Should have thrown error");
            } catch (err: unknown) {
                const error = err as ICoreError;
                expect(error.context?.path).toEqual([
                    "dashboard",
                    "my_dash",
                    "layout",
                    "sections",
                    "0",
                    "items",
                    "0",
                    "insight",
                    "visualisation",
                ]);
            }
        });
    });

    describe("declarativeVisualisationToYaml", () => {
        it("should include visualization type in error context when isInsight fails", () => {
            const visualisation: any = {
                id: "my_vis",
                // content is missing, so insight.insight will be undefined
            };

            let error: any;
            try {
                declarativeVisualisationToYaml([], visualisation);
            } catch (err: unknown) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.context).toBeDefined();
            expect(error.context.type).toBe("visualisation");
        });
    });

    describe("declarativeAttributeHierarchyToYaml", () => {
        it("should include attribute hierarchy id and path in error context", () => {
            const hierarchy: any = {
                id: "my_hierarchy",
                content: {
                    attributes: [
                        { uri: "/unsupported" }, // triggers getIdentifier error
                    ],
                },
            };

            try {
                declarativeAttributeHierarchyToYaml(hierarchy);
                expect.fail("Should have thrown error");
            } catch (err: unknown) {
                const error = err as ICoreError;
                expect(error.context?.path).toEqual([
                    "attribute_hierarchy",
                    "my_hierarchy",
                    "attributes",
                    "0",
                ]);
            }
        });
    });
});
