// (C) 2019-2021 GoodData Corporation
import {
    IAllTimeDateFilterOption,
    IAbsoluteDateFilterForm,
    IAbsoluteDateFilterPreset,
    IRelativeDateFilterPreset,
    IRelativeDateFilterForm,
} from "@gooddata/sdk-backend-spi";

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

export const relativeForm: IRelativeDateFilterForm = {
    type: "relativeForm",
    availableGranularities: ["GDC.time.year", "GDC.time.month"],
    localIdentifier: "RELATIVE_FORM",
    name: "",
    visible: true,
};
