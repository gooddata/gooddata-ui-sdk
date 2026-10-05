// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IInsight, idRef, newAttribute, newBucket, newMeasure } from "@gooddata/sdk-model";

import { convertToLocalMultipartContent } from "./toLocalContent.js";

describe("convertToLocalMultipartContent", () => {
    it("adds the repeater row attribute to the columns", () => {
        const rowAttribute = newAttribute("product", (a) => a.localId("product"));
        const visualization: IInsight = {
            insight: {
                identifier: "vis-1",
                uri: "/vis-1",
                ref: idRef("vis-1"),
                title: "Repeater",
                visualizationUrl: "local:repeater",
                buckets: [newBucket("attribute", rowAttribute), newBucket("columns", newMeasure("m1"))],
                filters: [],
                sorts: [],
                properties: {},
            },
        };

        const [part] = convertToLocalMultipartContent([{ type: "visualization", visualization }]);

        expect(part).toMatchObject({
            visualization: {
                insight: {
                    buckets: [
                        newBucket("attribute", rowAttribute),
                        newBucket(
                            "columns",
                            newAttribute("product", (a) => a.localId("product_cloned")),
                            newMeasure("m1"),
                        ),
                    ],
                },
            },
        });
    });
});
