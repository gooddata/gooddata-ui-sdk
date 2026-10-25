// (C) 2022-2026 GoodData Corporation

import { omit } from "lodash-es";

import {
    type DateFilterGranularity,
    type IRelativeDateFilterPreset,
    isLowerBound,
    isUpperBound,
} from "@gooddata/sdk-model";
import { type DateFilterRelativeOptionGroup } from "@gooddata/sdk-ui-filters";

import { type IDateFilterConfig } from "../../../store/filter_bar/filter_bar_types.js";

const getRelativeDateFilterPresets = (): DateFilterRelativeOptionGroup => ({
    "GDC.time.minute": [
        {
            from: -14,
            to: 0,
            granularity: "GDC.time.minute",
            localIdentifier: "LAST_15_MINUTES",
            type: "relativePreset",
            visible: true,
            name: "",
        },
        {
            from: -29,
            to: 0,
            granularity: "GDC.time.minute",
            localIdentifier: "LAST_30_MINUTES",
            type: "relativePreset",
            visible: true,
            name: "",
        },
        {
            from: -44,
            to: 0,
            granularity: "GDC.time.minute",
            localIdentifier: "LAST_45_MINUTES",
            type: "relativePreset",
            visible: true,
            name: "",
        },
        {
            from: -59,
            to: 0,
            granularity: "GDC.time.minute",
            localIdentifier: "LAST_60_MINUTES",
            type: "relativePreset",
            visible: true,
            name: "",
        },
    ],
    "GDC.time.hour": [
        {
            from: -1,
            to: -1,
            granularity: "GDC.time.hour",
            localIdentifier: "LAST_HOUR",
            type: "relativePreset",
            visible: true,
            name: "",
        },
        {
            from: -7,
            to: 0,
            granularity: "GDC.time.hour",
            localIdentifier: "LAST_8_HOURS",
            type: "relativePreset",
            visible: true,
            name: "",
        },
        {
            from: -11,
            to: 0,
            granularity: "GDC.time.hour",
            localIdentifier: "LAST_12_HOURS",
            type: "relativePreset",
            visible: true,
            name: "",
        },
        {
            from: -23,
            to: 0,
            granularity: "GDC.time.hour",
            localIdentifier: "LAST_24_HOURS",
            type: "relativePreset",
            visible: true,
            name: "",
        },
    ],
    "GDC.time.date": [
        {
            from: 0,
            to: 0,
            granularity: "GDC.time.date",
            localIdentifier: "TODAY",
            type: "relativePreset",
            visible: true,
            name: "",
        },
        {
            from: -1,
            to: -1,
            granularity: "GDC.time.date",
            localIdentifier: "YESTERDAY",
            type: "relativePreset",
            visible: true,
            name: "",
        },
        {
            from: -6,
            to: 0,
            granularity: "GDC.time.date",
            localIdentifier: "LAST_7_DAYS",
            type: "relativePreset",
            visible: true,
            name: "",
        },
        {
            from: -29,
            to: 0,
            granularity: "GDC.time.date",
            localIdentifier: "LAST_30_DAYS",
            type: "relativePreset",
            visible: true,
            name: "",
        },
        {
            from: -89,
            to: 0,
            granularity: "GDC.time.date",
            localIdentifier: "LAST_90_DAYS",
            type: "relativePreset",
            visible: true,
            name: "",
        },
    ],
    "GDC.time.week_us": [
        {
            from: 0,
            to: 0,
            granularity: "GDC.time.week_us",
            localIdentifier: "THIS_WEEK_TO_DATE",
            type: "relativePreset",
            visible: true,
            name: "",
            boundedFilter: {
                to: 0,
                granularity: "GDC.time.date",
            },
        },
        {
            from: 0,
            to: 0,
            granularity: "GDC.time.week_us",
            localIdentifier: "THIS_WEEK",
            type: "relativePreset",
            visible: true,
            name: "",
        },
        {
            from: -1,
            to: -1,
            granularity: "GDC.time.week_us",
            localIdentifier: "LAST_WEEK",
            type: "relativePreset",
            visible: true,
            name: "",
        },
        {
            from: -1,
            to: 0,
            granularity: "GDC.time.week_us",
            localIdentifier: "LAST_2_WEEKS",
            type: "relativePreset",
            visible: true,
            name: "",
        },
    ],
    "GDC.time.month": [
        {
            from: 0,
            to: 0,
            granularity: "GDC.time.month",
            localIdentifier: "THIS_MONTH_TO_DATE",
            type: "relativePreset",
            visible: true,
            name: "",
            boundedFilter: {
                to: 0,
                granularity: "GDC.time.date",
            },
        },
        {
            from: 0,
            to: 0,
            granularity: "GDC.time.month",
            localIdentifier: "THIS_MONTH",
            type: "relativePreset",
            visible: true,
            name: "",
        },
        {
            from: -1,
            to: -1,
            granularity: "GDC.time.month",
            localIdentifier: "LAST_MONTH",
            type: "relativePreset",
            visible: true,
            name: "",
        },
        {
            from: -11,
            to: 0,
            granularity: "GDC.time.month",
            localIdentifier: "LAST_12_MONTHS",
            type: "relativePreset",
            visible: true,
            name: "",
        },
    ],
    "GDC.time.fiscal_month": [
        {
            from: 0,
            to: 0,
            granularity: "GDC.time.fiscal_month",
            localIdentifier: "THIS_FISCAL_MONTH_TO_DATE",
            type: "relativePreset",
            visible: true,
            name: "",
            boundedFilter: {
                to: 0,
                granularity: "GDC.time.date",
            },
        },
        {
            from: 0,
            to: 0,
            granularity: "GDC.time.fiscal_month",
            localIdentifier: "THIS_FISCAL_MONTH",
            type: "relativePreset",
            visible: true,
            name: "",
        },
        {
            from: -1,
            to: -1,
            granularity: "GDC.time.fiscal_month",
            localIdentifier: "LAST_FISCAL_MONTH",
            type: "relativePreset",
            visible: true,
            name: "",
        },
        {
            from: -11,
            to: 0,
            granularity: "GDC.time.fiscal_month",
            localIdentifier: "LAST_12_FISCAL_MONTHS",
            type: "relativePreset",
            visible: true,
            name: "",
        },
    ],
    "GDC.time.quarter": [
        {
            from: 0,
            to: 0,
            granularity: "GDC.time.quarter",
            localIdentifier: "THIS_QUARTER_TO_DATE",
            type: "relativePreset",
            visible: true,
            name: "",
            boundedFilter: {
                to: 0,
                granularity: "GDC.time.date",
            },
        },
        {
            from: 0,
            to: 0,
            granularity: "GDC.time.quarter",
            localIdentifier: "THIS_QUARTER",
            type: "relativePreset",
            visible: true,
            name: "",
        },
        {
            from: -1,
            to: -1,
            granularity: "GDC.time.quarter",
            localIdentifier: "LAST_QUARTER",
            type: "relativePreset",
            visible: true,
            name: "",
        },
        {
            from: -3,
            to: 0,
            granularity: "GDC.time.quarter",
            localIdentifier: "LAST_4_QUARTERS",
            type: "relativePreset",
            visible: true,
            name: "",
        },
    ],
    "GDC.time.fiscal_quarter": [
        {
            from: 0,
            to: 0,
            granularity: "GDC.time.fiscal_quarter",
            localIdentifier: "THIS_FISCAL_QUARTER_TO_DATE",
            type: "relativePreset",
            visible: true,
            name: "",
            boundedFilter: {
                to: 0,
                granularity: "GDC.time.date",
            },
        },
        {
            from: 0,
            to: 0,
            granularity: "GDC.time.fiscal_quarter",
            localIdentifier: "THIS_FISCAL_QUARTER",
            type: "relativePreset",
            visible: true,
            name: "",
        },
        {
            from: -1,
            to: -1,
            granularity: "GDC.time.fiscal_quarter",
            localIdentifier: "LAST_FISCAL_QUARTER",
            type: "relativePreset",
            visible: true,
            name: "",
        },
        {
            from: -3,
            to: 0,
            granularity: "GDC.time.fiscal_quarter",
            localIdentifier: "LAST_4_FISCAL_QUARTERS",
            type: "relativePreset",
            visible: true,
            name: "",
        },
    ],
    "GDC.time.year": [
        {
            from: 0,
            to: 0,
            granularity: "GDC.time.year",
            localIdentifier: "THIS_YEAR_TO_DATE",
            type: "relativePreset",
            visible: true,
            name: "",
            boundedFilter: {
                to: 0,
                granularity: "GDC.time.date",
            },
        },
        {
            from: 0,
            to: 0,
            granularity: "GDC.time.year",
            localIdentifier: "THIS_YEAR",
            type: "relativePreset",
            visible: true,
            name: "",
        },
        {
            from: -1,
            to: -1,
            granularity: "GDC.time.year",
            localIdentifier: "LAST_YEAR",
            type: "relativePreset",
            visible: true,
            name: "",
        },
    ],
    "GDC.time.fiscal_year": [
        {
            from: 0,
            to: 0,
            granularity: "GDC.time.fiscal_year",
            localIdentifier: "THIS_FISCAL_YEAR_TO_DATE",
            type: "relativePreset",
            visible: true,
            name: "",
            boundedFilter: {
                to: 0,
                granularity: "GDC.time.date",
            },
        },
        {
            from: 0,
            to: 0,
            granularity: "GDC.time.fiscal_year",
            localIdentifier: "THIS_FISCAL_YEAR",
            type: "relativePreset",
            visible: true,
            name: "",
        },
        {
            from: -1,
            to: -1,
            granularity: "GDC.time.fiscal_year",
            localIdentifier: "LAST_FISCAL_YEAR",
            type: "relativePreset",
            visible: true,
            name: "",
        },
    ],
});

