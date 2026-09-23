// (C) 2019-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { newBucket } from "../execution/buckets/index.js";
import { newMeasureValueFilter } from "../execution/filter/factory.js";
import { newArithmeticMeasure, newMeasure, newPreviousPeriodMeasure } from "../execution/measure/factory.js";
import { type IInsightDefinition } from "../insight/index.js";
import { type IAttributeDisplayFormMetadataObject } from "../ldm/metadata/attributeDisplayForm/index.js";
import { idRef, uriRef } from "../objRef/factory.js";

import {
    DRILL_TO_URL_PLACEHOLDER,
    attributeIdentifierToPlaceholder,
    dashboardAttributeFilterToPlaceholder,
    displayFormPlaceholderRef,
    getAttributeIdentifiersPlaceholdersFromUrl,
    getDashboardAttributeFilterPlaceholdersFromUrl,
    getDashboardMeasureValueFilterPlaceholdersFromUrl,
    getDrillToCustomUrlReferenceMap,
    getDrillToCustomUrlReferences,
    getDrillUrlPlaceholderTypes,
    getInsightAttributeFilterPlaceholdersFromUrl,
    getInsightMeasureValueFilterPlaceholdersFromUrl,
    insightAttributeFilterToPlaceholder,
    joinDrillUrlParts,
    splitDrillUrlParts,
} from "./drillUrl.js";

