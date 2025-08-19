// (C) 2024-2025 GoodData Corporation

import {
    DateFilterGranularity,
    DateString,
    IAbsoluteDateFilterForm,
    IAbsoluteDateFilterPreset,
    IAllTimeDateFilterOption,
    IDateFilterConfig,
    IRelativeDateFilterForm,
    IRelativeDateFilterPreset,
    idRef,
    isDateFilterGranularity,
} from "@gooddata/sdk-model";

export const DefaultDateFilterConfig: IDateFilterConfig = {
    ref: idRef("defaultDateFilterProjectConfig"),
    selectedOption: "THIS_MONTH",
    allTime: {
        localIdentifier: "ALL_TIME",
        type: "allTime",
        name: "",
        visible: true,
    },
    absoluteForm: {
        localIdentifier: "ABSOLUTE_FORM",
        type: "absoluteForm",
        name: "",
        visible: true,
    },
    relativeForm: {
        type: "relativeForm",
        // month has to be the first as it should be the default selected option
        availableGranularities: [
            "GDC.time.month",
            "GDC.time.minute",
            "GDC.time.hour",
            "GDC.time.date",
            "GDC.time.week_us",
            "GDC.time.quarter",
            "GDC.time.year",
        ],
        localIdentifier: "RELATIVE_FORM",
        name: "",
        visible: true,
    },
    relativePresets: [
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
        {
            from: 0,
            to: 0,
            granularity: "GDC.time.week_us",
            localIdentifier: "THIS_WEEK_TO_DATE",
            type: "relativePreset",
            visible: true,
            name: "",
            boundedFilter: {
                granularity: "GDC.time.date",
                to: 0,
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
        {
            from: 0,
            to: 0,
            granularity: "GDC.time.month",
            localIdentifier: "THIS_MONTH_TO_DATE",
            type: "relativePreset",
            visible: true,
            name: "",
            boundedFilter: {
                granularity: "GDC.time.date",
                to: 0,
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
        {
            from: 0,
            to: 0,
            granularity: "GDC.time.quarter",
            localIdentifier: "THIS_QUARTER_TO_DATE",
            type: "relativePreset",
            visible: true,
            name: "",
            boundedFilter: {
                granularity: "GDC.time.date",
                to: 0,
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
        {
            from: 0,
            to: 0,
            granularity: "GDC.time.year",
            localIdentifier: "THIS_YEAR_TO_DATE",
            type: "relativePreset",
            visible: true,
            name: "",
            boundedFilter: {
                granularity: "GDC.time.date",
                to: 0,
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
    absolutePresets: [],
};

export interface IWrappedDateFilterConfig {
    selectedOption: string;
    allTime?: IDateFilterBase;
    absoluteForm?: IDateFilterBase;
    relativeForm?: IDateFilterRelativeForm;
    absolutePresets?: IDateFilterAbsolutePreset[];
    relativePresets?: IDateFilterRelativePreset[];
}

interface IDateFilterBase {
    localIdentifier: string;
    name?: string;
    visible: boolean;
}

interface IDateFilterRelativePreset extends IDateFilterBase {
    from: number;
    to: number;
    granularity: DateFilterGranularity;
}

interface IDateFilterAbsolutePreset extends IDateFilterBase {
    from: DateString;
    to: DateString;
}

interface IDateFilterRelativeForm extends IDateFilterBase {
    granularities: DateFilterGranularity[];
}

const convertAllTime = (allTime: IDateFilterBase): IAllTimeDateFilterOption => {
    return {
        type: "allTime",
        ...allTime,
    };
};

const convertAbsoluteForm = (absoluteForm: IDateFilterBase): IAbsoluteDateFilterForm => {
    return {
        type: "absoluteForm",
        ...absoluteForm,
    };
};

const convertRelativeForm = (relativeForm: IDateFilterRelativeForm): IRelativeDateFilterForm => {
    const { granularities: availableGranularities, ...other } = relativeForm;

    if (!availableGranularities) {
        return DefaultDateFilterConfig.relativeForm!;
    }

    const validGranularities: DateFilterGranularity[] =
        availableGranularities.filter(isDateFilterGranularity);

    return {
        type: "relativeForm",
        availableGranularities: validGranularities,
        ...other,
    };
};

const convertAbsolutePreset = (absolutePreset: IDateFilterAbsolutePreset): IAbsoluteDateFilterPreset => {
    return {
        type: "absolutePreset",
        ...absolutePreset,
    };
};

const convertRelativePreset = (relativePreset: IDateFilterRelativePreset): IRelativeDateFilterPreset => {
    return {
        type: "relativePreset",
        ...relativePreset,
    };
};

export const convertDateFilterConfig = (
    dateFilterConfig: IWrappedDateFilterConfig | undefined,
): IDateFilterConfig => {
    if (!dateFilterConfig) {
        return DefaultDateFilterConfig;
    }

    const { selectedOption, allTime, absoluteForm, relativeForm, absolutePresets, relativePresets } =
        dateFilterConfig;

    return {
        ref: idRef("defaultDateFilterProjectConfig"),
        selectedOption,
        allTime: allTime && convertAllTime(allTime),
        absoluteForm: absoluteForm && convertAbsoluteForm(absoluteForm),
        relativeForm: relativeForm && convertRelativeForm(relativeForm),
        absolutePresets: absolutePresets?.map(convertAbsolutePreset),
        relativePresets: relativePresets?.map(convertRelativePreset),
    };
};
