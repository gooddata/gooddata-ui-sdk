// (C) 2022-2026 GoodData Corporation

import { useState } from "react";

import { FormattedMessage } from "react-intl";

import {
    type IActiveCalendars,
    type WeekStart,
    isAbsoluteDateFilterForm,
    isRelativeDateFilterForm,
} from "@gooddata/sdk-model";
import {
    type CalendarTabType,
    DateFilterHelpers,
    type DateFilterOption,
    type DateFilterRelativeOptionGroup,
    type IFiscalTabsConfig,
    type IUiRelativeDateFilterForm,
    ensureCompatibleGranularity,
    filterFiscalPresets,
    filterStandardPresets,
    getDefaultCalendarTab,
    getFilteredGranularities,
    getFiscalTabsConfig,
} from "@gooddata/sdk-ui-filters";

import { type IDecoratedDateDataset } from "../../../../models/decorated_date_dataset.js";
import { type IDateDatasetRefWithGranularities } from "../../../../typings/datasets.js";
import { DisableableFilterWrapper } from "../AdditionalFiltersSection/DisableableFilterWrapper.js";
import { type IDateFilterOption } from "../dateFilterOptionFactory.js";

import { DatePresetsDropdown } from "./DatePresetsDropdown.js";
import { ExcludeCurrentPeriod } from "./ExcludeCurrentPeriod.js";
import { RelativeDateRange } from "./RelativeDateRange.js";
import { StaticDateRange } from "./StaticDateRange.js";
import {
    useResetPresetWhenUnsupportedOneIsSelected,
    useResetRelativeRangeWhenUnsupportedOneIsSelected,
    useSupportedDateFilterPresets,
} from "./supportedPresetsHook.js";

/**
 * Filter presets based on which calendars are enabled (not by selected tab).
 * Used for the dropdown which handles tab-based filtering internally.
 */
function getFilteredCalendarPresets(
    presets: DateFilterRelativeOptionGroup,
    config: IFiscalTabsConfig,
): DateFilterRelativeOptionGroup {
    if (config.hasFiscal && !config.hasStandard) {
        return filterFiscalPresets(presets);
    }
    if (!config.hasFiscal && config.hasStandard) {
        return filterStandardPresets(presets);
    }
    return presets;
}

export interface IPresetsSectionProps {
    filter: IDateFilterOption;
    onChange: (filter: IDateFilterOption) => void;
    /**
     * Called after `onChange` for a change the user made, not for the automatic reset of a period the
     * date dataset does not support.
     */
    onEdit?: () => void;
    relativeDateFilterPresets: DateFilterRelativeOptionGroup;
    dateDataset: IDecoratedDateDataset;
    dateDatasetRefsWithGranularities: IDateDatasetRefWithGranularities[];
    dateFormat: string;
    isTimeForAbsoluteRangeEnabled: boolean;
    isSecondsForAbsoluteRangeEnabled?: boolean;
    isSecondsGranularityEnabled?: boolean;
    weekStart?: WeekStart;
    submitForm: () => void;
    isDisabled?: boolean;
    activeCalendars?: IActiveCalendars;
}

