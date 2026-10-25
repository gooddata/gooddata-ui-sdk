// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IFilter,
    type IMeasureValueFilter,
    type IRankingFilter,
    filterObjRef,
    idRef,
    insightBuckets,
    insightFilters,
    localIdRef,
} from "@gooddata/sdk-model";

import { type IVisualization } from "../../typings/bear/bearTypes.js";

import { convertVisualization } from "./VisualizationConverter.js";

/**
 * The save path the editor actually takes: the MD object it builds is bear-shaped, and this converter
 * is what turns it into the sdk-model insight handed to the backend. A ref whose type cannot be
 * re-derived from the bucket position it sits in has to survive the hop — the tests over
 * `bucketsToMetadata` and over the tiger insight converter each pass while this middle step drops it.
 */
function visualizationWithAttributeRef(displayForm: unknown): IVisualization {
    return {
        visualizationObject: {
            content: {
                visualizationClass: { uri: "local:table", url: "local:table" },
                buckets: [
                    {
                        localIdentifier: "attribute",
                        items: [
                            {
                                visualizationAttribute: {
                                    localIdentifier: "a1",
                                    displayForm,
                                    alias: "test CA",
                                },
                            },
                        ],
                    },
                ],
                filters: [],
                properties: "{}",
            },
            meta: { title: "CA test", identifier: "vis-1" },
        },
    } as unknown as IVisualization;
}

function convertedDisplayForm(displayForm: unknown) {
    const insight = convertVisualization(visualizationWithAttributeRef(displayForm), "local:table");
    const [bucket] = insightBuckets(insight);
    const [item] = bucket.items;
    return (item as { attribute: { displayForm: unknown } }).attribute.displayForm;
}

describe("convertVisualization attribute references", () => {
    it("keeps a computed attribute's own type rather than flattening it to a display form", () => {
        // The fabricated display form of a computed attribute is not a label, so saving it as one is
        // refused by the backend ("referenced 'labels' entities do not exist").
        expect(convertedDisplayForm(idRef("rep-performance", "computedAttribute"))).toEqual(
            idRef("rep-performance", "computedAttribute"),
        );
    });

    it("still defaults an untyped identifier reference to a display form", () => {
        expect(convertedDisplayForm({ identifier: "label.owner.name" })).toEqual(
            idRef("label.owner.name", "displayForm"),
        );
    });

    it("leaves a uri reference alone", () => {
        expect(convertedDisplayForm({ uri: "/gdc/md/project/obj/1" })).toEqual({
            uri: "/gdc/md/project/obj/1",
        });
    });
});

function visualizationWithFilters(filters: unknown[]): IVisualization {
    return {
        visualizationObject: {
            content: {
                visualizationClass: { uri: "local:table", url: "local:table" },
                buckets: [],
                filters,
                properties: "{}",
            },
            meta: { title: "CA filter test", identifier: "vis-1" },
        },
    } as unknown as IVisualization;
}

function convertedFilterRef(filter: unknown) {
    const insight = convertVisualization(visualizationWithFilters([filter]), "local:table");
    const [converted] = insightFilters(insight);
    return filterObjRef(converted as IFilter);
}

describe("convertVisualization attribute filter references", () => {
    const computedAttributeRef = idRef("rep-performance", "computedAttribute");

    it.each([
        [
            "positive attribute filter",
            { positiveAttributeFilter: { displayForm: computedAttributeRef, in: ["high"] } },
        ],
        [
            "negative attribute filter",
            { negativeAttributeFilter: { displayForm: computedAttributeRef, notIn: ["low"] } },
        ],
        [
            "arbitrary attribute filter",
            {
                arbitraryAttributeFilter: {
                    displayForm: computedAttributeRef,
                    values: ["high"],
                    negativeSelection: false,
                },
            },
        ],
        [
            "match attribute filter",
            {
                matchAttributeFilter: {
                    displayForm: computedAttributeRef,
                    operator: "CONTAINS",
                    literal: "hi",
                },
            },
        ],
    ])("keeps a computed attribute's own type in a %s", (_name, filter) => {
        // A computed attribute has no labels, so filtering by it as one is refused by the backend.
        expect(convertedFilterRef(filter)).toEqual(computedAttributeRef);
    });

    it("still defaults an untyped attribute filter reference to a display form", () => {
        expect(
            convertedFilterRef({
                positiveAttributeFilter: { displayForm: { identifier: "label.owner.name" }, in: ["Joe"] },
            }),
        ).toEqual(idRef("label.owner.name", "displayForm"));
    });
});

describe("convertVisualization measure value filter dimensionality", () => {
    const computedAttributeRef = idRef("rep-performance", "computedAttribute");

    function convertedDimensionality(dimensionality: unknown[]) {
        const insight = convertVisualization(
            visualizationWithFilters([
                {
                    measureValueFilter: {
                        measure: { localIdentifier: "m1" },
                        condition: { comparison: { operator: "GREATER_THAN", value: 10 } },
                        dimensionality,
                    },
                },
            ]),
            "local:table",
        );
        const [converted] = insightFilters(insight);
        return (converted as IMeasureValueFilter).measureValueFilter.dimensionality;
    }

    it("keeps a computed attribute's own type in the dimensionality", () => {
        // A computed attribute picked from the catalog is referenced by its fabricated display form,
        // whose ref carries the computed attribute type. Flattening it to a display form makes the
        // backend look the id up among labels, where it does not exist.
        expect(convertedDimensionality([computedAttributeRef])).toEqual([computedAttributeRef]);
    });

    it("still defaults an untyped dimensionality reference to a display form", () => {
        expect(convertedDimensionality([{ identifier: "label.owner.name" }])).toEqual([
            idRef("label.owner.name", "displayForm"),
        ]);
    });

    it("keeps bucket attributes as local identifier references", () => {
        expect(convertedDimensionality([{ localIdentifier: "a1" }, computedAttributeRef])).toEqual([
            localIdRef("a1"),
            computedAttributeRef,
        ]);
    });
});

describe("convertVisualization ranking filter attributes", () => {
    it("keeps a computed attribute's own type in the out-of attributes", () => {
        const computedAttributeRef = idRef("rep-performance", "computedAttribute");
        const insight = convertVisualization(
            visualizationWithFilters([
                {
                    rankingFilter: {
                        measures: [{ localIdentifier: "m1" }],
                        attributes: [{ localIdentifier: "a1" }, computedAttributeRef],
                        operator: "TOP",
                        value: 3,
                    },
                },
            ]),
            "local:table",
        );
        const [converted] = insightFilters(insight);
        expect((converted as IRankingFilter).rankingFilter.attributes).toEqual([
            { localIdentifier: "a1" },
            computedAttributeRef,
        ]);
    });
});
