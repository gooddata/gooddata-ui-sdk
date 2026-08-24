// (C) 2019-2026 GoodData Corporation

import {
    type IAbsoluteDateFilterPreset,
    type IAllTimeDateFilterOption,
    type IRelativeDateFilterPreset,
} from "@gooddata/sdk-model";

import { type IUiAbsoluteDateFilterForm } from "../../interfaces/index.js";

export const allTimeFilter: IAllTimeDateFilterOption = {
    localIdentifier: "ALL_TIME",
    type: "allTime",
    name: "",
    visible: true,
};

export const absoluteFormFilter: IUiAbsoluteDateFilterForm = {
    localIdentifier: "ABSOLUTE_FORM",
    type: "absoluteForm",
    from: "2019-01-01",
    to: "2019-02-01",
    name: "Static range",
    visible: true,
};

export const absoluteFormFilterOneDay: IUiAbsoluteDateFilterForm = {
    localIdentifier: "ABSOLUTE_FORM",
    type: "absoluteForm",
    from: "2019-01-01",
    to: "2019-01-01",
    name: "Static range",
    visible: true,
};

export const absoluteFormFilterWithTime: IUiAbsoluteDateFilterForm = {
    localIdentifier: "ABSOLUTE_FORM",
    type: "absoluteForm",
    from: "2019-01-01 1:00",
    to: "2019-02-01 16:55",
    name: "Static range",
    visible: true,
};

export const absoluteFormFilterWithTimeInOneDay: IUiAbsoluteDateFilterForm = {
    localIdentifier: "ABSOLUTE_FORM",
    type: "absoluteForm",
    from: "2019-01-01 00:00",
    to: "2019-01-01 23:59",
    name: "Static range",
    visible: true,
};

export const absoluteFormFilterWithSecondsInOneDay: IUiAbsoluteDateFilterForm = {
    localIdentifier: "ABSOLUTE_FORM",
    type: "absoluteForm",
    from: "2019-01-01 22:11:00",
    to: "2019-01-01 22:31:05",
    name: "Static range",
    visible: true,
};

export const absoluteFormFilterWithSecondsOnlyChangeInOneDay: IUiAbsoluteDateFilterForm = {
    localIdentifier: "ABSOLUTE_FORM",
    type: "absoluteForm",
    from: "2019-01-01 00:00:30",
    to: "2019-01-01 23:59:40",
    name: "Static range",
    visible: true,
};

export const absoluteFormFilterWithWholeDaySeconds: IUiAbsoluteDateFilterForm = {
    localIdentifier: "ABSOLUTE_FORM",
    type: "absoluteForm",
    from: "2019-01-01 00:00:00",
    to: "2019-01-01 23:59:59",
    name: "Static range",
    visible: true,
};

export const absoluteFormFilterWithSecondsWithinMoreDays: IUiAbsoluteDateFilterForm = {
    localIdentifier: "ABSOLUTE_FORM",
    type: "absoluteForm",
    from: "2019-01-01 22:11:00",
    to: "2019-01-04 22:31:05",
    name: "Static range",
    visible: true,
};

export const absoluteFormFilterWithTimeWithinMoreDays: IUiAbsoluteDateFilterForm = {
    localIdentifier: "ABSOLUTE_FORM",
    type: "absoluteForm",
    from: "2019-01-01 00:00",
    to: "2019-01-04 23:59",
    name: "Static range",
    visible: true,
};

export const absolutePresetFilter: IAbsoluteDateFilterPreset = {
    localIdentifier: "ABSOLUTE_PRESET_FOO",
    type: "absolutePreset",
    from: "2019-01-01",
    to: "2019-02-01",
    name: "foo",
    visible: true,
};

export const relativePresetFilter: IRelativeDateFilterPreset = {
    localIdentifier: "RELATIVE_PRESET_FOO",
    type: "relativePreset",
    from: -5,
    to: 5,
    granularity: "GDC.time.date",
    name: "foo",
    visible: true,
};