export function PresetsSection({
    filter,
    relativeDateFilterPresets,
    onChange,
    onEdit,
    dateDataset,
    dateDatasetRefsWithGranularities,
    dateFormat,
    isTimeForAbsoluteRangeEnabled,
    isSecondsForAbsoluteRangeEnabled,
    isSecondsGranularityEnabled = false,
    weekStart,
    submitForm,
    isDisabled,
    activeCalendars,
}: IPresetsSectionProps) {
    const { filterOption: currentFilterOption } = filter;
    const { supportedDateFilterPresets, supportedChronologicalGranularities } = useSupportedDateFilterPresets(
        relativeDateFilterPresets,
        dateDataset,
        dateDatasetRefsWithGranularities,
        isSecondsGranularityEnabled,
    );

    const fiscalTabsConfig = getFiscalTabsConfig(supportedDateFilterPresets, activeCalendars);

    const enabledCalendarPresets = getFilteredCalendarPresets(supportedDateFilterPresets, fiscalTabsConfig);

    const onUserChange = (option: IDateFilterOption) => {
        onChange(option);
        onEdit?.();
    };

    const [selectedTab, setSelectedTab] = useState<CalendarTabType>(() =>
        getDefaultCalendarTab(activeCalendars, currentFilterOption),
    );

    const handleTabChange = (newTab: CalendarTabType) => {
        setSelectedTab(newTab);

        // If relative form is currently displayed, correct its granularity for the new tab
        if (isRelativeDateFilterForm(currentFilterOption)) {
            const isFiscal = fiscalTabsConfig.showTabs && newTab === "fiscal";
            const newFilteredGranularities = getFilteredGranularities(
                supportedChronologicalGranularities,
                fiscalTabsConfig,
                newTab,
            );

            const correctedOption = ensureCompatibleGranularity(
                currentFilterOption as IUiRelativeDateFilterForm,
                newFilteredGranularities,
                isFiscal,
            );

            if (correctedOption !== currentFilterOption) {
                onUserChange({ filterOption: correctedOption, excludeCurrentPeriod: false });
            }
        }
    };

    const filteredGranularities = getFilteredGranularities(
        supportedChronologicalGranularities,
        fiscalTabsConfig,
        selectedTab,
    );

    useResetPresetWhenUnsupportedOneIsSelected(currentFilterOption, enabledCalendarPresets, onChange);
    useResetRelativeRangeWhenUnsupportedOneIsSelected(currentFilterOption, filteredGranularities, onChange);

    const displayDateRange = isAbsoluteDateFilterForm(currentFilterOption);
    const displayFloatingRange = isRelativeDateFilterForm(currentFilterOption);
    const displayExcludePeriod = DateFilterHelpers.canExcludeCurrentPeriod(currentFilterOption);

    const onPresetValueChange = (updatedFilter: DateFilterOption, excludeCurrentPeriod = false) => {
        onUserChange({ filterOption: updatedFilter, excludeCurrentPeriod });
    };

    const onPresetSelectionChange = (newlySelectedPreset: DateFilterOption) => {
        if (newlySelectedPreset.localIdentifier !== currentFilterOption.localIdentifier) {
            // If switching to relative form, ensure granularity is compatible
            if (isRelativeDateFilterForm(newlySelectedPreset)) {
                const isFiscal = fiscalTabsConfig.showTabs && selectedTab === "fiscal";
                const correctedOption = ensureCompatibleGranularity(
                    newlySelectedPreset as IUiRelativeDateFilterForm,
                    filteredGranularities,
                    isFiscal,
                );
                onUserChange({ filterOption: correctedOption, excludeCurrentPeriod: false });
            } else {
                onUserChange({ filterOption: newlySelectedPreset, excludeCurrentPeriod: false });
            }
        }
    };

    const onExcludePeriodChange = (excludeCurrentPeriod: boolean) => {
        onPresetValueChange(currentFilterOption, excludeCurrentPeriod);
    };

    return (
        <DisableableFilterWrapper
            isDisabled={isDisabled}
            className={"section adi-date-dropdown adi-date-preset-select s-preset-section"}
        >
            <label htmlFor="preset-dropdown">
                <FormattedMessage id="filter.date.period" />
            </label>
            <DatePresetsDropdown
                relativeDateFilterPresets={enabledCalendarPresets}
                selectedPreset={currentFilterOption}
                onChange={onPresetSelectionChange}
                dateFormat={dateFormat}
                selectedTab={selectedTab}
                onTabChange={handleTabChange}
                activeCalendars={activeCalendars}
            />
            {displayDateRange ? (
                <StaticDateRange
                    selectedFilter={currentFilterOption}
                    onChange={onPresetValueChange}
                    dateFormat={dateFormat}
                    isTimeEnabled={isTimeForAbsoluteRangeEnabled}
                    isSecondsEnabled={isSecondsForAbsoluteRangeEnabled}
                    weekStart={weekStart}
                    submitForm={submitForm}
                />
            ) : null}
            {displayFloatingRange ? (
                <RelativeDateRange
                    granularities={filteredGranularities}
                    selectedFilter={currentFilterOption}
                    onChange={onPresetValueChange}
                />
            ) : null}
            {displayExcludePeriod ? (
                <ExcludeCurrentPeriod selectedFilter={filter} onChange={onExcludePeriodChange} />
            ) : null}
        </DisableableFilterWrapper>
    );
}
