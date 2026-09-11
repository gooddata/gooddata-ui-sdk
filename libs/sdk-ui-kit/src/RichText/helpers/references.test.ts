// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { collectReferences, excludeReferences } from "./references.js";

describe("excludeReferences", () => {
    const content = "Margin {metric/margin} of revenue {metric/revenue} by {label/city}";

    it("drops the excluded reference and keeps the others", () => {
        const remaining = excludeReferences(collectReferences(content), [idRef("margin", "measure")]);

        expect(Object.keys(remaining)).toEqual(["metric/revenue", "label/city"]);
    });

    it("keeps every reference when nothing is excluded", () => {
        expect(excludeReferences(collectReferences(content), [])).toEqual(collectReferences(content));
    });

    it("matches on the object type, so a label and a metric of the same id are distinct", () => {
        const remaining = excludeReferences(collectReferences("{metric/city} and {label/city}"), [
            idRef("city", "displayForm"),
        ]);

        expect(Object.keys(remaining)).toEqual(["metric/city"]);
    });
});
