// (C) 2025 GoodData Corporation

import React from "react";

import isEmpty from "lodash/isEmpty.js";
import { FormattedMessage } from "react-intl";

import { DateFilterGranularity, WeekStart } from "@gooddata/sdk-model";

import { DateFilterBodyContent } from "./DateFilterBodyContent.js";
import { DateFilterHeader } from "./DateFilterHeader.js";
import { DateFilterRoute } from "./types.js";
import { AbsoluteDateFilterFormSection } from "../AbsoluteDateFilterForm/AbsoluteDateFilterFormSection.js";
import {
    DateFilterOption,
    IDateFilterOptionsByType,
    IExtendedDateFilterErrors,
    IUiAbsoluteDateFilterForm,
    IUiRelativeDateFilterForm,
} from "../interfaces/index.js";
import { RelativeDateFilterFormSection } from "../RelativeDateFilterForm/RelativeDateFilterFormSection.js";

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
    changeRoute: (newRoute?: DateFilterRoute) => void;
    onApplyClick: () => void;
}

export const DateFilterBodyMobileContent: React.FC<IDateFilterBodyMobileContentProps> = ({
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
}) => {
    if (route === "absoluteForm") {
        return (
            <>
                <DateFilterHeader changeRoute={changeRoute}>
                    <FormattedMessage id="filters.staticPeriod" />
                </DateFilterHeader>
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
            </>
        );
    }
    if (route === "relativeForm") {
        return isEmpty(availableGranularities) ? null : (
            <>
                <DateFilterHeader changeRoute={changeRoute}>
                    <FormattedMessage id="filters.floatingRange" />
                </DateFilterHeader>
                <RelativeDateFilterFormSection
                    filterOptions={filterOptions}
                    errors={errors || undefined}
                    onSelectedFilterOptionChange={onSelectedFilterOptionChange}
                    selectedFilterOption={selectedFilterOption as IUiRelativeDateFilterForm}
                    availableGranularities={availableGranularities}
                    isMobile={isMobile}
                    changeRoute={changeRoute}
                    route={route}
                    onApplyClick={onApplyClick}
                    closeDropdown={closeDropdown}
                    withoutApply={withoutApply}
                />
            </>
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
            changeRoute={changeRoute}
            dateFormat={dateFormat}
            errors={errors || undefined}
            isTimeForAbsoluteRangeEnabled={isTimeForAbsoluteRangeEnabled}
            weekStart={weekStart}
            availableGranularities={availableGranularities}
        />
    );
};
