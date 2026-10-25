// (C) 2007-2026 GoodData Corporation

// @vitest-environment node

import moment from "moment";
import { beforeEach, describe, expect, it } from "vitest";

import { ALL_TIME, LAST_7_DAYS, STATIC_PERIOD, THIS_QUARTER, THIS_YEAR } from "../constants/presets.js";
import { mockIntlProp } from "../utils/with_intl.js";

import { GRANULARITY, type Granularity } from "./granularity.js";
import {
    DecoratedPresetItem,
    type IDecoratedPresetItem,
    type IPresetItem,
    arePresetsEqual,
    asDateFilterConfig,
    createDecoratedPresetItem,
    getGranularityPresets,
    presetItem,
    presets,
} from "./preset_item.js";

const TIMEZONE_OFFSET_1H = -1000 * 60 * 60;

describe("Decorated Preset Item", () => {
    let baseItem: IPresetItem;
    let today: string;
    const intl = mockIntlProp();

    function createPresetItem(options: IPresetItem) {
        return createDecoratedPresetItem(
            presetItem({
                ...baseItem,
                ...options,
            }),
        );
    }

    beforeEach(() => {
        today = "2014-10-30T00:00:00.000Z";
        baseItem = { today, granularity: GRANULARITY.DATE };
    });

    describe("interval", () => {
        it("properties should be correctly set when interval represents floating range", () => {
            const preset = createPresetItem({
                interval: [-1, 0],
            });
            expect(preset.isFloating).toEqual(true);
            expect(preset.isStatic).toEqual(false);
            expect(preset.isSingle).toEqual(false);
            expect(preset.isRange).toEqual(true);
        });

        it("properties should be correctly set when interval represents static range", () => {
            const preset = createPresetItem({
                type: "absolute",
                interval: ["2014-10-29T00:00:00.000Z", "2014-10-30T00:00:00.000Z"],
            });
            expect(preset.isFloating).toEqual(false);
            expect(preset.isStatic).toEqual(true);
            expect(preset.isSingle).toEqual(false);
            expect(preset.isRange).toEqual(true);
        });

        it("properties should be correctly set when interval represents single floating date", () => {
            const preset = createPresetItem({
                interval: [-1, -1],
            });
            expect(preset.isFloating).toEqual(true);
            expect(preset.isStatic).toEqual(false);
            expect(preset.isSingle).toEqual(true);
            expect(preset.isRange).toEqual(false);
        });

        it("properties should be correctly set when interval represents single static date", () => {
            const preset = createPresetItem({
                type: "absolute",
                interval: ["2014-10-30T00:00:00.000Z", "2014-10-30T00:00:00.000Z"],
            });
            expect(preset.isFloating).toEqual(false);
            expect(preset.isStatic).toEqual(true);
            expect(preset.isSingle).toEqual(true);
            expect(preset.isRange).toEqual(false);
        });
    });

    describe("template", () => {
        beforeEach(() => {
            baseItem = {};
        });

        it("should return header id when item is a header", () => {
            const preset = createPresetItem({ header: "day" });
            expect(preset.template).toEqual("day");
        });

        it("should return all time id when no interval is set", () => {
            const preset = createPresetItem({});
            expect(preset.template).toEqual(ALL_TIME);
        });

        it("should return correct id for static intervals", () => {
            let preset = createPresetItem({
                granularity: GRANULARITY.DATE,
                type: "absolute",
                interval: ["2014-10-29T00:00:00.000Z", "2014-10-30T00:00:00.000Z"],
            });

            expect(preset.template).toEqual("date.interval.title.range");

            preset = createPresetItem({
                granularity: GRANULARITY.DATE,
                type: "absolute",
                interval: ["2014-10-30T00:00:00.000Z", "2014-10-30T00:00:00.000Z"],
            });

            expect(preset.template).toEqual("date.interval.title.single");
        });

        it("should return correct id for floating single dates", () => {
            let preset = createPresetItem({
                granularity: GRANULARITY.DATE,
                interval: [-1, -1],
            });

            expect(preset.template).toEqual("date.floating.title.last.day");

            preset = createPresetItem({
                granularity: GRANULARITY.MONTH,
                interval: [0, 0],
            });

            expect(preset.template).toEqual("date.floating.title.this.month");
        });

        it("should return correct id for floating range", () => {
            const preset = createPresetItem({
                granularity: GRANULARITY.DATE,
                interval: [-1, 0],
            });

            expect(preset.template).toEqual("date.floating.title.last.day");
        });
    });

    describe("unit config", () => {
        it("unitCount should return number of units for floating value", () => {
            let preset;

            preset = createPresetItem({ interval: [-1, 0] });
            expect(preset.unitCount).toEqual(2);

            preset = createPresetItem({ interval: [-5, -5] });
            expect(preset.unitCount).toEqual(5);

            preset = createPresetItem({ interval: [0, 0] });
            expect(preset.unitCount).toEqual(1);
        });

        it("unitTitle should return correct title for floating value", () => {
            let preset = createPresetItem({ interval: [-1, 0] });
            expect(DecoratedPresetItem.getUnitTitle(preset, intl)).toEqual("days");

            preset = createPresetItem({ interval: [-1, -1] });
            expect(DecoratedPresetItem.getUnitTitle(preset, intl)).toEqual("day");
        });

        it("moment config settings should be correctly initialized", () => {
            const preset = createPresetItem({});
            expect(preset.unitAbbrev).toEqual("d");
            expect(preset.unitFullName).toEqual("day");
            expect(preset.unitFormat).toEqual("MMM D, YYYY");
        });
    });

    describe("period", () => {
        it("should return start and end correctly for static interval", () => {
            const period = DecoratedPresetItem.getPeriod(
                createPresetItem({
                    type: "absolute",
                    interval: ["2014-10-29T00:00:00.000Z", "2014-10-30T00:00:00.000Z"],
                }),
            );

            const start = period.start;
            const end = period.end;

            expect(start.getUTCFullYear()).toEqual(2014);
            expect(start.getUTCDate()).toEqual(29);
            expect(end.getUTCDate()).toEqual(30);
        });

        it("should return start and end correctly for floating interval", () => {
            const period = DecoratedPresetItem.getPeriod(
                createPresetItem({
                    granularity: GRANULARITY.DATE,
                    interval: [-1, 0],
                }),
                0,
                0,
            );

            const start = period.start;
            const end = period.end;

            expect(start.getUTCFullYear()).toEqual(2014);
            expect(start.getUTCDate()).toEqual(29);
            expect(end.getUTCDate()).toEqual(30);
        });

        it("should return start and end correctly for floating interval with timezone offset", () => {
            const period = DecoratedPresetItem.getPeriod(
                createPresetItem({
                    granularity: GRANULARITY.DATE,
                    interval: [-1, 0],
                }),
                TIMEZONE_OFFSET_1H,
                0,
            );

            const start = period.start;
            const end = period.end;

            expect(start.getUTCFullYear()).toEqual(2014);
            expect(start.getUTCDate()).toEqual(28);
            expect(end.getUTCDate()).toEqual(29);
        });
    });

    describe("formattedPeriod", () => {
        it("should return period start and end correctly formatted as strings", () => {
            const formattedPeriod = DecoratedPresetItem.getFormattedPeriod(
                createPresetItem({
                    granularity: GRANULARITY.DATE,
                    interval: [-1, 0],
                }),
                0,
                0,
            );

            expect(formattedPeriod.start).toEqual("Oct 29, 2014");
            expect(formattedPeriod.end).toEqual("Oct 30, 2014");
        });
    });

    describe("title", () => {
        it("should provide translated header id", () => {
            const preset = createPresetItem({ header: "day" });
            expect(DecoratedPresetItem.getTitle(preset, intl)).toEqual("Day");
        });

        it("should construct correct floating filter title", () => {
            let preset = createPresetItem({});
            expect(DecoratedPresetItem.getTitle(preset, intl)).toEqual("All time");

            preset = createPresetItem({
                granularity: GRANULARITY.QUARTER,
                interval: [0, 0],
            });
            expect(DecoratedPresetItem.getTitle(preset, intl)).toEqual("This quarter");

            preset = createPresetItem({
                granularity: GRANULARITY.MONTH,
                interval: [-1, -1],
            });
            expect(DecoratedPresetItem.getTitle(preset, intl)).toEqual("Last month");

            preset = createPresetItem({
                granularity: GRANULARITY.MONTH,
                interval: [-4, 0],
            });
            expect(DecoratedPresetItem.getTitle(preset, intl)).toEqual("Last 5 months");

            preset = createPresetItem({
                granularity: GRANULARITY.DATE,
                interval: [-7, 0],
            });
            expect(DecoratedPresetItem.getTitle(preset, intl)).toEqual("Last 8 days");

            preset = createPresetItem({
                granularity: GRANULARITY.DATE,
                interval: [-5, -5],
            });
            expect(DecoratedPresetItem.getTitle(preset, intl)).toEqual("5 days ago");
        });

        it.each([
            [GRANULARITY.HOUR, [0, 0], "This hour"],
            [GRANULARITY.HOUR, [-1, -1], "Last hour"],
            [GRANULARITY.HOUR, [-7, 0], "Last 8 hours"],
            [GRANULARITY.HOUR, [-3, -3], "3 hours ago"],
            [GRANULARITY.MINUTE, [0, 0], "This minute"],
            [GRANULARITY.MINUTE, [-14, 0], "Last 15 minutes"],
            [GRANULARITY.MINUTE, [-5, -5], "5 minutes ago"],
            [GRANULARITY.SECOND, [0, 0], "This second"],
            [GRANULARITY.SECOND, [-29, 0], "Last 30 seconds"],
            [GRANULARITY.SECOND, [-10, -10], "10 seconds ago"],
        ] as const)("should construct floating title for %s %j", (granularity, interval, expected) => {
            const preset = createPresetItem({ granularity, interval: [...interval] });
            expect(DecoratedPresetItem.getTitle(preset, intl)).toEqual(expected);
        });

        it.each([
            [GRANULARITY.MINUTE, [-5, -2], "From 5 to 2 minutes ago"],
            [GRANULARITY.MINUTE, [-2, -1], "From 2 to 1 minute ago"],
            [GRANULARITY.MINUTE, [-2, 0], "Last 3 minutes"],
            [GRANULARITY.MINUTE, [-2, 1], "From 2 minutes ago to 1 minute ahead"],
            [GRANULARITY.MINUTE, [-2, 2], "From 2 minutes ago to 2 minutes ahead"],
            [GRANULARITY.MINUTE, [-1, 2], "From 1 minute ago to 2 minutes ahead"],
            [GRANULARITY.MINUTE, [-1, 1], "From 1 minute ago to 1 minute ahead"],
            [GRANULARITY.MINUTE, [-1, 0], "Last 2 minutes"],
            [GRANULARITY.MINUTE, [0, 1], "Next 2 minutes"],
            [GRANULARITY.MINUTE, [0, 4], "Next 5 minutes"],
            [GRANULARITY.MINUTE, [1, 4], "From 1 to 4 minutes ahead"],
            [GRANULARITY.MINUTE, [3, 4], "From 3 to 4 minutes ahead"],
            [GRANULARITY.MINUTE, [1, 1], "Next minute"],
            [GRANULARITY.MINUTE, [2, 2], "2 minutes ahead"],
            [GRANULARITY.SECOND, [-10, -5], "From 10 to 5 seconds ago"],
            [GRANULARITY.HOUR, [0, 2], "Next 3 hours"],
            [GRANULARITY.DATE, [-3, 2], "From 3 days ago to 2 days ahead"],
            [GRANULARITY.WEEK, [1, 3], "From 1 to 3 weeks ahead"],
            [GRANULARITY.MONTH, [-3, -1], "From 3 to 1 month ago"],
            [GRANULARITY.QUARTER, [0, 1], "Next 2 quarters"],
            [GRANULARITY.YEAR, [1, 1], "Next year"],
        ] as const)(
            "should word a range not ending at the current period like the date filter button for %s %j",
            (granularity, interval, expected) => {
                const preset = createPresetItem({ granularity, interval: [...interval] });
                expect(DecoratedPresetItem.getTitle(preset, intl)).toEqual(expected);
            },
        );

        it("should word a range stored with numeric string bounds", () => {
            const preset = createPresetItem({ granularity: GRANULARITY.MINUTE, interval: ["0", "1"] });
            expect(DecoratedPresetItem.getTitle(preset, intl)).toEqual("Next 2 minutes");
        });

        it("should construct correct interval filter title", () => {
            const preset = createPresetItem({
                type: "absolute",
                interval: ["2015-01-01T00:00:00.000Z", "2015-02-01T00:00:00.000Z"],
            });
            expect(DecoratedPresetItem.getTitle(preset, intl)).toEqual("Jan 1, 2015 - Feb 1, 2015");
        });
    });

    describe("pickerInterval", () => {
        function expectCorrectInterval(
            granularity: Granularity,
            interval: [number, number],
            start: string,
            end: string,
            timezoneOffset = 0,
        ) {
            const preset = createPresetItem({
                today: moment(new Date(2014, 10, 15)),
                granularity,
                interval,
            });

            const format = "MM/DD/YYYY";
            const pickerInterval = DecoratedPresetItem.getPickerInterval(preset, timezoneOffset, 0);

            expect(moment(pickerInterval.start).format(format)).toEqual(start);
            expect(moment(pickerInterval.end).format(format)).toEqual(end);
        }

        it("should generate proper formatted dates for this quarter", () => {
            expectCorrectInterval(GRANULARITY.QUARTER, [0, 0], "10/01/2014", "12/31/2014");
        });

        it("should generate proper formatted dates for last quarter", () => {
            expectCorrectInterval(GRANULARITY.QUARTER, [-1, -1], "07/01/2014", "09/30/2014");
        });

        it("should generate proper formatted dates for this month", () => {
            expectCorrectInterval(GRANULARITY.MONTH, [0, 0], "11/01/2014", "11/30/2014");
        });

        it("should generate proper formatted dates for last month", () => {
            expectCorrectInterval(GRANULARITY.MONTH, [-1, -1], "10/01/2014", "10/31/2014");
        });

        it("should generate proper formatted dates for this year", () => {
            expectCorrectInterval(GRANULARITY.YEAR, [0, 0], "01/01/2014", "12/31/2014");
        });

        it("should generate proper formatted dates for last year", () => {
            expectCorrectInterval(GRANULARITY.YEAR, [-1, -1], "01/01/2013", "12/31/2013");
        });

        it("should generate proper formatted dates for date range", () => {
            expectCorrectInterval(GRANULARITY.DATE, [-7, -1], "11/08/2014", "11/14/2014");
            expectCorrectInterval(GRANULARITY.DATE, [-1, 0], "11/14/2014", "11/15/2014");
        });

        it("should generate proper formatted dates for more complicated filter with quarters", () => {
            expectCorrectInterval(GRANULARITY.QUARTER, [-4, -2], "10/01/2013", "06/30/2014");
        });

        it("should generate proper formatted dates with timezone offset", () => {
            expectCorrectInterval(GRANULARITY.DATE, [-1, 0], "11/13/2014", "11/14/2014", TIMEZONE_OFFSET_1H);
        });
    });

    describe("getGranularityPresets", () => {
        function expectPreset(name: string, granularity: string, interval: [number, number]) {
            const preset = getGranularityPresets(name);

            expect(preset.interval).toEqual(interval);
            expect(preset.granularity).toEqual(granularity);
        }

        it("should get valid preset for this year", () => {
            expectPreset(THIS_YEAR, GRANULARITY.YEAR, [0, 0]);
        });

        it("should get valid preset for this quarter", () => {
            expectPreset(THIS_QUARTER, GRANULARITY.QUARTER, [0, 0]);
        });
    });

    describe("arePresetsEqual", () => {
        it("should match all time preset", () => {
            const selectedPreset: IDecoratedPresetItem = {};
            const preset: IDecoratedPresetItem = {
                name: ALL_TIME,
            };

            expect(arePresetsEqual(selectedPreset, preset)).toEqual(true);
        });

        it("should match static period preset", () => {
            const selectedPreset: IDecoratedPresetItem = {
                isStatic: true,
            };
            const preset: IDecoratedPresetItem = {
                name: STATIC_PERIOD,
                isStatic: true,
            };

            expect(arePresetsEqual(selectedPreset, preset)).toEqual(true);
        });

        it("should match relative preset", () => {
            const selectedPreset: IDecoratedPresetItem = {
                interval: [-6, 0],
                granularity: GRANULARITY.DATE,
            };
            const preset: IDecoratedPresetItem = {
                name: LAST_7_DAYS,
                interval: [-6, 0],
                granularity: GRANULARITY.DATE,
            };

            expect(arePresetsEqual(selectedPreset, preset)).toEqual(true);
        });

        it("should NOT match interval of relative preset", () => {
            const selectedPreset: IDecoratedPresetItem = {
                interval: [-6, 0],
                granularity: GRANULARITY.DATE,
            };
            const preset: IDecoratedPresetItem = {
                name: LAST_7_DAYS,
                interval: [-5, 0],
                granularity: GRANULARITY.DATE,
            };

            expect(arePresetsEqual(selectedPreset, preset)).toEqual(false);
        });

        it("should NOT match granularity of relative preset", () => {
            const selectedPreset: IDecoratedPresetItem = {
                interval: [-6, 0],
                granularity: GRANULARITY.DATE,
            };
            const preset: IDecoratedPresetItem = {
                name: LAST_7_DAYS,
                interval: [-6, 0],
                granularity: GRANULARITY.MONTH,
            };

            expect(arePresetsEqual(selectedPreset, preset)).toEqual(false);
        });
    });

    describe("asDateFilterConfig", () => {
        it("should convert all presets to expected format", () => {
            const dateFilterConfigs = presets.map(asDateFilterConfig);
            expect(dateFilterConfigs).toMatchSnapshot();
        });

        it("should convert static period", () => {
            const dateFilterConfig = asDateFilterConfig({
                name: STATIC_PERIOD,
                type: "absolute",
                granularity: GRANULARITY.DATE,
                interval: ["01/01/2018", "12/31/2018"],
            });
            expect(dateFilterConfig).toMatchSnapshot();
        });
    });
});
