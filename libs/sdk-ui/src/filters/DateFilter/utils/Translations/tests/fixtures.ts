// (C) 2019 GoodData Corporation

import { ExtendedDateFilters } from "../../../interfaces/ExtendedDateFilters";

export const allTimeFilter: ExtendedDateFilters.IAllTimeDateFilter = {
    localIdentifier: "ALL_TIME",
    type: "allTime",
    name: "",
    visible: true,
};

export const absoluteFormFilter: ExtendedDateFilters.IAbsoluteDateFilterForm = {
    localIdentifier: "ABSOLUTE_FORM",
    type: "absoluteForm",
    from: "2019-01-01",
    to: "2019-02-01",
    name: "Static range",
    visible: true,
};

export const absoluteFormFilterOneDay: ExtendedDateFilters.IAbsoluteDateFilterForm = {
    localIdentifier: "ABSOLUTE_FORM",
    type: "absoluteForm",
    from: "2019-01-01",
    to: "2019-01-01",
    name: "Static range",
    visible: true,
};

export const absolutePresetFilter: ExtendedDateFilters.IAbsoluteDateFilterPreset = {
    localIdentifier: "ABSOLUTE_PRESET_FOO",
    type: "absolutePreset",
    from: "2019-01-01",
    to: "2019-02-01",
    name: "foo",
    visible: true,
};

export const relativePresetFilter: ExtendedDateFilters.IRelativeDateFilterPreset = {
    localIdentifier: "RELATIVE_PRESET_FOO",
    type: "relativePreset",
    from: -5,
    to: 5,
    granularity: "GDC.time.date",
    name: "foo",
    visible: true,
};
