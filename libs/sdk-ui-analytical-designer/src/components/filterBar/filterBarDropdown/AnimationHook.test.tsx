// (C) 2019-2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useFilterBarButtonAnimationTimestamp, useIsEvenAnimation } from "./AnimationHook.js";
import { type IFilterBarDropdownItem } from "./model/filter_bar_dropdown_item.js";

const DISABLED_ATTRIBUTE_ITEM_1: IFilterBarDropdownItem = {
    bucketItemLocalIdentifiers: ["a1"],
    filterLocalIdentifier: null,
    id: "attr.id1",
    title: "Attribute 1",
};

const DISABLED_ATTRIBUTE_ITEM_2: IFilterBarDropdownItem = {
    bucketItemLocalIdentifiers: ["a2"],
    filterLocalIdentifier: null,
    id: "attr.id2",
    title: "Attribute 2",
};

const ENABLED_ATTRIBUTE_ITEM_3_WITHOUT_BUCKET_ITEM: IFilterBarDropdownItem = {
    bucketItemLocalIdentifiers: [],
    filterLocalIdentifier: "f1",
    id: "attr.id3",
    title: "Attribute 3",
};

const DISABLED_MEASURE_ITEM_1: IFilterBarDropdownItem = {
    bucketItemLocalIdentifiers: ["m1"],
    filterLocalIdentifier: null,
    id: "measure.id1",
    title: "Measure 1",
};

const DISABLED_MEASURE_ITEM_2: IFilterBarDropdownItem = {
    bucketItemLocalIdentifiers: ["m2"],
    filterLocalIdentifier: null,
    id: "measure.id2",
    title: "Measure 2",
};

const DISABLED_DATE_ITEM: IFilterBarDropdownItem = {
    id: "date.id1",
    bucketItemLocalIdentifiers: ["d1"],
    filterLocalIdentifier: null,
    title: "Date 1",
};

const ENABLED_DATE_ITEM_WITHOUT_BUCKET_ITEM: IFilterBarDropdownItem = {
    id: "date.id2",
    bucketItemLocalIdentifiers: [],
    filterLocalIdentifier: "f3",
    title: "Date 2",
};

