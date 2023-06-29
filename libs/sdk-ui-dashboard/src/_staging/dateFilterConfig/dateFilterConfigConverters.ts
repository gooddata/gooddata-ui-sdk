// (C) 2019-2022 GoodData Corporation
import groupBy from "lodash/groupBy.js";
import isEmpty from "lodash/isEmpty.js";
import min from "lodash/min.js";
import max from "lodash/max.js";
import format from "date-fns/format/index.js";
import startOfDay from "date-fns/startOfDay/index.js";
import subMonths from "date-fns/subMonths/index.js";
import {
    IAbsoluteDateFilterPreset,
    IRelativeDateFilterPreset,
    IAbsoluteDateFilterForm,
    IRelativeDateFilterForm,
    IAllTimeDateFilterOption,
    IDateFilterConfig,
} from "@gooddata/sdk-model";
import {
    IUiAbsoluteDateFilterForm,
    IUiRelativeDateFilterForm,
    DateFilterRelativeOptionGroup,
    IDateFilterOptionsByType,
    RelativeDateFilterOption,
    AbsoluteDateFilterOption,
} from "@gooddata/sdk-ui-filters";

// TODO: this import was coming from internal/esm and was wrecking tests
const PLATFORM_DATE_FORMAT = "yyyy-MM-dd";

/**
 * Converts date filter config - as stored on the backend - into the date filter options that are aimed for
 * consumption by the actual date filtering view components.
 *
 * @param config - date filter config from backend
 */
export function convertDateFilterConfigToDateFilterOptions(
    config: IDateFilterConfig,
): IDateFilterOptionsByType {
    const allTime = convertAllTime(config.allTime);
    const absoluteForm = convertAbsoluteForm(config.absoluteForm);
    const relativeForm = convertRelativeForm(config.relativeForm);
    const absolutePreset = convertAbsolutePresets(config.absolutePresets);
    const relativePreset = convertRelativePresets(config.relativePresets);

    return removeEmptyKeysFromDateFilterOptions({
        allTime,
        absoluteForm,
        absolutePreset,
        relativeForm,
        relativePreset,
    });
}

function convertAllTime(filter: IAllTimeDateFilterOption | undefined): IAllTimeDateFilterOption | undefined {
    return (
        filter && {
            ...filter,
            type: "allTime",
        }
    );
}

function convertAbsoluteForm(
    filter: IAbsoluteDateFilterForm | undefined,
): IUiAbsoluteDateFilterForm | undefined {
    return (
        filter && {
            ...filter,
            from: format(startOfDay(subMonths(new Date(), 1)), PLATFORM_DATE_FORMAT),
            to: format(startOfDay(new Date()), PLATFORM_DATE_FORMAT),
            type: "absoluteForm",
        }
    );
}

function convertRelativeForm(
    filter: IRelativeDateFilterForm | undefined,
): IUiRelativeDateFilterForm | undefined {
    return (
        filter && {
            from: undefined,
            // we order the granularities anyway, this lets the user to config the default
            granularity: filter.availableGranularities[0],
            localIdentifier: filter.localIdentifier,
            name: filter.name,
            to: undefined,
            type: "relativeForm",
            visible: filter.visible,
        }
    );
}

function convertAbsolutePresets(
    filters: IAbsoluteDateFilterPreset[] | undefined,
): IAbsoluteDateFilterPreset[] | undefined {
    return filters?.map(
        (preset): IAbsoluteDateFilterPreset =>
            sanitizeDateFilterOption({
                ...preset,
                type: "absolutePreset",
            }),
    );
}

function convertRelativePresets(
    filters: IRelativeDateFilterPreset[] | undefined,
): DateFilterRelativeOptionGroup | undefined {
    return (
        filters &&
        groupBy(
            filters.map(
                (preset): IRelativeDateFilterPreset =>
                    sanitizeDateFilterOption({
                        ...preset,
                        type: "relativePreset",
                    }),
            ),
            (preset) => preset.granularity,
        )
    );
}

function removeEmptyKeysFromDateFilterOptions(
    dateFilterOptions: IDateFilterOptionsByType,
): IDateFilterOptionsByType {
    const { absoluteForm, absolutePreset, allTime, relativeForm, relativePreset } = dateFilterOptions;
    return {
        ...(allTime && { allTime }),
        ...(absoluteForm && { absoluteForm }),
        ...(!isEmpty(absolutePreset) && { absolutePreset }),
        ...(relativeForm && { relativeForm }),
        ...(!isEmpty(relativePreset) && { relativePreset }),
    };
}

function sanitizeDateFilterOption<
    T extends
        | RelativeDateFilterOption
        | AbsoluteDateFilterOption
        | IAbsoluteDateFilterPreset
        | IRelativeDateFilterPreset,
>(option: T): T {
    return {
        ...option,
        from: min([option.from, option.to]),
        to: max([option.from, option.to]),
    };
}