describe("drill url placeholders", () => {
    it("should extracted placeholders", () => {
        const attributeIdentifiers = getAttributeIdentifiersPlaceholdersFromUrl(
            "https://google.com/?q={attribute_title(campaign_channels.category)}&b={attribute_title(6c2664ac21764748910953139a3aedad:campaign_channels.category)}",
        );
        expect(attributeIdentifiers).toMatchSnapshot();
    });

    it("should split and join parts", () => {
        const url =
            "https://google.com/?q={attribute_title(campaign_channels.category)}&b={attribute_title(6c2664ac21764748910953139a3aedad:campaign_channels.category)}";

        const urlParts = splitDrillUrlParts(url);
        expect(urlParts).toMatchSnapshot();

        expect(joinDrillUrlParts(urlParts)).toBe(url);
    });

    it("should accept string in join (back compatibility with old saved dashboards)", () => {
        const url =
            "https://google.com/?q={attribute_title(campaign_channels.category)}&b={attribute_title(6c2664ac21764748910953139a3aedad:campaign_channels.category)}";

        expect(joinDrillUrlParts(url)).toBe(url);
    });

    it("should reference a computed attribute by its own type, not as a display form", () => {
        const url = "https://example.com/?q={attribute_title(computed_attribute/ca1)}";

        expect(getAttributeIdentifiersPlaceholdersFromUrl(url)).toEqual([
            {
                placeholder: "{attribute_title(computed_attribute/ca1)}",
                identifier: "ca1",
                ref: {
                    identifier: "ca1",
                    type: "computedAttribute",
                },
                toBeEncoded: true,
            },
        ]);

        const urlParts = splitDrillUrlParts(url);
        expect(urlParts).toEqual(["https://example.com/?q=", idRef("ca1", "computedAttribute"), ""]);
        expect(joinDrillUrlParts(urlParts)).toBe(url);
    });

    it("should build the placeholder text for a display form and for a computed attribute", () => {
        expect(attributeIdentifierToPlaceholder(idRef("label1", "displayForm"))).toBe(
            "{attribute_title(label1)}",
        );
        expect(attributeIdentifierToPlaceholder(idRef("ca1", "computedAttribute"))).toBe(
            "{attribute_title(computed_attribute/ca1)}",
        );
    });

    it("should reference a computed attribute from the filter selection placeholders", () => {
        expect(
            getDashboardAttributeFilterPlaceholdersFromUrl(
                "https://example.com/?f={dash_attribute_filter_selection(computed_attribute/ca1)}",
            ),
        ).toEqual([
            {
                placeholder: "{dash_attribute_filter_selection(computed_attribute/ca1)}",
                identifier: "ca1",
                ref: { identifier: "ca1", type: "computedAttribute" },
                toBeEncoded: true,
            },
        ]);

        expect(
            getInsightAttributeFilterPlaceholdersFromUrl(
                "https://example.com/?f={attribute_filter_selection(computed_attribute/ca1)}",
            ),
        ).toEqual([
            {
                placeholder: "{attribute_filter_selection(computed_attribute/ca1)}",
                identifier: "ca1",
                ref: { identifier: "ca1", type: "computedAttribute" },
                toBeEncoded: true,
            },
        ]);
    });

    it("should keep the filter selection placeholders unprefixed for a display form", () => {
        expect(dashboardAttributeFilterToPlaceholder(idRef("label1", "displayForm"))).toBe(
            "{dash_attribute_filter_selection(label1)}",
        );
        expect(dashboardAttributeFilterToPlaceholder(idRef("ca1", "computedAttribute"))).toBe(
            "{dash_attribute_filter_selection(computed_attribute/ca1)}",
        );
        expect(insightAttributeFilterToPlaceholder(idRef("label1", "displayForm"))).toBe(
            "{attribute_filter_selection(label1)}",
        );
        expect(insightAttributeFilterToPlaceholder(idRef("ca1", "computedAttribute"))).toBe(
            "{attribute_filter_selection(computed_attribute/ca1)}",
        );
    });

    it("should name a display form by identifier even when its ref is a uri", () => {
        // A placeholder can only name its target by identifier, so a uri-backed display form has to
        // fall back to its id rather than leaking the uri into the URL.
        const uriBackedDisplayForm = {
            id: "label1",
            ref: uriRef("/gdc/md/project/obj/123"),
        } as IAttributeDisplayFormMetadataObject;

        expect(displayFormPlaceholderRef(uriBackedDisplayForm)).toEqual(idRef("label1", "displayForm"));
        expect(attributeIdentifierToPlaceholder(displayFormPlaceholderRef(uriBackedDisplayForm))).toBe(
            "{attribute_title(label1)}",
        );
    });

    it("should keep the computed attribute type when naming a display form", () => {
        const computedAttribute = {
            id: "ca1",
            ref: idRef("ca1", "computedAttribute"),
        } as IAttributeDisplayFormMetadataObject;

        expect(displayFormPlaceholderRef(computedAttribute)).toEqual(idRef("ca1", "computedAttribute"));
        expect(attributeIdentifierToPlaceholder(displayFormPlaceholderRef(computedAttribute))).toBe(
            "{attribute_title(computed_attribute/ca1)}",
        );
    });

    it("should extract dashboard measure value filter placeholders", () => {
        const placeholders = getDashboardMeasureValueFilterPlaceholdersFromUrl(
            "https://example.com/?condition={dash_mvf_condition(metric.revenue)}",
        );

        expect(placeholders).toEqual([
            {
                placeholder: "{dash_mvf_condition(metric.revenue)}",
                identifier: "metric.revenue",
                ref: {
                    identifier: "metric.revenue",
                    type: "measure",
                },
                toBeEncoded: true,
            },
        ]);
    });

    it("should extract insight measure value filter placeholders", () => {
        const placeholders = getInsightMeasureValueFilterPlaceholdersFromUrl(
            "https://example.com/?condition={mvf_condition(revenue_local_id)}",
        );

        expect(placeholders).toEqual([
            {
                placeholder: "{mvf_condition(revenue_local_id)}",
                identifier: "revenue_local_id",
                ref: {
                    identifier: "revenue_local_id",
                    type: "measure",
                },
                toBeEncoded: true,
            },
        ]);
    });
});

