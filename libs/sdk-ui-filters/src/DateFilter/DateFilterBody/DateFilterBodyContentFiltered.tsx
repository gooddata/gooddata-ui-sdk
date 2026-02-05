// (C) 2025-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { useIdPrefixed } from "@gooddata/sdk-ui-kit";

import { AbsolutePresetFilterItems } from "./AbsolutePresetFilterItems.js";
import { CalendarTypeTabs } from "./CalendarTypeTabs.js";
import { RelativePresetFilterItems } from "./RelativePresetFilterItems.js";
import { AllTimeFilterSection } from "../AllTime/AllTimeFilterSection.js";
import {
    type DateFilterOption,
    type DateFilterRelativeOptionGroup,
    type IDateFilterOptionsByType,
} from "../interfaces/index.js";
import { type CalendarTabType } from "../utils/presetFilterUtils.js";

const ITEM_CLASS_MOBILE = "gd-date-filter-item-mobile";

interface IDateFilterBodyContentFilteredProps {
    filterOptions: IDateFilterOptionsByType;
    selectedFilterOption: DateFilterOption;
    isMobile: boolean;
    dateFormat: string;
    onSelectedFilterOptionChange: (option: DateFilterOption) => void;
    showTabs: boolean;
    selectedTab: CalendarTabType;
    onTabSelect: (tab: CalendarTabType) => void;
    filteredRelativePreset: DateFilterRelativeOptionGroup | undefined;
}

/**
 * Filtered version of DateFilterBodyContent that excludes absoluteForm and relativeForm sections.
 * These form sections are now rendered separately as buttons in DateFilterFormButtons.
 */
export function DateFilterBodyContentFiltered({
    filterOptions,
    selectedFilterOption,
    isMobile,
    dateFormat,
    onSelectedFilterOptionChange,
    showTabs,
    selectedTab,
    onTabSelect,
    filteredRelativePreset,
}: IDateFilterBodyContentFilteredProps) {
    const intl = useIntl();
    const listboxLabel = intl.formatMessage({ id: "dateFilterDropdown.label" });
    const tabsIdBase = useIdPrefixed("calendar-tabs");
    const tabIds = {
        standard: `${tabsIdBase}-standard-tab`,
        fiscal: `${tabsIdBase}-fiscal-tab`,
    };
    const panelId = `${tabsIdBase}-panel`;
    const activeTabId = selectedTab === "fiscal" ? tabIds.fiscal : tabIds.standard;

    const listContent = (
        <>
            <AllTimeFilterSection
                filterOptions={filterOptions}
                selectedFilterOption={selectedFilterOption}
                onSelectedFilterOptionChange={onSelectedFilterOptionChange}
                isMobile={isMobile}
                isFocusFallback={
                    selectedFilterOption.localIdentifier === filterOptions.absoluteForm?.localIdentifier ||
                    selectedFilterOption.localIdentifier === filterOptions.relativeForm?.localIdentifier
                }
            />
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
            {showTabs ? (
                <CalendarTypeTabs
                    selectedTab={selectedTab}
                    onTabSelect={onTabSelect}
                    tabIds={tabIds}
                    panelId={panelId}
                />
            ) : null}
            {showTabs ? (
                <div role="tabpanel" id={panelId} aria-labelledby={activeTabId} tabIndex={0}>
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
