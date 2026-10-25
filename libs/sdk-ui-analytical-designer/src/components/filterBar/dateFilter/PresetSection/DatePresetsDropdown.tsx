// (C) 2007-2026 GoodData Corporation

import { useRef } from "react";

import { defineMessage, useIntl } from "react-intl";

import { type IActiveCalendars } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";
import {
    type CalendarTabType,
    type DateFilterOption,
    type DateFilterRelativeOptionGroup,
    getFilteredPresets,
    getFiscalTabsConfig,
} from "@gooddata/sdk-ui-filters";
import { CalendarTypeTabs, RelativePresetFilterItems } from "@gooddata/sdk-ui-filters/internal";
import { Dropdown } from "@gooddata/sdk-ui-kit";

import { DROPDOWN_ALIGN_POINTS } from "../../../../utils/dropdown.js";
import { useDropdownHeight } from "../../../shared/DropdownWrapperHook.js";
import {
    ALL_TIME_FILTER_OPTION,
    RELATIVE_PERIOD_FILTER_OPTION,
    STATIC_PERIOD_FILTER_OPTION,
} from "../defaultFilterOptions.js";

import { DatePresetDropdownItem } from "./DatePresetDropdownItem.js";
import { DatePresetsDropdownButton } from "./DatePresetsDropdownButton.js";

export interface IDatePresetsDropdownProps {
    selectedPreset: DateFilterOption;
    relativeDateFilterPresets: DateFilterRelativeOptionGroup;
    onChange: (filter: DateFilterOption) => void;
    dateFormat: string;
    contextWindow?: Window;
    selectedTab?: CalendarTabType;
    onTabChange?: (tab: CalendarTabType) => void;
    activeCalendars?: IActiveCalendars;
}

interface IDatePresetsDropdownBodyProps extends IDatePresetsDropdownProps {
    buttonNode: HTMLElement;
    closeDropdown: () => void;
}

function DatePresetsDropdownBody({
    buttonNode,
    selectedPreset,
    relativeDateFilterPresets,
    onChange,
    closeDropdown,
    dateFormat,
    contextWindow = window,
    selectedTab,
    onTabChange,
    activeCalendars,
}: IDatePresetsDropdownBodyProps) {
    const intl = useIntl();
    const dialogHeight = useDropdownHeight(buttonNode, 100, 600, 0, 30, contextWindow);

    const fiscalTabsConfig = getFiscalTabsConfig(relativeDateFilterPresets, activeCalendars);

    const filteredPresets = getFilteredPresets(relativeDateFilterPresets, fiscalTabsConfig, selectedTab);

    const handleOnChange = (option: DateFilterOption) => {
        onChange(option);
        closeDropdown();
    };

    return (
        <div
            className="gd-extended-date-filter-body gd-date-filter-preset-dropdown s-date-presets-list"
            style={{ maxHeight: dialogHeight }}
        >
            {fiscalTabsConfig.showTabs && onTabChange ? (
                <CalendarTypeTabs selectedTab={selectedTab} onTabSelect={onTabChange} />
            ) : null}
            <DatePresetDropdownItem
                titleIntlKey="all_time"
                item={ALL_TIME_FILTER_OPTION}
                selectedItem={selectedPreset}
                onChange={handleOnChange}
            />
            <DatePresetDropdownItem
                titleIntlKey="static_period"
                item={STATIC_PERIOD_FILTER_OPTION}
                selectedItem={selectedPreset}
                onChange={handleOnChange}
            />
            <DatePresetDropdownItem
                titleIntlKey="floating_period"
                item={RELATIVE_PERIOD_FILTER_OPTION}
                selectedItem={selectedPreset}
                onChange={handleOnChange}
                tooltipSdkIntlKey={defineMessage({ id: "filters.floatingRange.tooltip" }).id}
            />
            <IntlWrapper locale={intl.locale}>
                <RelativePresetFilterItems
                    onSelectedFilterOptionChange={handleOnChange}
                    selectedFilterOption={selectedPreset}
                    filterOption={filteredPresets}
                    dateFormat={dateFormat}
                />
            </IntlWrapper>
        </div>
    );
}

export function DatePresetsDropdown(props: IDatePresetsDropdownProps) {
    const buttonRef = useRef<HTMLDivElement>(null);
    const { selectedPreset, dateFormat } = props;
    return (
        <Dropdown
            className="s-filter-date-preset-switch adi-date-preset-select-dropdown s-date-dataset-switch"
            renderButton={(props) => (
                <DatePresetsDropdownButton
                    {...props}
                    selectedPreset={selectedPreset}
                    buttonWrapperRef={buttonRef}
                    dateFormat={dateFormat}
                />
            )}
            alignPoints={DROPDOWN_ALIGN_POINTS}
            closeOnParentScroll
            closeOnMouseDrag
            renderBody={({ closeDropdown }) => (
                <DatePresetsDropdownBody
                    {...props}
                    buttonNode={buttonRef.current}
                    closeDropdown={closeDropdown}
                />
            )}
        />
    );
}
