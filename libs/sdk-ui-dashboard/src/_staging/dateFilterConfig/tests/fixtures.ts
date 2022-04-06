// (C) 2019-2022 GoodData Corporation
import {
    IAbsoluteDateFilterPreset,
    IRelativeDateFilterPreset,
    IAbsoluteDateFilterForm,
    IRelativeDateFilterForm,
    IAllTimeDateFilterOption,
} from "@gooddata/sdk-model";

export const allTime: IAllTimeDateFilterOption = {
    type: "allTime",
    localIdentifier: "ALL_TIME",
    name: "",
    visible: true,
};

export const year2019: IAbsoluteDateFilterPreset = {
    type: "absolutePreset",
    from: "2019-01-01",
    localIdentifier: "YEAR_2019",
    name: "",
    to: "2019-12-31",
    visible: true,
};

export const absoluteForm: IAbsoluteDateFilterForm = {
    type: "absoluteForm",
    localIdentifier: "ABSOLUTE_FORM",
    name: "",
    visible: true,
};

export const lastMonth: IRelativeDateFilterPreset = {
    type: "relativePreset",
    from: -1,
    to: -1,
    granularity: "GDC.time.month",
    localIdentifier: "LAST_MONTH",
    name: "",
    visible: true,
};

export const lastYear: IRelativeDateFilterPreset = {
    type: "relativePreset",
    from: -1,
    to: -1,
    granularity: "GDC.time.year",
    localIdentifier: "LAST_YEAR",
    name: "",
    visible: true,
};

export const last30days: IRelativeDateFilterPreset = {
    from: -29,
    to: 0,
    granularity: "GDC.time.date",
    type: "relativePreset",
    localIdentifier: "LAST_30_DAYS",
    name: "",
    visible: true,
};

export const relativeForm: IRelativeDateFilterForm = {
    type: "relativeForm",
    availableGranularities: ["GDC.time.year", "GDC.time.month"],
    localIdentifier: "RELATIVE_FORM",
    name: "",
    visible: true,
};
