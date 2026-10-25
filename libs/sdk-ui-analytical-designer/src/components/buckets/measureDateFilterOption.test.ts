// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { createDecoratedDateFilter } from "../../models/date_filter.js";
import { DATE_DATASET_ATTRIBUTE } from "../../models/date_item.js";
import { createDecoratedPresetItem } from "../../models/preset_item.js";
import { type IBucketItemMetricFilter } from "../../typings/bucket_item_filter.js";

import { measureDateFilterToOption, optionToMeasureDateFilterInterval } from "./measureDateFilterOption.js";

const storedFilter = (interval: unknown) =>
    createDecoratedDateFilter(
        { attribute: DATE_DATASET_ATTRIBUTE, interval } as IBucketItemMetricFilter,
        null,
    );

describe("measureDateFilterOption", () => {
    describe("measureDateFilterToOption", () => {
        it("returns undefined when the metric has no date filter", () => {
            expect(measureDateFilterToOption(undefined)).toBeUndefined();
            expect(measureDateFilterToOption({} as never)).toBeUndefined();
        });

        it("maps the legacy All time filter, stored as the bare preset name, to the All time option", () => {
            const option = measureDateFilterToOption(storedFilter({ name: "all_time" }));

            expect(option?.filterOption.type).toBe("allTime");
        });

        it("matches a legacy preset stored with numeric-string bounds", () => {
            const option = measureDateFilterToOption(
                storedFilter({ granularity: "GDC.time.year", interval: ["-1", "-1"], name: "last_year" }),
            );

            expect(option).toEqual({
                filterOption: expect.objectContaining({ localIdentifier: "LAST_YEAR" }),
                excludeCurrentPeriod: false,
            });
        });

        it("matches a to-date preset by its bounded filter", () => {
            const option = measureDateFilterToOption(
                storedFilter({
                    granularity: "GDC.time.month",
                    interval: [0, 0],
                    boundedFilter: { granularity: "GDC.time.date", to: 0 },
                }),
            );

            expect(option?.filterOption.localIdentifier).toBe("THIS_MONTH_TO_DATE");
        });

        it("keeps a legacy absolute filter absolute even without a name", () => {
            const option = measureDateFilterToOption(
                storedFilter({
                    type: "absolute",
                    granularity: "GDC.time.date",
                    interval: ["2026-01-01", "2026-01-31"],
                }),
            );

            expect(option?.filterOption).toMatchObject({
                type: "absoluteForm",
                from: "2026-01-01",
                to: "2026-01-31",
            });
        });

        it("reconstructs a relative form for a range that is not a preset", () => {
            const option = measureDateFilterToOption(
                storedFilter({ granularity: "GDC.time.month", interval: [-5, -2] }),
            );

            expect(option?.filterOption).toMatchObject({
                type: "relativeForm",
                granularity: "GDC.time.month",
                from: -5,
                to: -2,
            });
        });

        it("recognizes a preset stored with the current period excluded", () => {
            const option = measureDateFilterToOption(
                storedFilter({ type: "relative", granularity: "GDC.time.date", interval: [-7, -1] }),
            );

            expect(option).toEqual({
                filterOption: expect.objectContaining({ localIdentifier: "LAST_7_DAYS" }),
                excludeCurrentPeriod: true,
            });
        });
    });

    describe("optionToMeasureDateFilterInterval", () => {
        it("stores All time in the legacy shape, the bare preset name", () => {
            expect(
                optionToMeasureDateFilterInterval({
                    filterOption: { type: "allTime", localIdentifier: "ALL_TIME", name: "", visible: true },
                    excludeCurrentPeriod: false,
                }),
            ).toEqual({ name: "all_time" });
        });

        it("round-trips an hour preset that the legacy metric catalog could not express", () => {
            const option = measureDateFilterToOption(
                storedFilter({ type: "relative", granularity: "GDC.time.hour", interval: [-1, -1] }),
            );
            const interval = optionToMeasureDateFilterInterval(option);

            expect(interval).toMatchObject({
                type: "relative",
                granularity: "GDC.time.hour",
                interval: [-1, -1],
            });
            expect(() => createDecoratedPresetItem(interval)).not.toThrow();
        });

        it("shifts the range when the current period is excluded", () => {
            const option = measureDateFilterToOption(
                storedFilter({ type: "relative", granularity: "GDC.time.date", interval: [-6, 0] }),
            );

            expect(
                optionToMeasureDateFilterInterval({ ...option, excludeCurrentPeriod: true }),
            ).toMatchObject({
                granularity: "GDC.time.date",
                interval: [-7, -1],
            });
        });

        it("stores an absolute form as an absolute interval", () => {
            const option = measureDateFilterToOption(
                storedFilter({
                    type: "absolute",
                    granularity: "GDC.time.date",
                    interval: ["2026-01-01", "2026-01-31"],
                }),
            );

            expect(optionToMeasureDateFilterInterval(option)).toEqual({
                type: "absolute",
                granularity: "GDC.time.date",
                interval: ["2026-01-01", "2026-01-31"],
            });
        });
    });
});
