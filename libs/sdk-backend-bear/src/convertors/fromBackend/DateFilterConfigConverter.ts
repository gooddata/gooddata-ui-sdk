// (C) 2019-2022 GoodData Corporation
import { GdcExtendedDateFilters } from "@gooddata/api-model-bear";
import {
    uriRef,
    IAbsoluteDateFilterPreset,
    IRelativeDateFilterPreset,
    IAbsoluteDateFilterForm,
    IRelativeDateFilterForm,
    IAllTimeDateFilterOption,
    IDateFilterConfig,
} from "@gooddata/sdk-model";

const convertAllTime = (allTime: GdcExtendedDateFilters.IDateFilterAllTime): IAllTimeDateFilterOption => {
    return {
        type: "allTime",
        ...allTime,
    };
};

const convertAbsoluteForm = (
    absoluteForm: GdcExtendedDateFilters.IDateFilterAbsoluteForm,
): IAbsoluteDateFilterForm => {
    return {
        type: "absoluteForm",
        ...absoluteForm,
    };
};

const convertRelativeForm = (
    relativeForm: GdcExtendedDateFilters.IDateFilterRelativeForm,
): IRelativeDateFilterForm => {
    const { granularities: availableGranularities, ...other } = relativeForm;
    return {
        type: "relativeForm",
        availableGranularities,
        ...other,
    };
};

const convertAbsolutePreset = (
    absolutePreset: GdcExtendedDateFilters.IDateFilterAbsolutePreset,
): IAbsoluteDateFilterPreset => {
    return {
        type: "absolutePreset",
        ...absolutePreset,
    };
};

const convertRelativePreset = (
    relativePreset: GdcExtendedDateFilters.IDateFilterRelativePreset,
): IRelativeDateFilterPreset => {
    return {
        type: "relativePreset",
        ...relativePreset,
    };
};

export const convertDateFilterConfig = (
    dateFilterConfig: GdcExtendedDateFilters.IWrappedDateFilterConfig,
): IDateFilterConfig => {
    const {
        dateFilterConfig: {
            content: {
                selectedOption,
                allTime,
                absoluteForm,
                relativeForm,
                absolutePresets,
                relativePresets,
            },
            meta,
        },
    } = dateFilterConfig;
    return {
        ref: uriRef(meta.uri!),
        selectedOption,
        allTime: allTime && convertAllTime(allTime),
        absoluteForm: absoluteForm && convertAbsoluteForm(absoluteForm),
        relativeForm: relativeForm && convertRelativeForm(relativeForm),
        absolutePresets: absolutePresets && absolutePresets.map(convertAbsolutePreset),
        relativePresets: relativePresets && relativePresets.map(convertRelativePreset),
    };
};
