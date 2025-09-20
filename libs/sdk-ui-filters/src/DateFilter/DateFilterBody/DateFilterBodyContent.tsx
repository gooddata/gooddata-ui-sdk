// (C) 2025 GoodData Corporation

import { isEmpty } from "lodash-es";

import { DateFilterGranularity, WeekStart } from "@gooddata/sdk-model";

import { AbsolutePresetFilterItems } from "./AbsolutePresetFilterItems.js";
import { RelativePresetFilterItems } from "./RelativePresetFilterItems.js";
import { DateFilterRoute } from "./types.js";
import { AbsoluteDateFilterFormSection } from "../AbsoluteDateFilterForm/AbsoluteDateFilterFormSection.js";
import { AllTimeFilterSection } from "../AllTime/AllTimeFilterSection.js";
import {
    DateFilterOption,
    IDateFilterOptionsByType,
    IExtendedDateFilterErrors,
    IUiAbsoluteDateFilterForm,
    IUiRelativeDateFilterForm,
} from "../interfaces/index.js";
import { RelativeDateFilterFormSection } from "../RelativeDateFilterForm/RelativeDateFilterFormSection.js";

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
}: IDateFilterBodyContentProps) {
    return (
        <>
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
            {isEmpty(availableGranularities) ? null : (
                <RelativeDateFilterFormSection
                    filterOptions={filterOptions}
                    onSelectedFilterOptionChange={onSelectedFilterOptionChange}
                    selectedFilterOption={selectedFilterOption as IUiRelativeDateFilterForm}
                    availableGranularities={availableGranularities}
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
            {filterOptions.relativePreset ? (
                <RelativePresetFilterItems
                    dateFormat={dateFormat}
                    filterOption={filterOptions.relativePreset}
                    selectedFilterOption={selectedFilterOption}
                    onSelectedFilterOptionChange={onSelectedFilterOptionChange}
                    className={isMobile ? ITEM_CLASS_MOBILE : undefined}
                />
            ) : null}
        </>
    );
}
