// (C) 2021-2022 GoodData Corporation
import groupBy from "lodash/groupBy.js";
import isEmpty from "lodash/isEmpty.js";
import {
    DateGranularity,
    DateFilterGranularity,
    IDateFilterOption,
    IRelativeDateFilterPreset,
    IRelativeDateFilterForm,
    IDateFilterConfig,
    ISettings,
} from "@gooddata/sdk-model";
import includes from "lodash/includes.js";
import { defaultDateFilterConfig } from "./defaultConfig.js";

const isNotWeekGranularity = (granularity: DateFilterGranularity) => granularity !== DateGranularity.week;
const isNotWeekPreset = (preset: IRelativeDateFilterPreset) => preset.granularity !== DateGranularity.week;

function getDuplicateIdentifiers(options: IDateFilterOption[]): string[] {
    const groups = groupBy(options, (filter: IDateFilterOption) => filter.localIdentifier);
    const duplicates = Object.keys(groups).filter((localIdentifier) => groups[localIdentifier].length > 1);

    if (duplicates.length) {
        console.warn(
            `There were duplicate localIdentifiers in the date filter config: ${duplicates.join(",")}`,
        );
    }
    return duplicates;
}

function isFilterVisible(filter?: IDateFilterOption): boolean {
    return filter?.visible ?? false;
}

function containsVisibleFilter(filters?: IDateFilterOption[]): boolean {
    return filters?.some(isFilterVisible) ?? false;
}

function isRelativeFormVisible(filter?: IRelativeDateFilterForm): boolean {
    return isFilterVisible(filter) && !isEmpty(filter?.availableGranularities ?? []);
}

function isAnyFilterVisible(config: IDateFilterConfig): boolean {
    return (
        isFilterVisible(config.allTime) ||
        isFilterVisible(config.absoluteForm) ||
        isRelativeFormVisible(config.relativeForm) ||
        containsVisibleFilter(config.absolutePresets) ||
        containsVisibleFilter(config.relativePresets)
    );
}

function getAllOptionsFlattened(config: IDateFilterConfig) {
    const allPresets = [
        config.allTime,
        config.absoluteForm,
        config.relativeForm,
        ...(config.absolutePresets || []),
        ...(config.relativePresets || []),
    ];

    return allPresets.filter((item) => item !== undefined) as IDateFilterOption[];
}

function isSelectedOptionValid(config: IDateFilterConfig): boolean {
    // only presets and all time are allowed for now (RAIL-1598), so look only there
    const candidateOptions = [
        config.allTime,
        ...(config.absolutePresets || []),
        ...(config.relativePresets || []),
    ];

    const matchingOption = candidateOptions.find(
        (option) => option?.localIdentifier === config.selectedOption,
    );

    return matchingOption ? matchingOption.visible : false;
}

//
// Public functions
//

/**
 * Validation result.
 *
 * @public
 */
export type DateFilterConfigValidationResult =
    | "Valid"
    | "NoVisibleOptions"
    | "ConflictingIdentifiers"
    | "SelectedOptionInvalid";

/**
 * Validates the provided date filter config. The config has a lot of options and not all of them can be
 * covered by the typing.
 *
 * @param config - config to validate
 * @param shouldCheckSelectedOption - indicate whether validation should check that a valid option is selected
 */
export function validateDateFilterConfig(
    config: IDateFilterConfig,
    shouldCheckSelectedOption: boolean = true,
): DateFilterConfigValidationResult {
    if (!isAnyFilterVisible(config)) {
        return "NoVisibleOptions";
    }

    const allOptions = getAllOptionsFlattened(config);
    const duplicateIdentifiers = getDuplicateIdentifiers(allOptions);

    if (duplicateIdentifiers.length) {
        return "ConflictingIdentifiers";
    }

    return !shouldCheckSelectedOption || isSelectedOptionValid(config) ? "Valid" : "SelectedOptionInvalid";
}

/**
 * Filters out all weekly presets from the filter config.
 */
export function filterOutWeeks(config: IDateFilterConfig): IDateFilterConfig {
    const { relativeForm, relativePresets } = config;
    const relativeFormProp = relativeForm
        ? {
              relativeForm: {
                  ...relativeForm,
                  availableGranularities:
                      relativeForm?.availableGranularities?.filter(isNotWeekGranularity) ?? [],
              },
          }
        : {};

    return {
        ...config,
        ...relativeFormProp,
        relativePresets: relativePresets?.filter(isNotWeekPreset),
    };
}

const FallbackToDefault: DateFilterConfigValidationResult[] = ["ConflictingIdentifiers", "NoVisibleOptions"];

/**
 * Given the date filter config loaded from backend and the settings, this function will perform validation
 * of the config and if needed also cleanup of invalid/disabled presets.
 */
export function getValidDateFilterConfig(
    config: IDateFilterConfig,
    settings: ISettings,
): [IDateFilterConfig, DateFilterConfigValidationResult] {
    const configValidation = validateDateFilterConfig(config);
    const validConfig = !includes(FallbackToDefault, configValidation) ? config : defaultDateFilterConfig;

    const dateFilterConfig = !settings.enableWeekFilters ? filterOutWeeks(validConfig) : validConfig;

    return [dateFilterConfig, configValidation];
}
