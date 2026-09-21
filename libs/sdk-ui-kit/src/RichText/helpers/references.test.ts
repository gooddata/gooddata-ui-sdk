// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { collectReferences, excludeReferences, replaceReferences } from "./references.js";

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

describe("replaceReferences", () => {
    // any text will do - what the product puts there is the dashboard's business, not the helper's
    const removed = "REPLACEMENT";

    it("puts the replacement in place of the reference and leaves the rest as the author wrote it", () => {
        const content = "Margin held at {metric/margin} while revenue grew {metric/revenue}.";

        expect(replaceReferences(content, [idRef("margin", "measure")], removed)).toEqual(
            "Margin held at REPLACEMENT while revenue grew {metric/revenue}.",
        );
    });

    it("replaces every occurrence, because they all stand for the same object", () => {
        const content = "{metric/margin} today, {metric/margin} a year ago";

        expect(replaceReferences(content, [idRef("margin", "measure")], removed)).toEqual(
            "REPLACEMENT today, REPLACEMENT a year ago",
        );
    });

    it("replaces every reference it is given in one pass", () => {
        const content = "Margin {metric/margin} of revenue {metric/revenue} by {label/city}";

        expect(
            replaceReferences(content, [idRef("margin", "measure"), idRef("city", "displayForm")], removed),
        ).toEqual("Margin REPLACEMENT of revenue {metric/revenue} by REPLACEMENT");
    });

    it("keeps the emphasis around the reference, which now holds the replacement", () => {
        const content = "Margin held at **{metric/margin}** while revenue grew.";

        expect(replaceReferences(content, [idRef("margin", "measure")], removed)).toEqual(
            "Margin held at **REPLACEMENT** while revenue grew.",
        );
    });

    it("keeps a reference of the same id but another type", () => {
        const content = "{metric/city} in {label/city}";

        expect(replaceReferences(content, [idRef("city", "displayForm")], removed)).toEqual(
            "{metric/city} in REPLACEMENT",
        );
    });

    it("leaves the text alone when it references nothing that was given", () => {
        const content = "Margin {metric/margin} of revenue";

        expect(replaceReferences(content, [], removed)).toEqual(content);
    });
});
