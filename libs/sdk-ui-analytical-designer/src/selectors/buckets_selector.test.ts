// (C) 2007-2026 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import {
    type IInsightLayerDefinition,
    type ISortItem,
    type IVisualizationClassBody,
    uriRef,
} from "@gooddata/sdk-model";

import {
    ATTRIBUTE,
    DATE,
    FACT,
    MEASURES,
    METRIC,
    SECONDARY_MEASURES,
    STACK,
    VIEW,
} from "../constants/bucket.js";
import { LOCAL_BAR, LOCAL_PUSHPIN, LOCAL_TABLE, PUSHPIN } from "../constants/visualization_types.js";
import { defaultChartSortState } from "../store/chart_sort/chart_sort_state.js";
import { type IReferencePointState } from "../store/reference_point/reference_point_state.js";
import { type IAppState } from "../store/types.js";
import { withoutBucketItem } from "../tests/buckets_builder.test.helpers.js";
import {
    barVisualizationClass,
    columnVisualizationClass,
    setupAppStateWithDateDatasetMeta,
} from "../tests/constants.test.helpers.js";
import { withSupportedLocationIconUiConfig } from "../tests/extended_reference_point_builder.test.helpers.js";
import { withMdObjectMeta } from "../tests/report_builder.test.helpers.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import { withAppState, withData, withReport, withRoot } from "../tests/state_builder.test.helpers.js";
import { type IDecoratedBucket, type IDecoratedBucketItem, type IRawBucketItem } from "../typings/buckets.js";

import {
    bucketContentSelector,
    bucketsSelector,
    currentReportMDObject,
    currentReportMDObjectExtended,
    getAllMeasures,
    getAttributeIdentifier,
    getBucketItemsSelector,
    getDateBucketItemDateDatasetRefs,
    getDecoratedBucketItems,
    getDecoratedBuckets,
    getDecoratedBucketsExtended,
    getDisplayFormsForBucketItemSelector,
    getStoredLayers,
    isArithmeticMeasurePresent,
} from "./buckets_selector.js";
import { canApplyCustomSort } from "./chart_sort_selectors.js";

