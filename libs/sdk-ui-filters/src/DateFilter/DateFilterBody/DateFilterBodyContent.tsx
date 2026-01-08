// (C) 2025-2026 GoodData Corporation

import { useState } from "react";

import { isEmpty } from "lodash-es";

import { type DateFilterGranularity, type IActiveCalendars, type WeekStart } from "@gooddata/sdk-model";

import { AbsolutePresetFilterItems } from "./AbsolutePresetFilterItems.js";
import { CalendarTypeTabs } from "./CalendarTypeTabs.js";
import { RelativePresetFilterItems } from "./RelativePresetFilterItems.js";
import { type DateFilterRoute } from "./types.js";
import { AbsoluteDateFilterFormSection } from "../AbsoluteDateFilterForm/AbsoluteDateFilterFormSection.js";
import { AllTimeFilterSection } from "../AllTime/AllTimeFilterSection.js";
import {
    type DateFilterOption,
    type IDateFilterOptionsByType,
    type IExtendedDateFilterErrors,
    type IUiAbsoluteDateFilterForm,
    type IUiRelativeDateFilterForm,
} from "../interfaces/index.js";
import { RelativeDateFilterFormSection } from "../RelativeDateFilterForm/RelativeDateFilterFormSection.js";
import {
    type CalendarTabType,
    filterFiscalGranularities,
    filterFiscalPresets,
    filterStandardGranularities,
    filterStandardPresets,
    getDefaultCalendarTab,
    getFiscalTabsConfig,
} from "../utils/presetFilterUtils.js";

const ITEM_CLASS_MOBILE = "gd-date-filter-item-mobile";

interface IDateFilterBodyContentProps {
    filterOptions: IDateFilterOptionsByType;
    selectedFilterOption: DateFilterOption;
    isMobile: boolean;
    route: DateFilterRoute;
    dateFormat: string;
    isTimeForAbsoluteRangeEnabled: boolean;
    weekStart: WeekStart;
    availableGranularities: DateFilterGranularity[];
    errors?: IExtendedDateFilterErrors;
    withoutApply?: boolean;
    onSelectedFilterOptionChange: (option: DateFilterOption) => void;
    closeDropdown: () => void;
    changeRoute: (newRoute?: DateFilterRoute) => void;
    onApplyClick: () => void;
    /**
     * Active calendars configuration from workspace settings.
     */
    activeCalendars?: IActiveCalendars;
}

export function DateFilterBodyContent({
    filterOptions,
    selectedFilterOption,
    isMobile,
    route,
    errors,
    dateFormat,
    isTimeForAbsoluteRangeEnabled,
    weekStart,
    availableGranularities,
    withoutApply,
    closeDropdown,
    changeRoute,
    onApplyClick,
    onSelectedFilterOptionChange,
    activeCalendars,
}: IDateFilterBodyContentProps) {
    const { showTabs } = getFiscalTabsConfig(filterOptions.relativePreset, activeCalendars);

    const [selectedTab, setSelectedTab] = useState<CalendarTabType>(() =>
        getDefaultCalendarTab(activeCalendars, selectedFilterOption),
    );

    const filteredRelativePreset = showTabs
        ? selectedTab === "standard"
            ? filterStandardPresets(filterOptions.relativePreset!)
            : filterFiscalPresets(filterOptions.relativePreset!)
        : filterOptions.relativePreset;

    const filteredAvailableGranularities = showTabs
        ? selectedTab === "standard"
            ? filterStandardGranularities(availableGranularities)
            : filterFiscalGranularities(availableGranularities)
        : availableGranularities;

    return (
        <>
            {showTabs ? <CalendarTypeTabs selectedTab={selectedTab} onTabSelect={setSelectedTab} /> : null}
            <AllTimeFilterSection
                filterOptions={filterOptions}
                selectedFilterOption={selectedFilterOption}
                onSelectedFilterOptionChange={onSelectedFilterOptionChange}
                isMobile={isMobile}
            />
            <AbsoluteDateFilterFormSection
                filterOptions={filterOptions}
                route={route}
                closeDropdown={closeDropdown}
                onApplyClick={onApplyClick}
                changeRoute={changeRoute}
                dateFormat={dateFormat}
                onSelectedFilterOptionChange={onSelectedFilterOptionChange}
                selectedFilterOption={selectedFilterOption as IUiAbsoluteDateFilterForm}
                isMobile={isMobile}
                isTimeForAbsoluteRangeEnabled={isTimeForAbsoluteRangeEnabled}
                weekStart={weekStart}
                withoutApply={withoutApply}
            />
            {isEmpty(filteredAvailableGranularities) ? null : (
                <RelativeDateFilterFormSection
                    filterOptions={filterOptions}
                    onSelectedFilterOptionChange={onSelectedFilterOptionChange}
                    selectedFilterOption={selectedFilterOption as IUiRelativeDateFilterForm}
                    availableGranularities={filteredAvailableGranularities}
                    isMobile={isMobile}
                    changeRoute={changeRoute}
                    route={route}
                    errors={errors || undefined}
                    onApplyClick={onApplyClick}
                    closeDropdown={closeDropdown}
                    withoutApply={withoutApply}
                />
            )}
            {filterOptions.absolutePreset && filterOptions.absolutePreset.length > 0 ? (
                <AbsolutePresetFilterItems
                    dateFormat={dateFormat}
                    filterOptions={filterOptions.absolutePreset}
                    selectedFilterOption={selectedFilterOption}
                    onSelectedFilterOptionChange={onSelectedFilterOptionChange}
                    className={isMobile ? ITEM_CLASS_MOBILE : undefined}
                />
            ) : null}
            {filteredRelativePreset ? (
                <RelativePresetFilterItems
                    dateFormat={dateFormat}
                    filterOption={filteredRelativePreset}
                    selectedFilterOption={selectedFilterOption}
                    onSelectedFilterOptionChange={onSelectedFilterOptionChange}
                    className={isMobile ? ITEM_CLASS_MOBILE : undefined}
                />
            ) : null}
        </>
    );
}