export const RELATIVE_DATE_FILTER_PRESETS: DateFilterRelativeOptionGroup = getRelativeDateFilterPresets();

export const findSupportedRelativePresets = (supportsTime: boolean): DateFilterRelativeOptionGroup => {
    const omittedGranularities: DateFilterGranularity[] = [];
    if (!supportsTime) {
        omittedGranularities.push("GDC.time.minute", "GDC.time.hour");
    }
    return omit(getRelativeDateFilterPresets(), omittedGranularities);
};

export const findRelativePresetByValue = (value: IDateFilterConfig) => {
    const presets = RELATIVE_DATE_FILTER_PRESETS[
        value.granularity as DateFilterGranularity
    ] as IRelativeDateFilterPreset[];

    if (!presets || !value.interval) {
        return undefined;
    }

    return presets.find((preset) => {
        // Check basic properties
        const basicMatch = preset.from === value.interval[0] && preset.to === value.interval[1];

        if (!basicMatch) {
            return false;
        }

        // Check boundedFilter matching
        const presetHasBoundedFilter = !!preset.boundedFilter;
        const valueHasBoundedFilter = !!value.boundedFilter;

        // If both don't have boundedFilter, they match
        if (!presetHasBoundedFilter && !valueHasBoundedFilter) {
            return true;
        }

        // If only one has boundedFilter, they don't match
        if (presetHasBoundedFilter !== valueHasBoundedFilter) {
            return false;
        }

        // Both have boundedFilter - check properties
        if (presetHasBoundedFilter && valueHasBoundedFilter) {
            if (isUpperBound(preset.boundedFilter) && isUpperBound(value.boundedFilter)) {
                return (
                    preset.boundedFilter.granularity === value.boundedFilter.granularity &&
                    preset.boundedFilter.to === value.boundedFilter.to
                );
            } else if (isLowerBound(preset.boundedFilter) && isLowerBound(value.boundedFilter)) {
                return (
                    preset.boundedFilter.granularity === value.boundedFilter.granularity &&
                    preset.boundedFilter.from === value.boundedFilter.from
                );
            }
        }

        return false;
    });
};