describe("custom URL object dependencies", () => {
    const metric = newMeasure(idRef("revenue", "measure"), (m) => m.localId("m1"));
    const other = newMeasure(idRef("cost", "measure"), (m) => m.localId("m2"));
    const previous = newPreviousPeriodMeasure(metric, [{ dataSet: "date", periodsAgo: 1 }], (m) =>
        m.localId("previous"),
    );
    const arithmetic = newArithmeticMeasure([previous, other], "sum", (m) => m.localId("total"));
    const insight: IInsightDefinition = {
        insight: {
            title: "Source",
            visualizationUrl: "local:table",
            buckets: [newBucket("measures", metric, other, previous, arithmetic)],
            filters: [
                newMeasureValueFilter(arithmetic, "GREATER_THAN", 10),
                newMeasureValueFilter(idRef("global", "measure"), "GREATER_THAN", 0),
            ],
            sorts: [],
            properties: {},
        },
    };

    it("deduplicates typed references across placeholder families and ignores context identifiers", () => {
        expect(
            getDrillToCustomUrlReferences({
                url: "https://example.com/{workspace_id}/{attribute_title(region)}?a={dash_attribute_filter_selection(region)}&b={attribute_filter_selection(computed_attribute/region)}&c={dash_mvf_condition(revenue)}",
            }),
        ).toEqual([
            idRef("region", "displayForm"),
            idRef("region", "computedAttribute"),
            idRef("revenue", "measure"),
        ]);
    });

    it("resolves local arithmetic and derived measures to their underlying objects", () => {
        expect(
            getDrillToCustomUrlReferences(
                { url: "https://example.com/?f={mvf_condition(total)}&g={mvf_condition(global)}" },
                insight,
            ),
        ).toEqual([idRef("revenue", "measure"), idRef("cost", "measure"), idRef("global", "measure")]);
    });

    it("does not mistake an unresolved local measure identifier for a metric identifier", () => {
        expect(
            getDrillToCustomUrlReferences({ url: "https://example.com/{mvf_condition(missing)}" }, insight),
        ).toEqual([]);
        expect(getDrillToCustomUrlReferences({ url: "https://example.com/{mvf_condition(m1)}" })).toEqual([]);
    });

    it("preserves saved measure dependencies when the source insight is inaccessible", () => {
        expect(
            getDrillToCustomUrlReferences({
                url: "https://example.com/{mvf_condition(total)}/{attribute_title(region)}",
                references: {
                    "{mvf_condition(total)}": [idRef("revenue", "measure"), idRef("cost", "measure")],
                    "{attribute_title(old-label)}": [idRef("old-label", "displayForm")],
                },
            }),
        ).toEqual([idRef("region", "displayForm"), idRef("revenue", "measure"), idRef("cost", "measure")]);
    });

    it("replaces stale saved references and clears dependencies when placeholders are removed", () => {
        const references = {
            "{mvf_condition(total)}": [idRef("stale", "measure")],
            "{attribute_title(old)}": [idRef("old", "displayForm")],
        };
        expect(
            getDrillToCustomUrlReferences(
                { url: "https://example.com/{mvf_condition(total)}", references },
                insight,
            ),
        ).toEqual([idRef("revenue", "measure"), idRef("cost", "measure")]);
        expect(
            getDrillToCustomUrlReferences({ url: "https://example.com/{attribute_title(new)}", references }),
        ).toEqual([idRef("new", "displayForm")]);
        expect(getDrillToCustomUrlReferences({ url: "https://example.com/", references })).toEqual([]);
    });
    it("drops a removed dashboard metric while retaining the unchanged insight placeholder", () => {
        const original = {
            url: "https://example.com/?a={dash_mvf_condition(secret)}&b={mvf_condition(total)}",
        };
        const references = getDrillToCustomUrlReferenceMap(original, insight);
        expect(references["{dash_mvf_condition(secret)}"]).toEqual([idRef("secret", "measure")]);
        expect(
            getDrillToCustomUrlReferenceMap({
                url: "https://example.com/?b={mvf_condition(total)}",
                references,
            }),
        ).toEqual({
            "{mvf_condition(total)}": [idRef("revenue", "measure"), idRef("cost", "measure")],
        });
        expect(
            getDrillToCustomUrlReferences({
                url: "https://example.com/?b={mvf_condition(other)}",
                references,
            }),
        ).toEqual([]);
    });

    it("keeps a shared metric when an unchanged insight placeholder still depends on it", () => {
        const references = getDrillToCustomUrlReferenceMap(
            {
                url: "https://example.com/{dash_mvf_condition(revenue)}/{mvf_condition(total)}",
            },
            insight,
        );
        expect(
            getDrillToCustomUrlReferences({
                url: "https://example.com/{mvf_condition(total)}",
                references,
            }),
        ).toEqual([idRef("revenue", "measure"), idRef("cost", "measure")]);
    });

    it("recognizes repeated context placeholders without storing object dependencies", () => {
        for (const placeholder of Object.values(DRILL_TO_URL_PLACEHOLDER)) {
            const url = `https://example.com/${placeholder}/${placeholder}`;
            expect(getDrillUrlPlaceholderTypes(url)).toEqual([placeholder]);
            expect(getDrillUrlPlaceholderTypes(url)).toEqual([placeholder]);
            expect(getDrillToCustomUrlReferenceMap({ url })).toEqual({});
        }
    });
});
