// (C) 2025 GoodData Corporation

import isEmpty from "lodash/isEmpty.js";
import { AbsoluteDateFilterFormSection } from "../AbsoluteDateFilterForm/AbsoluteDateFilterFormSection.js";
import { RelativeDateFilterFormSection } from "../RelativeDateFilterForm/RelativeDateFilterFormSection.js";
import {
    DateFilterOption,
    IDateFilterOptionsByType,
    IExtendedDateFilterErrors,
    IUiAbsoluteDateFilterForm,
    IUiRelativeDateFilterForm,
} from "../interfaces/index.js";
import { DateFilterRoute } from "./types.js";
import { DateFilterGranularity, WeekStart } from "@gooddata/sdk-model";
import { DateFilterHeader } from "./DateFilterHeader.js";
import { FormattedMessage } from "react-intl";
import { DateFilterBodyContent } from "./DateFilterBodyContent.js";

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
    changeRoute,
    onApplyClick,
    onSelectedFilterOptionChange,
}: IDateFilterBodyMobileContentProps) {
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
}
