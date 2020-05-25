// (C) 2019-2020 GoodData Corporation
import {
    IAllTimeDateFilter,
    IAbsoluteDateFilterForm,
    IAbsoluteDateFilterPreset,
    AbsoluteDateFilterOption,
    IRelativeDateFilterForm,
    IRelativeDateFilterPreset,
    RelativeDateFilterOption,
} from "../extendedDateFilters";

export const allTimeDateFilter: IAllTimeDateFilter = {
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
    from: "2020-01-01",
    to: "2020-05-05",
};

export const absoluteDateFilterPreset: IAbsoluteDateFilterPreset = {
    localIdentifier: "absoluteDateFilterForm",
    name: "absoluteDateFilterForm",
    type: "absolutePreset",
    visible: true,
    from: "2020-01-01",
    to: "2020-05-05",
};

export const absoluteDateFilterOption: AbsoluteDateFilterOption = absoluteDateFilterForm;

export const relativeDateFilterForm: IRelativeDateFilterForm = {
    localIdentifier: "relativeDateFilterForm",
    name: "relativeDateFilterForm",
    type: "relativeForm",
    visible: true,
    from: -12,
    to: -1,
    availableGranularities: ["GDC.time.month"],
    granularity: "GDC.time.month",
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

export const relativeDateFilterOption: RelativeDateFilterOption = relativeDateFilterForm;
