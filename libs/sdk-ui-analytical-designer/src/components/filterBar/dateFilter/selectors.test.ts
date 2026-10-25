// (C) 2022-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type OverTimeComparisonType, OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import { METRIC } from "../../../constants/bucket.js";
import { DATE_DATASET_ATTRIBUTE } from "../../../models/date_item.js";
import { type IMeasuresDescriptions } from "../../../models/decorated_bucket_item.js";
import { type IBucketSequenceNumbers } from "../../../selectors/measure_sequence_numbers_selector.js";
import { FilterBarService } from "../../../store/filter_bar/filter_bar_service.js";
import { type IFilter } from "../../../store/filter_bar/filter_bar_types.js";
import { setupAppStateWithDateDatasetMeta } from "../../../tests/constants.test.helpers.js";
import { buildAttributeFilterMock, buildDateFilterMock } from "../../../tests/filter.test.helpers.js";
import { getInitializedState } from "../../../tests/state.test.helpers.js";
import { type IDecoratedBucketItems, type IRawBucketItems } from "../../../typings/buckets.js";

import { DateFilterSelectorTest } from "./selectors.js";

describe("selectors", () => {
    describe("getSelectedOverTimeComparisonType", () => {
        const getSelectedOverTimeComparisonType = DateFilterSelectorTest.getSelectedOverTimeComparisonType;
        const supportedOverTimeComparisonTypes: OverTimeComparisonType[] = [
            OverTimeComparisonTypes.NOTHING,
            OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            OverTimeComparisonTypes.PREVIOUS_PERIOD,
        ];
        const derivedMeasures: IRawBucketItems = [
            {
                type: METRIC,
                masterLocalIdentifier: "masterLocalIdentifier",
                localIdentifier: "localIdentifier",
                overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            },
        ];
        const dateBucketItems: IRawBucketItems = [
            {
                localIdentifier: "d1",
                type: "date",
            },
        ];

        it("should return 'nothing' if date dataset in date filter does not match any of date datasets in buckets (PoP is not available)", () => {
            const selectedOverTimeComparisonType: OverTimeComparisonType =
                getSelectedOverTimeComparisonType.resultFunc(
                    supportedOverTimeComparisonTypes,
                    derivedMeasures,
                    dateBucketItems,
                    false,
                );
            expect(selectedOverTimeComparisonType).toEqual(OverTimeComparisonTypes.NOTHING);
        });

        it("should return 'same_period_previous_year' if buckets do not contains date bucket items", () => {
            const selectedOverTimeComparisonType: OverTimeComparisonType =
                getSelectedOverTimeComparisonType.resultFunc(
                    supportedOverTimeComparisonTypes,
                    derivedMeasures,
                    [],
                    false,
                );
            expect(selectedOverTimeComparisonType).toEqual(OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR);
        });

        it("should return 'same_period_previous_year' if date dataset in date filter match one of date datasets in buckets (PoP is available)", () => {
            const selectedOverTimeComparisonType: OverTimeComparisonType =
                getSelectedOverTimeComparisonType.resultFunc(
                    supportedOverTimeComparisonTypes,
                    derivedMeasures,
                    dateBucketItems,
                    true,
                );
            expect(selectedOverTimeComparisonType).toEqual(OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR);
        });

        it("should return 'nothing' if supported comparison types do not contain comparison type of a metric", () => {
            const selectedOverTimeComparisonType: OverTimeComparisonType =
                getSelectedOverTimeComparisonType.resultFunc(
                    [OverTimeComparisonTypes.NOTHING] as unknown as OverTimeComparisonType[],
                    derivedMeasures,
                    dateBucketItems,
                    true,
                );
            expect(selectedOverTimeComparisonType).toEqual(OverTimeComparisonTypes.NOTHING);
        });
    });

    describe("getDecoratedCompatibleMeasures", () => {
        const decoratedBucketItems = [
            {
                localIdentifier: "m1",
                original: {},
            },
            {
                localIdentifier: "m2",
                original: {},
            },
        ] as IDecoratedBucketItems;
        const compatibleMeasures: IRawBucketItems = [
            {
                localIdentifier: "m1",
            },
        ];
        const sequenceNumbers: IBucketSequenceNumbers = {
            m1: 1,
            m2: 2,
        };
        const measureDescriptions: IMeasuresDescriptions = {
            m1: {
                title: "Measure 1",
                isFormattedAsPercentage: false,
                showInPercent: false,
            },
            m2: {
                title: "Measure 2",
                isFormattedAsPercentage: false,
                showInPercent: false,
            },
        };

        it("should return a subset of compatible measures as decoratedBucketItems", () => {
            const result = DateFilterSelectorTest.getComparisonCompatibleMeasure.resultFunc(
                decoratedBucketItems,
                compatibleMeasures,
                sequenceNumbers,
                measureDescriptions,
            );
            expect(result).toMatchSnapshot();
        });

        it("should not return decoratedBucketItems if there are no compatible measures", () => {
            const compatibleMeasures: IRawBucketItems = [];

            const result = DateFilterSelectorTest.getComparisonCompatibleMeasure.resultFunc(
                decoratedBucketItems,
                compatibleMeasures,
                sequenceNumbers,
                measureDescriptions,
            );
            expect(result).toEqual([]);
        });
    });

    describe("getDateFilterItem", () => {
        const state = setupAppStateWithDateDatasetMeta(getInitializedState());

        const DATE_FILTER: IFilter = buildDateFilterMock({
            cacheItemIdentifier: DATE_DATASET_ATTRIBUTE,
            localIdentifier: "date.localId",
        });

        const COUNTRY_ATTRIBUTE_FILTER: IFilter = buildAttributeFilterMock({
            cacheItemIdentifier: "attr.country.id",
            localIdentifier: "country.localId",
            filterConfig: {
                selectedElements: [
                    {
                        title: "title1",
                        uri: "uri1",
                    },
                    {
                        title: "title2",
                        uri: "uri2",
                    },
                ],
                isInverted: false,
                totalElementsCount: 5,
            },
        });

        const stateWithFilters = FilterBarService.setFilterItems(state, [
            DATE_FILTER,
            COUNTRY_ATTRIBUTE_FILTER,
        ]);

        it("should return the date filter item if it matches its properties", () => {
            const dateFilterItem = DateFilterSelectorTest.getDateFilterItem(stateWithFilters, {
                filterLocalIdentifier: "date.localId",
                onApply: () => {},
                onClose: () => {},
            });
            expect(dateFilterItem).toEqual(DATE_FILTER);
        });

        it("should return undefined if the date filter does not match its properties", () => {
            const dateFilterItem = DateFilterSelectorTest.getDateFilterItem(stateWithFilters, {
                filterLocalIdentifier: "date.other_localId",
                onApply: () => {},
                onClose: () => {},
            });
            expect(dateFilterItem).toEqual(undefined);
        });
    });
});
