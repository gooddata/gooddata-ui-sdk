// (C) 2021-2026 GoodData Corporation

import { groupBy, isEmpty } from "lodash-es";

import {
    type DateFilterGranularity,
    type IDateFilterConfig,
    type IDateFilterOption,
    type IRelativeDateFilterForm,
    type ISettings,
} from "@gooddata/sdk-model";

import { defaultDateFilterConfig } from "./defaultConfig.js";

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

export const FallbackToDefault: DateFilterConfigValidationResult[] = [
    "ConflictingIdentifiers",
    "NoVisibleOptions",
];

const conditionallyStripToDateFilters = (
    config: IDateFilterConfig,
    enableToDateFilters: boolean,
): IDateFilterConfig => {
    if (enableToDateFilters) {
        return config;
    }

    return {
        ...config,
        relativePresets: config.relativePresets?.filter((preset) => !preset.boundedFilter) ?? [],
    };
};

const FISCAL_GRANULARITIES: DateFilterGranularity[] = [
    "GDC.time.fiscal_year",
    "GDC.time.fiscal_quarter",
    "GDC.time.fiscal_month",
];

export function configHasFiscalPresets(config: IDateFilterConfig | undefined): boolean {
    return config?.relativePresets?.some((p) => FISCAL_GRANULARITIES.includes(p.granularity)) ?? false;
}

const getFiscalPresetsFromDefault = () => {
    return (
        defaultDateFilterConfig.relativePresets?.filter((preset) =>
            FISCAL_GRANULARITIES.includes(preset.granularity),
        ) ?? []
    );
};

const getFiscalGranularitiesFromDefault = () => {
    return (
        defaultDateFilterConfig.relativeForm?.availableGranularities.filter((g) =>
            FISCAL_GRANULARITIES.includes(g),
        ) ?? []
    );
};

const conditionallyHandleFiscalFilters = (
    config: IDateFilterConfig,
    enableFiscalCalendars: boolean,
): IDateFilterConfig => {
    if (!enableFiscalCalendars) {
        return {
            ...config,
            relativePresets:
                config.relativePresets?.filter(
                    (preset) => !FISCAL_GRANULARITIES.includes(preset.granularity),
                ) ?? [],
            relativeForm: config.relativeForm
                ? {
                      ...config.relativeForm,
                      availableGranularities: config.relativeForm.availableGranularities.filter(
                          (g) => !FISCAL_GRANULARITIES.includes(g),
                      ),
                  }
                : undefined,
        };
    }

    const existingFiscalPresets =
        config.relativePresets?.filter((preset) => FISCAL_GRANULARITIES.includes(preset.granularity)) ?? [];

    const existingFiscalGranularities =
        config.relativeForm?.availableGranularities.filter((g) => FISCAL_GRANULARITIES.includes(g)) ?? [];

    if (existingFiscalPresets.length > 0 && existingFiscalGranularities.length > 0) {
        return config;
    }

    const fiscalPresetsToAdd = existingFiscalPresets.length === 0 ? getFiscalPresetsFromDefault() : [];
    const fiscalGranularitiesToAdd =
        existingFiscalGranularities.length === 0 ? getFiscalGranularitiesFromDefault() : [];

    return {
        ...config,
        relativePresets: [...(config.relativePresets ?? []), ...fiscalPresetsToAdd],
        relativeForm: config.relativeForm
            ? {
                  ...config.relativeForm,
                  availableGranularities: [
                      ...config.relativeForm.availableGranularities,
                      ...fiscalGranularitiesToAdd,
                  ],
              }
            : undefined,
    };
};

/**
 * Given the date filter config loaded from backend and the settings, this function will perform validation
 * of the config and if needed also cleanup of invalid/disabled presets.
 */
export function getValidDateFilterConfig(
    config: IDateFilterConfig,
    settings: ISettings,
): [IDateFilterConfig, DateFilterConfigValidationResult] {
    const configValidation = validateDateFilterConfig(config);
    let validConfig = FallbackToDefault.includes(configValidation) ? defaultDateFilterConfig : config;

    validConfig = conditionallyStripToDateFilters(validConfig, settings.enableToDateFilters ?? true);
    validConfig = conditionallyHandleFiscalFilters(validConfig, settings.enableFiscalCalendars ?? true);

    return [validConfig, configValidation];
}
