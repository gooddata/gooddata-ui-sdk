// (C) 2007-2026 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import { type ObjRef } from "@gooddata/sdk-model";

import { type IAppState } from "../store/types.js";
import {
    columnVisualizationClass,
    defaultBuckets,
    defaultVisualizationClasses,
    metadataBucketCategories,
    metadataBucketFiltersWithSelection,
    metadataBucketMeasures,
    setupAppStateWithDateDatasetMeta,
} from "../tests/constants.test.helpers.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import { withData } from "../tests/state_builder.test.helpers.js";
import { type IElement } from "../typings/measure_filters.js";

import {
    getFilterItemsDefinitions,
    getNewReportMDObject,
    getReportTitle,
    indexValidElements,
    isReportTitleEmpty,
} from "./report_service.js";

const initialState = getInitializedState();

describe("report_service", () => {
    let preparedState: IAppState;

    function getPreparedState() {
        const updatedState = withData(
            withData(withData(initialState, { buckets: defaultBuckets }), {
                visualizationClasses: defaultVisualizationClasses,
            }),
            { visualizationClass: columnVisualizationClass },
        );
        return setupAppStateWithDateDatasetMeta(updatedState);
    }

    beforeEach(() => {
        preparedState = getPreparedState();
    });

    describe("getReportTitle and isReportTitleEmpty", () => {
        it("should initial title should be empty string", () => {
            expect(getReportTitle(preparedState)).toEqual("");
            expect(isReportTitleEmpty(preparedState)).toEqual(true);
        });

        it("should return current report title", () => {
            const updatedState = withData(preparedState, { title: "foo" });

            expect(getReportTitle(updatedState)).toEqual("foo");
            expect(isReportTitleEmpty(updatedState)).toEqual(false);
        });
    });

    describe("getNewReportMDObject", () => {
        it("should return new report MDObject", () => {
            expect(getNewReportMDObject(preparedState)).toEqual({
                visualizationObject: {
                    meta: {
                        title: "",
                        summary: "",
                        category: "visualizationObject",
                    },
                    content: {
                        visualizationClass: {
                            uri: "/gdc/md/mockproject/obj/column",
                        },
                        buckets: [],
                    },
                },
            });
        });
    });

    describe("getFilterItemsDefinitions", () => {
        it("should prepare filter items from md object", () => {
            const buckets = [
                {
                    localIdentifier: "measures",
                    items: metadataBucketMeasures.items,
                },
                {
                    localIdentifier: "view",
                    items: metadataBucketCategories.items,
                },
            ];

            const filters = {
                localIdentifier: "filters",
                items: metadataBucketFiltersWithSelection,
            };

            const filterItemsDefinitions = getFilterItemsDefinitions(buckets, filters.items);

            const expected = [
                {
                    dfUri: "/gdc/md/TeamOneGoodSales1/obj/902",
                    elementUris: [
                        "/gdc/md/TeamOneGoodSales1/obj/901/elements?id=168288",
                        "/gdc/md/TeamOneGoodSales1/obj/901/elements?id=666",
                    ],
                },
                {
                    dfUri: "/gdc/md/TeamOneGoodSales1/obj/952",
                    elementUris: [
                        "/gdc/md/TeamOneGoodSales1/obj/949/elements?id=168282",
                        "/gdc/md/TeamOneGoodSales1/obj/949/elements?id=168284",
                        "/gdc/md/TeamOneGoodSales1/obj/949/elements?id=964771",
                    ],
                },
            ];

            expect(filterItemsDefinitions).toEqual(expected);
        });
    });

    describe("indexValidElements", () => {
        // equivalent to records that we received in Panther environment
        const validElements: Array<{ filterItemsRef: ObjRef; items: IElement[]; total: number }> = [
            {
                items: [
                    { title: "19.898682;-155.665857", uri: "Hawaii" },
                    { title: "27.664827;-81.515754", uri: "Florida" },
                    { title: "31.244823;-92.145024", uri: "Louisiana" },
                    { title: "31.968599;-99.901813", uri: "Texas" },
                    { title: "19.898682;-155.665857", uri: "19.898682;-155.665857" },
                ],
                total: 4,
                filterItemsRef: {
                    identifier: "GEO__STATE__LOCATION",
                    type: "displayForm",
                },
            },
            {
                items: [
                    { title: "19.898682;-155.665857", uri: "Hawaii" },
                    { title: "27.664827;-81.515754", uri: "Florida" },
                    { title: "31.244823;-92.145024", uri: "Louisiana" },
                    { title: "19.898682;-155.665857", uri: "19.898682;-155.665857" },
                    { title: "27.664827;-81.515754", uri: "27.664827;-81.515754" },
                    { title: "31.244823;-92.145024", uri: "31.244823;-92.145024" },
                ],
                total: 4,
                filterItemsRef: {
                    identifier: "GEO__STATE__LOCATION",
                    type: "displayForm",
                },
            },
        ];

        it("merges items from two arrays", () => {
            const mergedArrayResult = indexValidElements(validElements);

            expect(mergedArrayResult).toEqual({
                GEO__STATE__LOCATION: {
                    items: [
                        { title: "19.898682;-155.665857", uri: "Hawaii" },
                        { title: "27.664827;-81.515754", uri: "Florida" },
                        { title: "31.244823;-92.145024", uri: "Louisiana" },
                        { title: "19.898682;-155.665857", uri: "19.898682;-155.665857" },
                        { title: "27.664827;-81.515754", uri: "27.664827;-81.515754" },
                        { title: "31.244823;-92.145024", uri: "31.244823;-92.145024" },
                        { title: "31.968599;-99.901813", uri: "Texas" },
                    ],
                    total: 4,
                },
            });
        });
    });
});
