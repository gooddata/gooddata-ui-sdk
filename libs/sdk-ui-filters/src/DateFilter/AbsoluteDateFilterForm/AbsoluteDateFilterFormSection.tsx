// (C) 2025 GoodData Corporation
import React, { useCallback } from "react";
import { isAbsoluteDateFilterForm, WeekStart } from "@gooddata/sdk-model";
import cx from "classnames";
import { FormattedMessage } from "react-intl";

import {
    DateFilterOption,
    IDateFilterOptionsByType,
    IUiAbsoluteDateFilterForm,
} from "../interfaces/index.js";
import { DateFilterRoute } from "../DateFilterBody/types.js";
import { ListItem } from "../ListItem/ListItem.js";
import { DateFilterFormWrapper } from "../DateFilterFormWrapper/DateFilterFormWrapper.js";

import { AbsoluteDateFilterForm } from "./AbsoluteDateFilterForm.js";

const ITEM_CLASS_MOBILE = "gd-date-filter-item-mobile";

interface IAbsoluteDateFilterFormSection {
    filterOptions: IDateFilterOptionsByType;
    selectedFilterOption: DateFilterOption;
    dateFormat: string;
    weekStart: WeekStart;
    isTimeForAbsoluteRangeEnabled: boolean;
    isMobile: boolean;
    route: DateFilterRoute;
    changeRoute: (newRoute?: DateFilterRoute) => void;
    onSelectedFilterOptionChange: (option: DateFilterOption) => void;
    closeDropdown: () => void;
    onApplyClick: () => void;
}

export const AbsoluteDateFilterFormSection: React.FC<IAbsoluteDateFilterFormSection> = ({
    filterOptions,
    selectedFilterOption,
    dateFormat,
    weekStart,
    isTimeForAbsoluteRangeEnabled,
    isMobile,
    route,
    changeRoute,
    onSelectedFilterOptionChange,
    closeDropdown,
    onApplyClick,
}) => {
    const submitForm = useCallback(() => {
        onApplyClick();
        closeDropdown();
    }, [closeDropdown, onApplyClick]);

    if (!filterOptions.absoluteForm) {
        return null;
    }

    const isSelected = filterOptions.absoluteForm.localIdentifier === selectedFilterOption.localIdentifier;
    const isOnRoute = route === "absoluteForm";

    return (
        <>
            {!isMobile || !isOnRoute ? (
                <ListItem
                    isSelected={isSelected}
                    onClick={() => {
                        changeRoute("absoluteForm");
                        if (!isAbsoluteDateFilterForm(selectedFilterOption)) {
                            onSelectedFilterOptionChange(filterOptions.absoluteForm);
                        }
                    }}
                    className={cx(
                        "s-absolute-form",
                        "s-do-not-close-dropdown-on-click",
                        isMobile && ITEM_CLASS_MOBILE,
                    )}
                >
                    {filterOptions.absoluteForm.name ? (
                        filterOptions.absoluteForm.name
                    ) : (
                        <FormattedMessage id="filters.staticPeriod" />
                    )}
                </ListItem>
            ) : null}
            {isSelected && (!isMobile || isOnRoute) ? (
                <DateFilterFormWrapper isMobile={isMobile}>
                    <AbsoluteDateFilterForm
                        dateFormat={dateFormat}
                        onSelectedFilterOptionChange={onSelectedFilterOptionChange}
                        selectedFilterOption={selectedFilterOption as IUiAbsoluteDateFilterForm}
                        isMobile={isMobile}
                        isTimeEnabled={isTimeForAbsoluteRangeEnabled}
                        weekStart={weekStart}
                        submitForm={submitForm}
                    />
                </DateFilterFormWrapper>
            ) : null}
        </>
    );
};
