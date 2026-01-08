// (C) 2025-2026 GoodData Corporation

import { useState } from "react";

import { isEmpty } from "lodash-es";
import { useIntl } from "react-intl";

import { type DateFilterGranularity, type IActiveCalendars, type WeekStart } from "@gooddata/sdk-model";

import { DateFilterBodyContent } from "./DateFilterBodyContent.js";
import { DateFilterBodyContentFiltered } from "./DateFilterBodyContentFiltered.js";
import { DateFilterHeader } from "./DateFilterHeader.js";
import { type DateFilterRoute } from "./types.js";
import { AbsoluteDateFilterFormSection } from "../AbsoluteDateFilterForm/AbsoluteDateFilterFormSection.js";
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
    filterFiscalPresets,
    filterStandardPresets,
    getDefaultCalendarTab,
    getFiscalTabsConfig,
} from "../utils/presetFilterUtils.js";

interface IDateFilterBodyMobileContentProps {
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
    onBack: (newRoute?: DateFilterRoute) => void;
    onApplyClick: () => void;
    isRedesigned?: boolean;
    /**
     * Active calendars configuration from workspace settings.
     */
    activeCalendars?: IActiveCalendars;
}

export function DateFilterBodyMobileContent({
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
    onBack,
    onApplyClick,
    onSelectedFilterOptionChange,
    isRedesigned = false,
    activeCalendars,
}: IDateFilterBodyMobileContentProps) {
    const intl = useIntl();

    const { showTabs } = getFiscalTabsConfig(filterOptions.relativePreset, activeCalendars);

    const [selectedTab, setSelectedTab] = useState<CalendarTabType>(() =>
        getDefaultCalendarTab(activeCalendars, selectedFilterOption),
    );

    const filteredRelativePreset = showTabs
        ? selectedTab === "standard"
            ? filterStandardPresets(filterOptions.relativePreset!)
            : filterFiscalPresets(filterOptions.relativePreset!)
        : filterOptions.relativePreset;

    if (!isRedesigned && route === "absoluteForm") {
        const title = intl.formatMessage({ id: "filters.staticPeriod" });
        return (
            <>
                <DateFilterHeader onBack={() => onBack(null)} title={title} />
                <AbsoluteDateFilterFormSection
                    filterOptions={filterOptions}
                    route={route}
                    closeDropdown={closeDropdown}
                    onApplyClick={onApplyClick}
                    changeRoute={onBack}
                    dateFormat={dateFormat}
                    onSelectedFilterOptionChange={onSelectedFilterOptionChange}
                    selectedFilterOption={selectedFilterOption as IUiAbsoluteDateFilterForm}
                    isMobile={isMobile}
                    isTimeForAbsoluteRangeEnabled={isTimeForAbsoluteRangeEnabled}
                    weekStart={weekStart}
                    withoutApply={withoutApply}
                />
            </>
        );
    }
    if (!isRedesigned && route === "relativeForm") {
        const title = intl.formatMessage({ id: "filters.floatingRange" });
        return isEmpty(availableGranularities) ? null : (
            <>
                <DateFilterHeader onBack={() => onBack(null)} title={title} />

                <RelativeDateFilterFormSection
                    filterOptions={filterOptions}
                    errors={errors || undefined}
                    onSelectedFilterOptionChange={onSelectedFilterOptionChange}
                    selectedFilterOption={selectedFilterOption as IUiRelativeDateFilterForm}
                    availableGranularities={availableGranularities}
                    isMobile={isMobile}
                    changeRoute={onBack}
                    route={route}
                    onApplyClick={onApplyClick}
                    closeDropdown={closeDropdown}
                    withoutApply={withoutApply}
                />
            </>
        );
    }
    if (isRedesigned) {
        return (
            <DateFilterBodyContentFiltered
                filterOptions={filterOptions}
                selectedFilterOption={selectedFilterOption}
                onSelectedFilterOptionChange={onSelectedFilterOptionChange}
                isMobile={isMobile}
                dateFormat={dateFormat}
                showTabs={showTabs}
                selectedTab={selectedTab}
                onTabSelect={setSelectedTab}
                filteredRelativePreset={filteredRelativePreset}
            />
        );
    }
    return (
        <DateFilterBodyContent
            filterOptions={filterOptions}
            selectedFilterOption={selectedFilterOption}
            onSelectedFilterOptionChange={onSelectedFilterOptionChange}
            isMobile={isMobile}
            route={route}
            closeDropdown={closeDropdown}
            onApplyClick={onApplyClick}
            changeRoute={onBack}
            dateFormat={dateFormat}
            errors={errors || undefined}
            isTimeForAbsoluteRangeEnabled={isTimeForAbsoluteRangeEnabled}
            weekStart={weekStart}
            availableGranularities={availableGranularities}
            activeCalendars={activeCalendars}
        />
    );
}
