// (C) 2019-2022 GoodData Corporation

import {
    IAbsoluteDateFilterPreset,
    IRelativeDateFilterPreset,
    IAllTimeDateFilterOption,
} from "@gooddata/sdk-model";
import { IUiAbsoluteDateFilterForm } from "../../../interfaces";

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
