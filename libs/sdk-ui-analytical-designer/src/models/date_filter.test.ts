// (C) 2007-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { ALL_TIME, LAST_7_DAYS } from "../constants/presets.js";
import { mockIntlProp } from "../utils/with_intl.js";

import { type IDecoratedDateDatasetMeta } from "./date_dataset.js";
import { DecoratedDateFilter, createDecoratedDateFilter } from "./date_filter.js";
import { PRESETS } from "./preset_item.js";

describe("DecoratedDateFilter", () => {
    const defaultAttribute = "testAttribute";
    const defaultFilter = {
        attribute: defaultAttribute,
        interval: {},
    };
    const defaultDateDataset = {
        attributeTitle: "test title",
    } as IDecoratedDateDatasetMeta;
    const defaultBucketsMeta = {
        modified: {
            testAttribute: false,
        },
    };
    const defaultIsMeasure = false;

    describe("'interval' property", () => {
        it("should set interval from filter if available", () => {
            const interval = {
                name: "testInterval",
            };
            const filter = {
                attribute: defaultAttribute,
                interval,
            };
            const decoratedDateFilter = createDecoratedDateFilter(
                filter,
                defaultDateDataset,
                defaultBucketsMeta,
                defaultIsMeasure,
            );

            // the interval is normalized to a plain object at the model boundary
            expect(decoratedDateFilter.interval.original).toEqual({ name: "testInterval" });
        });

        it("should set interval from first preset if interval from filter is not available", () => {
            const filter = {
                attribute: defaultAttribute,
            };
            const decoratedDateFilter = createDecoratedDateFilter(
                filter,
                defaultDateDataset,
                defaultBucketsMeta,
                defaultIsMeasure,
            );

            expect(decoratedDateFilter.interval.original).toEqual(PRESETS[0]);
        });
    });

    describe("'isModified' property", () => {
        it("should be truthy when 'isMeasure' parameter is truthy", () => {
            const isMeasure = true;
            const decoratedDateFilter = createDecoratedDateFilter(
                defaultFilter,
                defaultDateDataset,
                defaultBucketsMeta,
                isMeasure,
            );

            expect(decoratedDateFilter.isModified).toEqual(true);
        });

        it("should be truthy when 'isMeasure' parameter is falsy, but 'bucketsMeta' contains modified attribute", () => {
            const isMeasure = false;
            const bucketsMeta = {
                modified: {
                    testAttribute: true,
                },
            };
            const decoratedDateFilter = createDecoratedDateFilter(
                defaultFilter,
                defaultDateDataset,
                bucketsMeta,
                isMeasure,
            );

            expect(decoratedDateFilter.isModified).toEqual(true);
        });

        it("should be falsy when 'isMeasure' parameter is falsy, and 'bucketsMeta' does not contain modified attribute", () => {
            const isMeasure = false;
            const bucketsMeta = {
                modified: {
                    testAttribute: false,
                },
            };
            const decoratedDateFilter = createDecoratedDateFilter(
                defaultFilter,
                defaultDateDataset,
                bucketsMeta,
                isMeasure,
            );

            expect(decoratedDateFilter.isModified).toEqual(false);
        });
    });

    describe("model functions", () => {
        const intl = mockIntlProp();

        describe("'isAllTime()'", () => {
            it("should be truthy, if interval has name 'all_time'", () => {
                const interval = {
                    name: ALL_TIME,
                };
                const filter = {
                    attribute: defaultAttribute,
                    interval,
                };
                const decoratedDateFilter = createDecoratedDateFilter(
                    filter,
                    defaultDateDataset,
                    defaultBucketsMeta,
                    defaultIsMeasure,
                );

                expect(DecoratedDateFilter.isAllTime(decoratedDateFilter)).toEqual(true);
            });

            it("should be falsy, if interval has name different from 'all_time'", () => {
                const interval = {
                    name: "something_else",
                };
                const filter = {
                    attribute: defaultAttribute,
                    interval,
                };
                const decoratedDateFilter = createDecoratedDateFilter(
                    filter,
                    defaultDateDataset,
                    defaultBucketsMeta,
                    defaultIsMeasure,
                );

                expect(DecoratedDateFilter.isAllTime(decoratedDateFilter)).toEqual(false);
            });
        });

        describe("'getAttributeTitle()'", () => {
            it("should return given attribute title", () => {
                const attributeTitle = "Test attribute title";
                const dateDataset = {
                    attributeTitle,
                } as IDecoratedDateDatasetMeta;
                const decoratedDateFilter = createDecoratedDateFilter(
                    defaultFilter,
                    dateDataset,
                    defaultBucketsMeta,
                    defaultIsMeasure,
                );

                expect(DecoratedDateFilter.getAttributeTitle(decoratedDateFilter)).toEqual(attributeTitle);
            });
        });

        describe("'getTitle()'", () => {
            it("should return proper title", () => {
                const decoratedDateFilter = createDecoratedDateFilter(
                    defaultFilter,
                    defaultDateDataset,
                    defaultBucketsMeta,
                    defaultIsMeasure,
                );

                expect(DecoratedDateFilter.getTitle(decoratedDateFilter, intl)).toEqual(
                    "test title: All time",
                );
            });
        });

        describe("'getIntervalTitle()'", () => {
            it("should return proper interval title", () => {
                const decoratedDateFilter = createDecoratedDateFilter(
                    defaultFilter,
                    defaultDateDataset,
                    defaultBucketsMeta,
                    defaultIsMeasure,
                );

                expect(DecoratedDateFilter.getIntervalTitle(decoratedDateFilter, intl)).toEqual("All time");
            });

            describe("empty date values mode", () => {
                const titleOf = (
                    interval: { name: string },
                    emptyDateValuesFilter: "include" | "exclude" | "only",
                ) =>
                    DecoratedDateFilter.getTitle(
                        createDecoratedDateFilter(
                            { attribute: defaultAttribute, interval, emptyDateValuesFilter },
                            defaultDateDataset,
                            defaultBucketsMeta,
                            true,
                        ),
                        intl,
                    );

                it("should show the excluded empty values on All time", () => {
                    expect(titleOf({ name: ALL_TIME }, "exclude")).toEqual(
                        "test title: All time except Empty values",
                    );
                });

                it("should show only the empty values", () => {
                    expect(titleOf({ name: ALL_TIME }, "only")).toEqual("test title: Empty values");
                });

                it("should keep the period title when the empty values are included", () => {
                    expect(titleOf({ name: ALL_TIME }, "include")).toEqual("test title: All time");
                });

                it("should keep the period title when the empty values are excluded from a period", () => {
                    expect(titleOf({ name: LAST_7_DAYS }, "exclude")).not.toContain("Empty values");
                });
            });
        });
    });
});
