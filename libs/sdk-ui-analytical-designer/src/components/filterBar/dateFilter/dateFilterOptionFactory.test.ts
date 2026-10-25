// (C) 2022-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { ALL_TIME } from "../../../constants/presets.js";

import {
    buildDateFilterValueFromDateFilterOption,
    matchDateFilterValueToDateFilterOption,
} from "./dateFilterOptionFactory.js";
import {
    ALL_TIME_FILTER_OPTION,
    RELATIVE_PERIOD_FILTER_OPTION,
    STATIC_PERIOD_FILTER_OPTION,
} from "./defaultFilterOptions.js";
import { RELATIVE_DATE_FILTER_PRESETS } from "./presets.js";

describe("Date filter option factory", () => {
    describe("matchDateFilterValueToDateFilterOption", () => {
        it("should build expected option for undefined", () => {
            const result = matchDateFilterValueToDateFilterOption(undefined);
            expect(result).toMatchSnapshot();
        });

        it("should build expected option for all time filter", () => {
            const result = matchDateFilterValueToDateFilterOption({
                name: ALL_TIME,
                granularity: undefined,
                interval: undefined,
            });
            expect(result).toMatchSnapshot();
        });

        it("should build expected option for exact known preset", () => {
            const result = matchDateFilterValueToDateFilterOption({
                name: "LAST_4_QUARTERS",
                type: "relative",
                granularity: "GDC.time.quarter",
                interval: [-3, 0],
            });
            expect(result).toMatchSnapshot();
        });

        it("should build expected option for known preset with excluded period", () => {
            const result = matchDateFilterValueToDateFilterOption({
                name: "Last 4 quarters without current period",
                type: "relative",
                granularity: "GDC.time.quarter",
                interval: [-4, -1],
            });
            expect(result).toMatchSnapshot();
        });

        it("should build expected option for known preset with excluded period (with missing type)", () => {
            const result = matchDateFilterValueToDateFilterOption({
                name: "Last 4 quarters without current period",
                granularity: "GDC.time.quarter",
                interval: [-4, -1],
            });
            expect(result).toMatchSnapshot();
        });

        it("should build expected option for relative form not matching any preset", () => {
            const result = matchDateFilterValueToDateFilterOption({
                name: "My floating range",
                type: "relative",
                granularity: "GDC.time.year",
                interval: [-10, 69],
            });
            expect(result).toMatchSnapshot();
        });

        it("should build expected option for relative form without type not matching any preset", () => {
            const result = matchDateFilterValueToDateFilterOption({
                name: "My floating range",
                granularity: "GDC.time.year",
                interval: [-10, 69],
            });
            expect(result).toMatchSnapshot();
        });

        it("should build expected option for absolute form", () => {
            const result = matchDateFilterValueToDateFilterOption({
                name: "My static period",
                type: "absolute",
                granularity: "GDC.time.date",
                interval: ["01/01/2018", "12/31/2018"],
            });
            expect(result).toMatchSnapshot();
        });
    });

    describe("buildDateFilterValueFromDateFilterOption", () => {
        it("should build expected value for all time option", () => {
            const result = buildDateFilterValueFromDateFilterOption(ALL_TIME_FILTER_OPTION);
            expect(result).toMatchSnapshot();
        });

        it("should build expected value for absolute form option", () => {
            const result = buildDateFilterValueFromDateFilterOption({
                ...STATIC_PERIOD_FILTER_OPTION,
                from: "2019-12-24",
                to: "2019-12-26",
            });
            expect(result).toMatchSnapshot();
        });

        it("should build expected value for relative form option", () => {
            const result = buildDateFilterValueFromDateFilterOption({
                ...RELATIVE_PERIOD_FILTER_OPTION,
                from: -1,
                to: -6,
            });
            expect(result).toMatchSnapshot();
        });

        it("should build expected value for relative presets option", () => {
            const result = buildDateFilterValueFromDateFilterOption(
                RELATIVE_DATE_FILTER_PRESETS["GDC.time.month"].find(
                    (preset) => preset.localIdentifier === "LAST_MONTH",
                ),
            );
            expect(result).toMatchSnapshot();
        });
    });
});
