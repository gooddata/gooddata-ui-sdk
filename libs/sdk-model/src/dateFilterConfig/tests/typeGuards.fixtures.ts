// (C) 2019-2020 GoodData Corporation
import {
    IAllTimeDateFilterOption,
    IAbsoluteDateFilterForm,
    IAbsoluteDateFilterPreset,
    IRelativeDateFilterForm,
    IRelativeDateFilterPreset,
} from "../index.js";

export const allTimeDateFilter: IAllTimeDateFilterOption = {
    localIdentifier: "allTimeDateFilter",
    name: "allTimeDateFilter",
    type: "allTime",
    visible: true,
};

export const absoluteDateFilterForm: IAbsoluteDateFilterForm = {
    localIdentifier: "absoluteDateFilterForm",
    name: "absoluteDateFilterForm",
    type: "absoluteForm",
    visible: true,
};

export const absoluteDateFilterPreset: IAbsoluteDateFilterPreset = {
    localIdentifier: "absoluteDateFilterForm",
    name: "absoluteDateFilterForm",
    type: "absolutePreset",
    visible: true,
    from: "2020-01-01",
    to: "2020-05-05",
};

export const relativeDateFilterForm: IRelativeDateFilterForm = {
    localIdentifier: "relativeDateFilterForm",
    name: "relativeDateFilterForm",
    type: "relativeForm",
    visible: true,
    availableGranularities: ["GDC.time.month"],
};

export const relativeDateFilterPreset: IRelativeDateFilterPreset = {
    localIdentifier: "relativeDateFilterForm",
    name: "relativeDateFilterForm",
    type: "relativePreset",
    visible: true,
    from: -12,
    to: -1,
    granularity: "GDC.time.year",
};