describe("Buckets selector test", () => {
    let state: IAppState;
    const dummyBucketSelectorInput = {
        bucketItem: {
            original: {
                attribute: "attr.opportunity.id",
            },
        } as IDecoratedBucketItem,
        localIdentifier: "test",
    };
    const stateData: Partial<IAppState["data"]> = {
        itemCache: {
            "fact.fact.spend_analysis.cart_additions": {
                id: "fact.spend_analysis.cart_additions",
                identifier: "fact.spend_analysis.cart_additions",
                isAvailable: true,
                summary: "",
                title: "Cart Additions",
                type: "fact",
                uri: "/gdc/md/TeamOneGoodSales1/obj/15418",
                ref: {
                    uri: "/gdc/md/TeamOneGoodSales1/obj/15418",
                },
            },
            "metric.aaeFKXFYiCc0": {
                expression: "SELECT SUM([/gdc/md/TeamOneGoodSales1/obj/15417])",
                format:
                    "[>=1000000000]$#,,,.0 B;[<=-1000000000]-$#,,,.0 B;[>=1000000]$#,,.0 M;[<=-1000000]-$#,,.0 " +
                    "M;[>=1000]$#,.0 K;[<=-1000]-$#,.0 K;$#,##0",
                id: "aaeFKXFYiCc0",
                identifier: "aaeFKXFYiCc0",
                isAvailable: true,
                summary: "",
                title: "Awareness",
                type: "metric",
                uri: "/gdc/md/TeamOneGoodSales1/obj/16212",
                ref: {
                    uri: "/gdc/md/TeamOneGoodSales1/obj/16212",
                },
            },
            "attribute.attr.product.id": {
                dimensionUri: "/gdc/md/TeamOneGoodSales1/obj/948",
                summary: "",
                identifier: "attr.product.id",
                dfUri: "/gdc/md/TeamOneGoodSales1/obj/952",
                dfIdentifier: "label.product.id.name",
                uri: "/gdc/md/TeamOneGoodSales1/obj/949",
                ref: {
                    uri: "/gdc/md/TeamOneGoodSales1/obj/949",
                },
                granularity: "attr.product.id",
                elementsUri: "/gdc/md/TeamOneGoodSales1/obj/952/elements",
                title: "Product",
                type: "attribute",
                id: "attr.product.id",
                isAvailable: true,
            },
            "attribute.attr.opportunity.id": {
                dimensionUri: "/gdc/md/TeamOneGoodSales1/obj/648",
                summary: "",
                identifier: "attr.opportunity.id",
                dfUri: "/gdc/md/TeamOneGoodSales1/obj/652",
                dfIdentifier: "label.opportunity.id.name",
                uri: "/gdc/md/TeamOneGoodSales1/obj/649",
                ref: {
                    uri: "/gdc/md/TeamOneGoodSales1/obj/649",
                },
                granularity: "attr.opportunity.id",
                elementsUri: "/gdc/md/TeamOneGoodSales1/obj/652/elements",
                title: "Opportunity",
                type: "attribute",
                id: "attr.opportunity.id",
                isAvailable: true,
                displayForms: [
                    {
                        id: "attr.opportunity.text",
                        uri: "/md/attr.opportunity.text",
                        title: "Text display form",
                        ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/666"),
                        type: undefined,
                    },
                    {
                        id: "attr.opportunity.hyperlink",
                        uri: "/md/attr.opportunity.hyperlink",
                        title: "Hyperlink display form",
                        ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/667"),
                        type: "GDC.link",
                    },
                    {
                        id: "attr.opportunity.image",
                        uri: "/md/attr.opportunity.image",
                        title: "Image display form",
                        ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/670"),
                        type: "GDC.image",
                    },
                    {
                        id: "attr.opportunity.geo_pin",
                        uri: "/md/attr.opportunity.geo_pin",
                        title: "Geo push pun display form",
                        ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/668"),
                        type: "GDC.geo.pin",
                    },
                    {
                        id: "attr.opportunity.geo_legacy",
                        uri: "/md/attr.opportunity.geo_legacy",
                        title: "Legacy geo display form",
                        ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/669"),
                        type: "GDC.geo.ausstates.code",
                    },
                ],
            },
        },
        visualizationClass: barVisualizationClass,
        buckets: [
            {
                localIdentifier: MEASURES,
                items: [
                    {
                        attribute: "fact.spend_analysis.cart_additions",
                        filters: [],
                        localIdentifier: "7bce369fdd0a444bb8e7a9612c39520f",
                        type: METRIC,
                        aggregation: "sum",
                    },
                    {
                        attribute: "aaeFKXFYiCc0",
                        filters: [],
                        localIdentifier: "558daa361c944e3dab84c892a6591add",
                        type: METRIC,
                    },
                ],
            },
            {
                localIdentifier: VIEW,
                items: [
                    {
                        attribute: "attr.product.id",
                        filters: [],
                        localIdentifier: "914773bd682b42c895b771c76e67ac86",
                        type: ATTRIBUTE,
                    },
                ],
            },
            {
                localIdentifier: STACK,
                items: [],
            },
        ],
        referencePoint: {
            buckets: [
                {
                    localIdentifier: MEASURES,
                    items: [
                        {
                            attribute: "fact.spend_analysis.cart_additions",
                            filters: [],
                            localIdentifier: "7bce369fdd0a444bb8e7a9612c39520f",
                            type: METRIC,
                            aggregation: "sum",
                        },
                        {
                            attribute: "aaeFKXFYiCc0",
                            filters: [],
                            localIdentifier: "558daa361c944e3dab84c892a6591add",
                            type: METRIC,
                        },
                    ],
                },
                {
                    localIdentifier: VIEW,
                    items: [
                        {
                            attribute: "attr.product.id",
                            filters: [],
                            localIdentifier: "914773bd682b42c895b771c76e67ac86",
                            type: ATTRIBUTE,
                        },
                    ],
                },
                {
                    localIdentifier: STACK,
                    items: [],
                },
            ],
        },
    };

    function applyStateData(base: IAppState): IAppState {
        let s = withRoot(base, { data: { ...base.data, itemCache: stateData.itemCache } });
        s = withRoot(s, { data: { ...s.data, visualizationClass: stateData.visualizationClass } });
        s = withData(s, { buckets: stateData.buckets });
        s = withRoot(s, { data: { ...s.data, referencePoint: {} as IReferencePointState } });
        return withRoot(s, {
            data: {
                ...s.data,
                referencePoint: { ...s.data.referencePoint, buckets: stateData.referencePoint.buckets },
            },
        });
    }

    beforeEach(() => {
        const stateWithDateDatasetMeta = setupAppStateWithDateDatasetMeta(getInitializedState());
        state = applyStateData(withRoot(stateWithDateDatasetMeta, { projectId: "my project" }));
    });

    describe("bucketsSelector", () => {
        it("should return visualization class", () => {
            const { visualizationClass } = bucketsSelector(state, dummyBucketSelectorInput);
            expect(visualizationClass.visualizationClass.url).toEqual(LOCAL_BAR);
        });

        it("should return decorated buckets", () => {
            const { buckets } = bucketsSelector(state, dummyBucketSelectorInput);

            buckets.forEach((bucket) => {
                bucket.items.forEach((item) => {
                    expect(!!item.isMeasure).toEqual(bucket.localIdentifier === MEASURES);
                });
            });
        });

        it("should return false when bucket is NOT being renamed", () => {
            const { isRenamingBucketItem: isBucketItemBeingRenamed } = bucketsSelector(
                state,
                dummyBucketSelectorInput,
            );
            expect(isBucketItemBeingRenamed).toBe(false);
        });

        it("should location icon enabled when extended reference point uiConfig location supported", () => {
            const stateWithDateDatasetMeta = setupAppStateWithDateDatasetMeta(getInitializedState());
            const preparedState = withData(stateWithDateDatasetMeta, {
                extendedReferencePoint: withSupportedLocationIconUiConfig(
                    stateWithDateDatasetMeta.data.extendedReferencePoint,
                    { supported: true },
                ),
            });

            const { isLocationIconEnabled } = bucketsSelector(preparedState, dummyBucketSelectorInput);
            expect(isLocationIconEnabled).toBe(true);
        });

        it("should return true when bucket is being renamed", () => {
            const updatedState = withAppState(state, { renamingBucketItem: true });
            const { isRenamingBucketItem: isBucketItemBeingRenamed } = bucketsSelector(
                updatedState,
                dummyBucketSelectorInput,
            );
            expect(isBucketItemBeingRenamed).toBe(true);
        });

        it("should return valid display forms", () => {
            const bucketItem = {
                original: {
                    attribute: "attr.opportunity.id",
                },
            } as IDecoratedBucketItem;
            const { displayForms } = bucketsSelector(state, { bucketItem, localIdentifier: undefined });
            expect(displayForms).toMatchSnapshot();
        });
    });

    describe("getAttributeIdentifier", () => {
        it("should return attribute identifier", () => {
            const bucketItem = {
                original: {
                    attribute: "attr.opportunity.id",
                },
            } as IDecoratedBucketItem;
            const id = getAttributeIdentifier(state, { bucketItem });
            expect(id).toEqual("attr.opportunity.id");
        });

        it("should return date attribute identifier", () => {
            const bucketItem = {
                original: {
                    attribute: "attr.datedataset",
                },
                granularity: {
                    granularity: "GDC.time.day_in_week",
                },
            } as IDecoratedBucketItem;
            const id = getAttributeIdentifier(state, { bucketItem });
            expect(id).toEqual("GDC.time.day_in_week");
        });

        it("should return undefined when attribute is not found if bucket item is not defined", () => {
            const id = getAttributeIdentifier(state, { bucketItem: undefined });
            expect(id).toBeUndefined();
        });
    });

    describe("getAllMeasures", () => {
        it("should return all measures from all buckets", () => {
            const preparedState = withData(state, {
                buckets: [
                    {
                        localIdentifier: MEASURES,
                        items: [
                            {
                                type: METRIC,
                                localIdentifier: "m1",
                            },
                            {
                                type: METRIC,
                                localIdentifier: "m2",
                            },
                        ],
                    },
                    {
                        localIdentifier: SECONDARY_MEASURES,
                        items: [
                            {
                                type: METRIC,
                                localIdentifier: "m3",
                                operandLocalIdentifiers: ["m1", "m2"],
                            },
                            {
                                type: ATTRIBUTE,
                                localIdentifier: "a1",
                            },
                        ],
                    },
                ],
            });

            const measures = getAllMeasures(preparedState);
            const measureIdentifiers = measures.map((measure: IRawBucketItem) => measure.localIdentifier);
            expect(measureIdentifiers).toEqual(["m1", "m2", "m3"]);
        });
    });

    describe("getStoredLayers", () => {
        const layers: IInsightLayerDefinition[] = [
            {
                id: "layer-1",
                type: PUSHPIN,
                name: "Layer 1",
                buckets: [],
            },
            {
                id: "layer-2",
                type: "area",
                name: "Layer 2",
                buckets: [],
            },
        ];
        const insightIdentifier = "insight-id";

        it("should return layers stored as plain arrays when visualization supports layers", () => {
            const preparedState = withData(
                withReport(
                    withData(withData(state, { layers: layers }), { layersOwner: insightIdentifier }),
                    {
                        lastSavedObject: withMdObjectMeta(
                            withData(withData(state, { layers: layers }), { layersOwner: insightIdentifier })
                                .report.lastSavedObject,
                            { identifier: insightIdentifier },
                        ),
                    },
                ),
                {
                    visualizationClass: {
                        visualizationClass: { url: LOCAL_PUSHPIN } as unknown as IVisualizationClassBody,
                    },
                },
            );
            expect(getStoredLayers(preparedState)).toEqual(layers);
        });

        it("should return empty array when owners do not match", () => {
            const preparedState = withData(
                withReport(withData(withData(state, { layers: layers }), { layersOwner: "different-id" }), {
                    lastSavedObject: withMdObjectMeta(
                        withData(withData(state, { layers: layers }), { layersOwner: "different-id" }).report
                            .lastSavedObject,
                        { identifier: insightIdentifier },
                    ),
                }),
                {
                    visualizationClass: {
                        visualizationClass: { url: LOCAL_PUSHPIN } as unknown as IVisualizationClassBody,
                    },
                },
            );
            expect(getStoredLayers(preparedState)).toEqual([]);
        });

        it("should return empty array when visualization does not support layers", () => {
            const preparedState = withData(
                withReport(
                    withData(withData(state, { layers: layers }), { layersOwner: insightIdentifier }),
                    {
                        lastSavedObject: withMdObjectMeta(
                            withData(withData(state, { layers: layers }), { layersOwner: insightIdentifier })
                                .report.lastSavedObject,
                            { identifier: insightIdentifier },
                        ),
                    },
                ),
                {
                    visualizationClass: {
                        visualizationClass: { url: LOCAL_TABLE } as unknown as IVisualizationClassBody,
                    },
                },
            );
            expect(getStoredLayers(preparedState)).toEqual([]);
        });
    });

    describe("isArithmeticMeasurePresent", () => {
        it("should return false when buckets are empty", () => {
            const preparedState = withData(state, {
                buckets: [
                    {
                        localIdentifier: MEASURES,
                        items: [],
                    },
                    {
                        localIdentifier: VIEW,
                        items: [],
                    },
                    {
                        localIdentifier: STACK,
                        items: [],
                    },
                ],
            });
            expect(isArithmeticMeasurePresent(preparedState)).toEqual(false);
        });

        it("should return true when arithmetic measure is in the first bucket", () => {
            const preparedState = withData(state, {
                buckets: [
                    {
                        localIdentifier: MEASURES,
                        items: [
                            {
                                type: METRIC,
                                localIdentifier: "m3",
                                operandLocalIdentifiers: ["m1", "m2"],
                            },
                            {
                                type: METRIC,
                                localIdentifier: "m1",
                            },
                            {
                                type: METRIC,
                                localIdentifier: "m2",
                            },
                        ],
                    },
                    {
                        localIdentifier: VIEW,
                        items: [],
                    },
                ],
            });
            expect(isArithmeticMeasurePresent(preparedState)).toEqual(true);
        });

        it("should return true when arithmetic measure is in the second bucket", () => {
            const preparedState = withData(state, {
                buckets: [
                    {
                        localIdentifier: MEASURES,
                        items: [
                            {
                                type: METRIC,
                                localIdentifier: "m1",
                            },
                            {
                                type: METRIC,
                                localIdentifier: "m2",
                            },
                        ],
                    },
                    {
                        localIdentifier: SECONDARY_MEASURES,
                        items: [
                            {
                                type: METRIC,
                                localIdentifier: "m3",
                                operandLocalIdentifiers: ["m1", "m2"],
                            },
                        ],
                    },
                ],
            });
            expect(isArithmeticMeasurePresent(preparedState)).toEqual(true);
        });
    });

    describe("currentReport and extended MDObject", () => {
        it("should create report metadata object", () => {
            const preparedState = withData(
                withData(state, { visualizationClass: columnVisualizationClass }),
                {
                    buckets: [
                        {
                            localIdentifier: MEASURES,
                            items: [],
                        },
                        {
                            localIdentifier: VIEW,
                            items: [],
                        },
                        {
                            localIdentifier: STACK,
                            items: [],
                        },
                    ],
                },
            );

            const mdObject = currentReportMDObject(preparedState);

            expect(mdObject).toEqual({
                visualizationClass: {
                    uri: columnVisualizationClass.visualizationClass.uri,
                },
                buckets: [],
            });
        });

        it("should create report metadata object with properties taken from what is in ext. ref. point", () => {
            const stateWithDateDatasetMeta = setupAppStateWithDateDatasetMeta(getInitializedState());
            const preparedState = withData(
                withData(stateWithDateDatasetMeta, { visualizationClass: columnVisualizationClass }),
                {
                    extendedReferencePoint: {
                        ...withData(stateWithDateDatasetMeta, {
                            visualizationClass: columnVisualizationClass,
                        }).data.extendedReferencePoint,
                        properties: { controls: { foo: {} } },
                    },
                },
            );

            const mdObject = currentReportMDObject(preparedState);

            expect(mdObject).toEqual({
                visualizationClass: {
                    uri: columnVisualizationClass.visualizationClass.uri,
                },
                properties: '{"controls":{"foo":{}}}',
                buckets: [],
            });
        });

        it("should create report metadata object without properties", () => {
            const stateWithDateDatasetMeta = setupAppStateWithDateDatasetMeta(getInitializedState());
            const preparedState = withData(
                withData(stateWithDateDatasetMeta, { visualizationClass: columnVisualizationClass }),
                {
                    extendedReferencePoint: {
                        ...withData(stateWithDateDatasetMeta, {
                            visualizationClass: columnVisualizationClass,
                        }).data.extendedReferencePoint,
                        properties: {},
                    },
                },
            );

            const mdObject = currentReportMDObject(preparedState);

            expect(mdObject).toEqual({
                visualizationClass: {
                    uri: columnVisualizationClass.visualizationClass.uri,
                },
                buckets: [],
            });
        });

        /**
         * `constructVisualizationMDObj` must COPY the sanitized properties before assigning
         * `sortItems`. Assigning onto the stored object writes THROUGH the store-shared reference,
         * and because this subtree is not immer-frozen it would not even throw: the applied sort
         * would silently become part of the stored extended reference point.
         */
        it("does not mutate the stored extended reference point properties when applying sort", () => {
            const storedProperties = { controls: { foo: {} } };
            const stateWithDateDatasetMeta = setupAppStateWithDateDatasetMeta(getInitializedState());
            const preparedState = withData(
                withData(
                    withData(applyStateData(stateWithDateDatasetMeta), {
                        visualizationClass: columnVisualizationClass,
                    }),
                    {
                        extendedReferencePoint: {
                            ...applyStateData(stateWithDateDatasetMeta).data.extendedReferencePoint,
                            properties: storedProperties,
                        },
                    },
                ),
                {
                    chartSort: {
                        // `sortConfig.supported` is what canApplyCustomSort reads — the branch that
                        // assigns sortItems, i.e. the branch this spec exists for
                        sortConfig: { ...defaultChartSortState.sortConfig, supported: true },
                        appliedSort: [{ attributeSortItem: { attributeIdentifier: "a1", direction: "asc" } }],
                    },
                },
            );

            // the premise, asserted rather than assumed: without it the spec is vacuous
            expect(canApplyCustomSort(preparedState)).toBe(true);

            const mdObject = currentReportMDObjectExtended(preparedState);

            // the applied sort DID reach the metadata object …
            expect(mdObject.properties).toContain("sortItems");
            // … without landing in the store-shared value it was derived from
            expect(preparedState.data.extendedReferencePoint.properties).toEqual({ controls: { foo: {} } });
            expect(storedProperties).toEqual({ controls: { foo: {} } });
        });

        it("should create report mdObject with supported properties and sort items", () => {
            const stateWithDateDatasetMeta = setupAppStateWithDateDatasetMeta(getInitializedState());
            const preparedState = withData(
                withData(applyStateData(stateWithDateDatasetMeta), {
                    visualizationClass: columnVisualizationClass,
                }),
                {
                    extendedReferencePoint: {
                        ...applyStateData(stateWithDateDatasetMeta).data.extendedReferencePoint,
                        properties: {
                            controls: { foo: {} },
                            // a PARTIAL sort item — the reader only echoes it back
                            sortItems: [
                                {
                                    attributeSortItem: {
                                        attributeIdentifier: "914773bd682b42c895b771c76e67ac86",
                                    },
                                },
                            ] as unknown as ISortItem[],
                        },
                    },
                },
            );

            const mdObject = currentReportMDObject(preparedState);

            expect(mdObject.properties).toEqual(
                '{"controls":{"foo":{}},"sortItems":[{"attributeSortItem":' +
                    '{"attributeIdentifier":"914773bd682b42c895b771c76e67ac86"}}]}',
            );
        });
    });

    describe("getDecoratedBuckets", () => {
        it("should return decorated buckets", () => {
            const decoratedBuckets = getDecoratedBuckets(state);

            expect(decoratedBuckets).toHaveLength(3);
            expect(decoratedBuckets[0]["localIdentifier"]).toEqual("measures");
            expect(decoratedBuckets[1]["localIdentifier"]).toEqual("view");
            expect(decoratedBuckets[2]["localIdentifier"]).toEqual("stack");
        });
    });

    describe("getDecoratedBucketItems", () => {
        it("should return decorated bucket items", () => {
            const decoratedBucketItems = getDecoratedBucketItems(state);

            expect(decoratedBucketItems).toHaveLength(3);
            expect(decoratedBucketItems[0]).toHaveProperty("original");
        });
    });

    describe("getDecoratedBucketsExtended", () => {
        it("should return decorated buckets extended", () => {
            const decoratedBucketsExtended = getDecoratedBucketsExtended(state);

            expect(decoratedBucketsExtended).toHaveLength(3);
            expect(decoratedBucketsExtended[0]["localIdentifier"]).toEqual("measures");
            expect(decoratedBucketsExtended[1]["localIdentifier"]).toEqual("view");
            expect(decoratedBucketsExtended[2]["localIdentifier"]).toEqual("stack");
        });
    });

    describe("bucketContentSelector", () => {
        it("should return showAddItemButton true when bucket accepts measures", () => {
            const bucket = { accepts: [METRIC] } as IDecoratedBucket;
            const props = bucketContentSelector(state, { bucket });
            expect(props.showAddItemButton).toBeTruthy();
        });

        it("should return showAddItemButton true when bucket accepts facts", () => {
            const bucket = { accepts: [FACT] } as IDecoratedBucket;
            const props = bucketContentSelector(state, { bucket });
            expect(props.showAddItemButton).toBeTruthy();
        });

        it("should return showAddItemButton false when bucket does not accept measures", () => {
            const bucket = { accepts: [ATTRIBUTE] } as IDecoratedBucket;
            const props = bucketContentSelector(state, { bucket });
            expect(props.showAddItemButton).toBeFalsy();
        });

        it("should return showAddItemButton false when there are less than two measures in buckets", () => {
            const bucket = { accepts: [METRIC] } as IDecoratedBucket;

            const measuresBucketIndex = 0;
            const firstMeasureIndex = 0;
            const updatedState = withData(state, {
                buckets: withoutBucketItem(state.data.buckets, measuresBucketIndex, firstMeasureIndex),
            });

            const props = bucketContentSelector(updatedState, { bucket });

            expect(props.showAddItemButton).toBeFalsy();
        });
    });

    describe("getBucketItemsSelector", () => {
        it("should return items from all the buckets", () => {
            expect(getBucketItemsSelector(state)).toEqual([
                {
                    attribute: "fact.spend_analysis.cart_additions",
                    filters: [],
                    localIdentifier: "7bce369fdd0a444bb8e7a9612c39520f",
                    type: METRIC,
                    aggregation: "sum",
                },
                {
                    attribute: "aaeFKXFYiCc0",
                    filters: [],
                    localIdentifier: "558daa361c944e3dab84c892a6591add",
                    type: METRIC,
                },
                {
                    attribute: "attr.product.id",
                    filters: [],
                    localIdentifier: "914773bd682b42c895b771c76e67ac86",
                    type: ATTRIBUTE,
                },
            ]);
        });
    });

    describe("getDateBucketItemDateDatasetRefs", () => {
        it("should return correct dateBucketItemDateDatasetRefs", () => {
            const preparedState = withData(state, {
                buckets: [
                    {
                        localIdentifier: MEASURES,
                        items: [],
                    },
                    {
                        localIdentifier: VIEW,
                        items: [
                            {
                                attribute: "attr.datedataset",
                                filters: [],
                                localIdentifier: "1",
                                type: DATE,
                                dateDatasetRef: {
                                    uri: "datedataset.1",
                                },
                            },
                            {
                                attribute: "attr.datedataset",
                                filters: [],
                                localIdentifier: "2",
                                type: DATE,
                                dateDatasetRef: {
                                    uri: "datedataset.2",
                                },
                            },
                        ],
                    },
                ],
            });

            expect(getDateBucketItemDateDatasetRefs(preparedState)).toEqual([
                {
                    uri: "datedataset.1",
                },
                {
                    uri: "datedataset.2",
                },
            ]);
        });
    });

    describe("getDisplayFormsForBucketItemSelector", () => {
        it("should return supported display forms for the attribute", () => {
            const bucketItem = {
                original: {
                    attribute: "attr.opportunity.id",
                },
            } as IDecoratedBucketItem;
            expect(getDisplayFormsForBucketItemSelector(state, { bucketItem })).toMatchSnapshot();
        });
    });
});
