// (C) 2019 GoodData Corporation
import { GdcExtendedDateFilters } from "../GdcExtendedDateFilters";

export const absoluteForm: GdcExtendedDateFilters.IAbsoluteDateFilterForm = {
    from: "2000-01-01",
    localIdentifier: "foo",
    to: "2020-01-01",
    type: "absoluteForm",
    name: "Absolute Form",
    visible: true,
};

export const absolutePreset: GdcExtendedDateFilters.IAbsoluteDateFilterPreset = {
    from: "2000-01-01",
    localIdentifier: "foo",
    name: "bar",
    to: "2020-01-01",
    type: "absolutePreset",
    visible: true,
};

export const relativeForm: GdcExtendedDateFilters.IRelativeDateFilterForm = {
    from: -2,
    granularity: "GDC.time.date",
    availableGranularities: ["GDC.time.date"],
    localIdentifier: "foo",
    name: "bar",
    to: 0,
    type: "relativeForm",
    visible: true,
};

export const relativePreset: GdcExtendedDateFilters.IRelativeDateFilterPreset = {
    from: -2,
    granularity: "GDC.time.date",
    localIdentifier: "foo",
    name: "bar",
    to: 0,
    type: "relativePreset",
    visible: true,
};

export const allTimeFilter: GdcExtendedDateFilters.IAllTimeDateFilter = {
    localIdentifier: "foo",
    type: "allTime",
    name: "All time",
    visible: true,
};
