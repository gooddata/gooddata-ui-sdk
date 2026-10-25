// (C) 2020-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type CatalogItem, type MetricType, idRef } from "@gooddata/sdk-model";

import { METRICS } from "../../../../constants/catalog_filters.js";
import { buildBucketItem } from "../../../../models/bucket_item.js";
import { rootReducer as RootReducer } from "../../../../reducers/root_reducer.js";
import { setCatalogItems } from "../../../../store/catalog/catalog_store_actions.js";
import { type IAppState } from "../../../../store/types.js";
import { defaultUiConfig } from "../../../../tests/constants.test.helpers.js";
import { getInitializedState } from "../../../../tests/state.test.helpers.js";
import { withAppState, withData } from "../../../../tests/state_builder.test.helpers.js";
import { type IRawBucketItem } from "../../../../typings/buckets.js";
import { type IBucketItem } from "../../../../typings/state_objects.js";
import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "../../../../utils/translations.js";

import { makeMeasureNumberFormatSelector } from "./measure_number_format_panel_selector.js";

function getInitializedStateWithIntlMessages(): IAppState {
    return withAppState(getInitializedState(), {
        intl: {
            ...getInitializedState().appState.intl,
            messages: {
                [DEFAULT_LANGUAGE]: DEFAULT_MESSAGES[DEFAULT_LANGUAGE],
            },
        },
    });
}

function setCatalogItem(state: IAppState, catalogItem: CatalogItem): IAppState {
    const setCatalogItemsAction = setCatalogItems([catalogItem]);
    return RootReducer(state, setCatalogItemsAction);
}

function setBucketItem(state: IAppState, bucketItem: Partial<IBucketItem>): IAppState {
    const builtBucketItem: IRawBucketItem = buildBucketItem(bucketItem);
    return withData(state, {
        buckets: [
            {
                localIdentifier: METRICS,
                items: [builtBucketItem],
            },
        ],
    });
}

function setTestBucketAndCatalogItems(
    state: IAppState,
    bucketItemProps: Partial<IBucketItem> = {},
    metricType?: MetricType,
): IAppState {
    let newState = setCatalogItem(state, {
        measure: {
            type: "measure",
            id: "id1",
            ref: idRef("id1"),
            title: "Measure",
            uri: "uri1",
            format: "catalogItemFormat#",
            deprecated: false,
            description: "",
            expression: "",
            production: true,
            unlisted: false,
            metricType,
        },
        groups: [],
        type: "measure",
    });
    newState = withData(newState, {
        extendedReferencePoint: { ...newState.data.extendedReferencePoint, uiConfig: defaultUiConfig },
    });
    return setBucketItem(newState, {
        format: "bucketItemFormat#",
        attribute: "id1",
        ...bucketItemProps,
    });
}
describe("Measure Number Format Selector", () => {
    it("should work with initial state", () => {
        const state = getInitializedStateWithIntlMessages();
        const selector = makeMeasureNumberFormatSelector("testLocalIdentifier123");

        const resultProps = selector(state);

        expect(resultProps).toMatchObject({
            defaultCustomFormat: null,
            formattingDocumentationLink: undefined,
            selectedFormat: null,
            separators: undefined,
            inheritAvailable: false,
            metricType: undefined,
            enableMetricFormatOverrides: false,
            currencyFormatOverride: null,
        });
    });

    it("should provide selectedFormat from bucket item and defaultCustomFormat from catalogItem", () => {
        const bubcketItemLocalIdentifier = "testLocalIdentifier123";
        let state = getInitializedStateWithIntlMessages();
        state = setTestBucketAndCatalogItems(state, { localIdentifier: bubcketItemLocalIdentifier });
        const selector = makeMeasureNumberFormatSelector(bubcketItemLocalIdentifier);

        const resultProps = selector(state);

        expect(resultProps).toMatchObject({
            defaultCustomFormat: "catalogItemFormat#",
            selectedFormat: "bucketItemFormat#",
        });
    });

    it("should provide separators, formattingDocumentationLink and inheritAvailable", () => {
        const selector = makeMeasureNumberFormatSelector("testLocalIdentifier123");
        const separators = {
            thousand: ",",
            decimal: ".",
        };

        const resultProps = selector.resultFunc(
            "selectedFormat#",
            "defaultCustomFormat",
            separators,
            "docLink",
            true, // inheritAvailable
            "CURRENCY", // metricType
            true, // enableMetricFormatOverrides
            "$#,##0.00", // currencyFormatOverride
        );

        expect(resultProps).toEqual({
            selectedFormat: "selectedFormat#",
            defaultCustomFormat: "defaultCustomFormat",
            separators: separators,
            formattingDocumentationLink: "docLink",
            inheritAvailable: true,
            metricType: "CURRENCY",
            enableMetricFormatOverrides: true,
            currencyFormatOverride: "$#,##0.00",
        });
    });

    it.each`
        bucketItemType                | bucketItemProps                    | expectedInheritAvailable
        ${"simple measure"}           | ${{}}                              | ${true}
        ${"arithmetic measure"}       | ${{ operandLocalIdentifiers: [] }} | ${false}
        ${"ad-hoc attribute measure"} | ${{ aggregation: "count" }}        | ${false}
        ${"ad-hoc fact measure"}      | ${{ aggregation: "sum" }}          | ${false}
    `(
        "should return correct inheritAvailable for $bucketItemType",
        ({ bucketItemProps, expectedInheritAvailable }) => {
            const bubcketItemLocalIdentifier = "testLocalIdentifier123";
            let state = getInitializedStateWithIntlMessages();
            state = setTestBucketAndCatalogItems(state, {
                localIdentifier: bubcketItemLocalIdentifier,
                ...bucketItemProps,
            });

            const selector = makeMeasureNumberFormatSelector(bubcketItemLocalIdentifier);

            const resultProps = selector(state);

            expect(resultProps.inheritAvailable).toBe(expectedInheritAvailable);
        },
    );

    it("should return metricType from catalog item", () => {
        const bubcketItemLocalIdentifier = "testLocalIdentifier123";
        let state = getInitializedStateWithIntlMessages();
        state = setTestBucketAndCatalogItems(
            state,
            { localIdentifier: bubcketItemLocalIdentifier },
            "CURRENCY",
        );

        const selector = makeMeasureNumberFormatSelector(bubcketItemLocalIdentifier);
        const resultProps = selector(state);

        expect(resultProps.metricType).toBe("CURRENCY");
    });
});