describe("AnimationHook", () => {
    describe("useFilterBarButtonAnimationTimestamp", () => {
        const emptyMeasures: ReadonlyArray<IFilterBarDropdownItem> = [];
        const emptyAttributes: ReadonlyArray<IFilterBarDropdownItem> = [];

        it("should return null when no items are in dropdown", () => {
            const { result } = renderHook(() =>
                useFilterBarButtonAnimationTimestamp(null, emptyMeasures, emptyAttributes),
            );
            expect(result.current).toBeNull();
        });

        describe("date", () => {
            it("should return new timestamp when date was dropped to buckets", () => {
                const { result } = renderHook(() =>
                    useFilterBarButtonAnimationTimestamp(DISABLED_DATE_ITEM, emptyMeasures, emptyAttributes),
                );
                expect(result.current).not.toBeNull();
            });

            it("should not generate new timestamp when date was dropped to filter bar but not in buckets", () => {
                const { result } = renderHook(() =>
                    useFilterBarButtonAnimationTimestamp(
                        ENABLED_DATE_ITEM_WITHOUT_BUCKET_ITEM,
                        emptyMeasures,
                        emptyAttributes,
                    ),
                );
                expect(result.current).toBeNull();
            });

            it("should return the same timestamp when the same date was already enabled in the dropdown", () => {
                let dateItemNoFilter = { ...DISABLED_DATE_ITEM };
                const { result, rerender } = renderHook(() =>
                    useFilterBarButtonAnimationTimestamp(dateItemNoFilter, emptyMeasures, emptyAttributes),
                );
                const timestamp = result.current;
                expect(timestamp).not.toBeNull();

                dateItemNoFilter = { ...DISABLED_DATE_ITEM };
                rerender();

                expect(result.current).toBe(timestamp);
            });

            it("should return the same timestamp when the date was disabled and it was enabled", () => {
                let dateItemNoFilter = { ...DISABLED_DATE_ITEM };
                const { result, rerender } = renderHook(() =>
                    useFilterBarButtonAnimationTimestamp(dateItemNoFilter, emptyMeasures, emptyAttributes),
                );
                const timestamp = result.current;
                expect(timestamp).not.toBeNull();

                dateItemNoFilter = { ...DISABLED_DATE_ITEM, filterLocalIdentifier: "f4" };
                rerender();

                expect(result.current).toBe(timestamp);
            });
        });

        describe("attributes", () => {
            it("should return new timestamp when attribute was added to dropdown", () => {
                const attributes = [DISABLED_ATTRIBUTE_ITEM_1];
                const { result } = renderHook(() =>
                    useFilterBarButtonAnimationTimestamp(null, emptyMeasures, attributes),
                );
                expect(result.current).not.toBeNull();
            });

            it("should return new timestamp when another attribute was added to dropdown", () => {
                let attributes = [DISABLED_ATTRIBUTE_ITEM_1];

                const { result, rerender } = renderHook(() =>
                    useFilterBarButtonAnimationTimestamp(null, emptyMeasures, attributes),
                );

                const timestamp = result.current;
                expect(timestamp).not.toBeNull();

                attributes = [DISABLED_ATTRIBUTE_ITEM_1, DISABLED_ATTRIBUTE_ITEM_2];
                rerender();

                expect(result.current).not.toBeNull();
                expect(result.current).not.toBe(timestamp);
            });

            it("should return the same timestamp when the same attribute was added to dropdown for the second time", () => {
                let attributes = [DISABLED_ATTRIBUTE_ITEM_1];

                const { result, rerender } = renderHook(() =>
                    useFilterBarButtonAnimationTimestamp(null, emptyMeasures, attributes),
                );
                const timestamp = result.current;
                expect(timestamp).not.toBeNull();

                attributes = [DISABLED_ATTRIBUTE_ITEM_1];
                rerender();

                expect(result.current).not.toBeNull();
                expect(result.current).toBe(timestamp);
            });

            it("should return the same timestamp when the filter was added for an attribute that is not in the buckets", () => {
                let attributes = [DISABLED_ATTRIBUTE_ITEM_1];

                const { result, rerender } = renderHook(() =>
                    useFilterBarButtonAnimationTimestamp(null, emptyMeasures, attributes),
                );
                const timestamp = result.current;
                expect(timestamp).not.toBeNull();

                attributes = [DISABLED_ATTRIBUTE_ITEM_1, ENABLED_ATTRIBUTE_ITEM_3_WITHOUT_BUCKET_ITEM];
                rerender();

                expect(result.current).not.toBeNull();
                expect(result.current).toBe(timestamp);
            });

            it("should return the same timestamp when the filter was added for attribute that is already in the dropdown", () => {
                let attributes = [DISABLED_ATTRIBUTE_ITEM_1];

                const { result, rerender } = renderHook(() =>
                    useFilterBarButtonAnimationTimestamp(null, emptyMeasures, attributes),
                );
                const timestamp = result.current;
                expect(timestamp).not.toBeNull();

                const enabledAttributeItem = { ...DISABLED_ATTRIBUTE_ITEM_1, filterLocalIdentifier: "f5" };
                attributes = [enabledAttributeItem];
                rerender();

                expect(result.current).not.toBeNull();
                expect(result.current).toBe(timestamp);
            });

            it("should return the same timestamp when the attribute item has more bucket item local identifiers after the rerender", () => {
                let attributes = [DISABLED_ATTRIBUTE_ITEM_1];

                const { result, rerender } = renderHook(() =>
                    useFilterBarButtonAnimationTimestamp(null, emptyMeasures, attributes),
                );
                const timestamp = result.current;
                expect(timestamp).not.toBeNull();

                const enabledAttributeItem = {
                    ...DISABLED_ATTRIBUTE_ITEM_1,
                    bucketItemLocalIdentifiers: ["a1", "a2"],
                };
                attributes = [enabledAttributeItem];
                rerender();

                expect(result.current).not.toBeNull();
                expect(result.current).toBe(timestamp);
            });
        });

        describe("measures", () => {
            it("should return new timestamp when measure was added to dropdown", () => {
                const measures = [DISABLED_MEASURE_ITEM_1];
                const { result } = renderHook(() =>
                    useFilterBarButtonAnimationTimestamp(null, measures, emptyAttributes),
                );
                expect(result.current).not.toBeNull();
            });

            it("should return new timestamp when another measure was added to dropdown", () => {
                let measures = [DISABLED_MEASURE_ITEM_1];

                const { result, rerender } = renderHook(() =>
                    useFilterBarButtonAnimationTimestamp(null, measures, emptyAttributes),
                );
                const timestamp = result.current;
                expect(timestamp).not.toBeNull();

                measures = [DISABLED_MEASURE_ITEM_1, DISABLED_MEASURE_ITEM_2];
                rerender();

                expect(result.current).not.toBeNull();
                expect(result.current).not.toBe(timestamp);
            });

            it("should return the same timestamp when same measure was added to dropdown for the second time", () => {
                let measures = [DISABLED_MEASURE_ITEM_1];

                const { result, rerender } = renderHook(() =>
                    useFilterBarButtonAnimationTimestamp(null, measures, emptyAttributes),
                );
                const timestamp = result.current;
                expect(timestamp).not.toBeNull();

                measures = [DISABLED_MEASURE_ITEM_1];
                rerender();

                expect(result.current).not.toBeNull();
                expect(result.current).toBe(timestamp);
            });

            it("should return the same timestamp when the measure was disabled and then was enabled", () => {
                let measures = [DISABLED_MEASURE_ITEM_1];

                const { result, rerender } = renderHook(() =>
                    useFilterBarButtonAnimationTimestamp(null, measures, emptyAttributes),
                );
                const timestamp = result.current;
                expect(timestamp).not.toBeNull();

                const enabledMeasureItem = { ...DISABLED_MEASURE_ITEM_1, filterLocalIdentifier: "m3" };
                measures = [enabledMeasureItem];
                rerender();

                expect(result.current).not.toBeNull();
                expect(result.current).toBe(timestamp);
            });
        });
    });

    describe("useIsEvenAnimation", () => {
        it("should return the same value when animation timestamp is not changed between renders", () => {
            const animationTimestamp = 4;
            const { result, rerender } = renderHook(() => useIsEvenAnimation(animationTimestamp));
            expect(result.current).toBe(true);

            rerender();
            expect(result.current).toBe(true);
        });

        it("should return the negated value when animation timestamp is changed between renders", () => {
            let animationTimestamp = 4;
            const { result, rerender } = renderHook(() => useIsEvenAnimation(animationTimestamp));
            expect(result.current).toBe(true);

            animationTimestamp = 5;
            rerender();
            expect(result.current).toBe(false);

            animationTimestamp = 6;
            rerender();
            expect(result.current).toBe(true);
        });
    });
});
