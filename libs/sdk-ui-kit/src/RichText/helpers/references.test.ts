// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { collectReferences, excludeReferences } from "./references.js";

describe("collectReferences", () => {
    it("collects a computed attribute reference under its own object type", () => {
        expect(collectReferences("Tier {computed_attribute/tier} of {label/city}")).toEqual({
            "computed_attribute/tier": {
                ref: idRef("tier", "computedAttribute"),
                type: "computedAttribute",
            },
            "label/city": {
                ref: idRef("city", "displayForm"),
                type: "displayForm",
            },
        });
    });

    it("matches the prefix case-insensitively, keeping the case-sensitive identifier", () => {
        expect(collectReferences("{ComPuted_Attribute/Ca4}")["ComPuted_Attribute/Ca4"]!.ref).toEqual(
            idRef("Ca4", "computedAttribute"),
        );
    });

    it("ignores an unknown prefix", () => {
        expect(collectReferences("{fact/revenue}")).toEqual({});
    });

    it("ignores the REST spelling of the computed attribute type, which is not a prefix", () => {
        expect(collectReferences("{computedAttribute/tier}")).toEqual({});
    });
});

describe("excludeReferences", () => {
    const content = "Margin {metric/margin} of revenue {metric/revenue} by {label/city}";

    it("drops the excluded reference and keeps the others", () => {
        const remaining = excludeReferences(collectReferences(content), [idRef("margin", "measure")]);

        expect(Object.keys(remaining)).toEqual(["metric/revenue", "label/city"]);
    });

    it("keeps every reference when nothing is excluded", () => {
        expect(excludeReferences(collectReferences(content), [])).toEqual(collectReferences(content));
    });

    it("drops an excluded computed attribute, which a label of the same id does not match", () => {
        const remaining = excludeReferences(collectReferences("{computed_attribute/tier} and {label/tier}"), [
            idRef("tier", "computedAttribute"),
        ]);

        expect(Object.keys(remaining)).toEqual(["label/tier"]);
    });

    it("matches on the object type, so a label and a metric of the same id are distinct", () => {
        const remaining = excludeReferences(collectReferences("{metric/city} and {label/city}"), [
            idRef("city", "displayForm"),
        ]);

        expect(Object.keys(remaining)).toEqual(["metric/city"]);
    });
});
