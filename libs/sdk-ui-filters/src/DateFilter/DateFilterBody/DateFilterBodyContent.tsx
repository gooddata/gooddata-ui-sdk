// (C) 2025-2026 GoodData Corporation

import { useState } from "react";

import { isEmpty } from "lodash-es";
import { useIntl } from "react-intl";

import { type DateFilterGranularity, type IActiveCalendars, type WeekStart } from "@gooddata/sdk-model";
import { useIdPrefixed } from "@gooddata/sdk-ui-kit";

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
    getDefaultCalendarTab,
    getFilteredGranularities,
    getFilteredPresets,
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
    const intl = useIntl();
    const listboxLabel = intl.formatMessage({ id: "dateFilterDropdown.label" });
    const fiscalTabsConfig = getFiscalTabsConfig(filterOptions.relativePreset, activeCalendars);

    const [selectedTab, setSelectedTab] = useState<CalendarTabType>(() =>
        getDefaultCalendarTab(activeCalendars, selectedFilterOption),
    );
    const tabsIdBase = useIdPrefixed("calendar-tabs");
    const tabIds = {
        standard: `${tabsIdBase}-standard-tab`,
        fiscal: `${tabsIdBase}-fiscal-tab`,
    };
    const panelId = `${tabsIdBase}-panel`;
    const activeTabId = selectedTab === "fiscal" ? tabIds.fiscal : tabIds.standard;

    // When the selected option is not visible (e.g. preset from the other tab),
    // the first listbox item (AllTime) needs tabIndex={0} so the list is keyboard-reachable.
    // Note: relies on AllTime being the first rendered item in the listbox.
    const selectedId = selectedFilterOption.localIdentifier;

    const filteredRelativePreset = getFilteredPresets(
        filterOptions.relativePreset,
        fiscalTabsConfig,
        selectedTab,
    );
    const filteredAvailableGranularities = getFilteredGranularities(
        availableGranularities,
        fiscalTabsConfig,
        selectedTab,
    );
    const isSelectedInVisibleList =
        selectedId === filterOptions.allTime?.localIdentifier ||
        selectedId === filterOptions.absoluteForm?.localIdentifier ||
        selectedId === filterOptions.relativeForm?.localIdentifier ||
        filterOptions.absolutePreset?.some((p) => p.localIdentifier === selectedId) ||
        Object.values(filteredRelativePreset ?? {}).some((items) =>
            items?.some((p) => p.localIdentifier === selectedId),
        );

    const listContent = (
        <>
            <AllTimeFilterSection
                filterOptions={filterOptions}
                selectedFilterOption={selectedFilterOption}
                onSelectedFilterOptionChange={onSelectedFilterOptionChange}
                isMobile={isMobile}
                isFocusFallback={!isSelectedInVisibleList}
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

    return (
        <>
            {fiscalTabsConfig.showTabs ? (
                <CalendarTypeTabs
                    selectedTab={selectedTab}
                    onTabSelect={setSelectedTab}
                    tabIds={tabIds}
                    panelId={panelId}
                />
            ) : null}
            {fiscalTabsConfig.showTabs ? (
                <div role="tabpanel" id={panelId} aria-labelledby={activeTabId}>
                    <div role="listbox" aria-label={listboxLabel}>
                        {listContent}
                    </div>
                </div>
            ) : (
                <div role="listbox" aria-label={listboxLabel}>
                    {listContent}
                </div>
            )}
        </>
    );
}
