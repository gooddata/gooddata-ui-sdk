// (C) 2022-2026 GoodData Corporation

import { idRef } from "@gooddata/sdk-model";

import { type IDecoratedDateDataset } from "../models/decorated_date_dataset.js";
import { type IDateDatasetRefWithGranularities } from "../typings/datasets.js";

export const dateDataset1: IDecoratedDateDataset = {
    identifier: "DATE1",
    ref: idRef("DATE1"),
    title: "Dataset 3",
};

export const dateDataset2: IDecoratedDateDataset = {
    identifier: "DATE2",
    ref: idRef("DATE2"),
    title: "Dataset 2",
};

export const dateDataset3: IDecoratedDateDataset = {
    identifier: "DATE3",
    ref: idRef("DATE3"),
    title: "Dataset 3",
};

export const dateDatasetRefsWithGranularities: IDateDatasetRefWithGranularities[] = [
    {
        ref: {
            identifier: "DATE1",
            type: "dataSet",
        },
        attributes: [
            {
                ref: {
                    identifier: "DATE1.year",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE1.year",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE1.year",
                dateType: "GDC.time.year",
                label: "year",
            },
            {
                ref: {
                    identifier: "DATE1.quarter",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE1.quarter",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE1.quarter",
                dateType: "GDC.time.quarter",
                label: "quarter",
                recommendationLabel: "this_quarter",
            },
            {
                ref: {
                    identifier: "DATE1.month",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE1.month",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE1.month",
                dateType: "GDC.time.month",
                label: "month",
                recommendationLabel: "this_month",
            },
            {
                ref: {
                    identifier: "DATE1.week",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE1.week",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE1.week",
                dateType: "GDC.time.week_us",
                label: "week",
            },
            {
                ref: {
                    identifier: "DATE1.day",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE1.day",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE1.day",
                dateType: "GDC.time.date",
                label: "day",
            },
            {
                ref: {
                    identifier: "DATE1.hour",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE1.hour",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE1.hour",
                dateType: "GDC.time.hour",
                label: "hour",
            },
            {
                ref: {
                    identifier: "DATE1.minute",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE1.minute",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE1.minute",
                dateType: "GDC.time.minute",
                label: "minute",
            },
            {
                ref: {
                    identifier: "DATE1.minuteOfHour",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE1.minuteOfHour",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE1.minuteOfHour",
                dateType: "GDC.time.minute_in_hour",
                label: "minute_in_hour",
                valuesPreview: "minute_in_hour_preview",
                chronologicalGranularity: "GDC.time.minute",
            },
            {
                ref: {
                    identifier: "DATE1.hourOfDay",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE1.hourOfDay",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE1.hourOfDay",
                dateType: "GDC.time.hour_in_day",
                label: "hour_in_day",
                valuesPreview: "hour_in_day_preview",
                chronologicalGranularity: "GDC.time.hour",
            },
            {
                ref: {
                    identifier: "DATE1.dayOfWeek",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE1.dayOfWeek",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE1.dayOfWeek",
                dateType: "GDC.time.day_in_week",
                label: "day_in_week",
                valuesPreview: "day_in_week_preview",
                chronologicalGranularity: "GDC.time.date",
            },
            {
                ref: {
                    identifier: "DATE1.dayOfMonth",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE1.dayOfMonth",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE1.dayOfMonth",
                dateType: "GDC.time.day_in_month",
                label: "day_in_month",
                valuesPreview: "day_in_month_preview",
                chronologicalGranularity: "GDC.time.date",
            },
            {
                ref: {
                    identifier: "DATE1.dayOfYear",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE1.dayOfYear",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE1.dayOfYear",
                dateType: "GDC.time.day_in_year",
                label: "day_in_year",
                valuesPreview: "day_in_year_preview",
                chronologicalGranularity: "GDC.time.date",
            },
            {
                ref: {
                    identifier: "DATE1.weekOfYear",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE1.weekOfYear",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE1.weekOfYear",
                dateType: "GDC.time.week_in_year",
                label: "week_in_year",
                valuesPreview: "week_in_year_preview",
                chronologicalGranularity: "GDC.time.week_us",
            },
            {
                ref: {
                    identifier: "DATE1.monthOfYear",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE1.monthOfYear",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE1.monthOfYear",
                dateType: "GDC.time.month_in_year",
                label: "month_in_year",
                valuesPreview: "month_in_year_preview",
                chronologicalGranularity: "GDC.time.month",
            },
            {
                ref: {
                    identifier: "DATE1.quarterOfYear",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE1.quarterOfYear",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE1.quarterOfYear",
                dateType: "GDC.time.quarter_in_year",
                label: "quarter_in_year",
                valuesPreview: "quarter_in_year_preview",
                chronologicalGranularity: "GDC.time.quarter",
            },
        ],
    },
    {
        ref: {
            identifier: "DATE2",
            type: "dataSet",
        },
        attributes: [
            {
                ref: {
                    identifier: "DATE2.year",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE2.year",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE2.year",
                dateType: "GDC.time.year",
                label: "year",
            },
            {
                ref: {
                    identifier: "DATE2.quarter",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE2.quarter",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE2.quarter",
                dateType: "GDC.time.quarter",
                label: "quarter",
                recommendationLabel: "this_quarter",
            },
            {
                ref: {
                    identifier: "DATE2.month",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE2.month",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE2.month",
                dateType: "GDC.time.month",
                label: "month",
                recommendationLabel: "this_month",
            },
            {
                ref: {
                    identifier: "DATE2.week",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE2.week",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE2.week",
                dateType: "GDC.time.week_us",
                label: "week",
            },
            {
                ref: {
                    identifier: "DATE2.day",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE2.day",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE2.day",
                dateType: "GDC.time.date",
                label: "day",
            },
            {
                ref: {
                    identifier: "DATE2.hour",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE2.hour",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE2.hour",
                dateType: "GDC.time.hour",
                label: "hour",
            },
            {
                ref: {
                    identifier: "DATE2.minute",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE2.minute",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE2.minute",
                dateType: "GDC.time.minute",
                label: "minute",
            },
            {
                ref: {
                    identifier: "DATE2.minuteOfHour",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE2.minuteOfHour",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE2.minuteOfHour",
                dateType: "GDC.time.minute_in_hour",
                label: "minute_in_hour",
                valuesPreview: "minute_in_hour_preview",
                chronologicalGranularity: "GDC.time.minute",
            },
            {
                ref: {
                    identifier: "DATE2.hourOfDay",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE2.hourOfDay",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE2.hourOfDay",
                dateType: "GDC.time.hour_in_day",
                label: "hour_in_day",
                valuesPreview: "hour_in_day_preview",
                chronologicalGranularity: "GDC.time.hour",
            },
            {
                ref: {
                    identifier: "DATE2.dayOfWeek",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE2.dayOfWeek",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE2.dayOfWeek",
                dateType: "GDC.time.day_in_week",
                label: "day_in_week",
                valuesPreview: "day_in_week_preview",
                chronologicalGranularity: "GDC.time.date",
            },
            {
                ref: {
                    identifier: "DATE2.dayOfMonth",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE2.dayOfMonth",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE2.dayOfMonth",
                dateType: "GDC.time.day_in_month",
                label: "day_in_month",
                valuesPreview: "day_in_month_preview",
                chronologicalGranularity: "GDC.time.date",
            },
            {
                ref: {
                    identifier: "DATE2.dayOfYear",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE2.dayOfYear",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE2.dayOfYear",
                dateType: "GDC.time.day_in_year",
                label: "day_in_year",
                valuesPreview: "day_in_year_preview",
                chronologicalGranularity: "GDC.time.date",
            },
            {
                ref: {
                    identifier: "DATE2.weekOfYear",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE2.weekOfYear",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE2.weekOfYear",
                dateType: "GDC.time.week_in_year",
                label: "week_in_year",
                valuesPreview: "week_in_year_preview",
                chronologicalGranularity: "GDC.time.week_us",
            },
            {
                ref: {
                    identifier: "DATE2.monthOfYear",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE2.monthOfYear",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE2.monthOfYear",
                dateType: "GDC.time.month_in_year",
                label: "month_in_year",
                valuesPreview: "month_in_year_preview",
                chronologicalGranularity: "GDC.time.month",
            },
            {
                ref: {
                    identifier: "DATE2.quarterOfYear",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE2.quarterOfYear",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE2.quarterOfYear",
                dateType: "GDC.time.quarter_in_year",
                label: "quarter_in_year",
                valuesPreview: "quarter_in_year_preview",
                chronologicalGranularity: "GDC.time.quarter",
            },
        ],
    },
    {
        ref: {
            identifier: "DATE3",
            type: "dataSet",
        },
        attributes: [
            {
                ref: {
                    identifier: "DATE3.quarter",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE3.quarter",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE3.quarter",
                dateType: "GDC.time.quarter",
                label: "quarter",
                recommendationLabel: "this_quarter",
            },
            {
                ref: {
                    identifier: "DATE3.month",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE3.month",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE3.month",
                dateType: "GDC.time.month",
                label: "month",
                recommendationLabel: "this_month",
            },
            {
                ref: {
                    identifier: "DATE3.week",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE3.week",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE3.week",
                dateType: "GDC.time.week_us",
                label: "week",
            },
            {
                ref: {
                    identifier: "DATE3.day",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE3.day",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE3.day",
                dateType: "GDC.time.date",
                label: "day",
            },
            {
                ref: {
                    identifier: "DATE3.hour",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE3.hour",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE3.hour",
                dateType: "GDC.time.hour",
                label: "hour",
            },
            {
                ref: {
                    identifier: "DATE3.hourOfDay",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE3.hourOfDay",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE3.hourOfDay",
                dateType: "GDC.time.hour_in_day",
                label: "hour_in_day",
                valuesPreview: "hour_in_day_preview",
                chronologicalGranularity: "GDC.time.hour",
            },
            {
                ref: {
                    identifier: "DATE3.dayOfWeek",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE3.dayOfWeek",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE3.dayOfWeek",
                dateType: "GDC.time.day_in_week",
                label: "day_in_week",
                valuesPreview: "day_in_week_preview",
                chronologicalGranularity: "GDC.time.date",
            },
            {
                ref: {
                    identifier: "DATE3.dayOfMonth",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE3.dayOfMonth",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE3.dayOfMonth",
                dateType: "GDC.time.day_in_month",
                label: "day_in_month",
                valuesPreview: "day_in_month_preview",
                chronologicalGranularity: "GDC.time.date",
            },
            {
                ref: {
                    identifier: "DATE3.dayOfYear",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE3.dayOfYear",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE3.dayOfYear",
                dateType: "GDC.time.day_in_year",
                label: "day_in_year",
                valuesPreview: "day_in_year_preview",
                chronologicalGranularity: "GDC.time.date",
            },
            {
                ref: {
                    identifier: "DATE3.weekOfYear",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE3.weekOfYear",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE3.weekOfYear",
                dateType: "GDC.time.week_in_year",
                label: "week_in_year",
                valuesPreview: "week_in_year_preview",
                chronologicalGranularity: "GDC.time.week_us",
            },
            {
                ref: {
                    identifier: "DATE3.monthOfYear",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE3.monthOfYear",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE3.monthOfYear",
                dateType: "GDC.time.month_in_year",
                label: "month_in_year",
                valuesPreview: "month_in_year_preview",
                chronologicalGranularity: "GDC.time.month",
            },
            {
                ref: {
                    identifier: "DATE3.quarterOfYear",
                    type: "attribute",
                },
                dfRef: {
                    identifier: "DATE3.quarterOfYear",
                    type: "displayForm",
                },
                cacheIdentifier: "DATE3.quarterOfYear",
                dateType: "GDC.time.quarter_in_year",
                label: "quarter_in_year",
                valuesPreview: "quarter_in_year_preview",
                chronologicalGranularity: "GDC.time.quarter",
            },
        ],
    },
];
