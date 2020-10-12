// (C) 2007-2019 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { DateFilterButton } from "../DateFilterButton/DateFilterButton";
import { DateFilterTextLocalized } from "../DateFilterTextLocalized/DateFilterTextLocalized";
import { DateFilterOption } from "../interfaces";

export interface IDateFilterButtonLocalizedProps {
    dateFilterOption: DateFilterOption;
    dateFormat: string;
    isOpen?: boolean;
    isMobile: boolean;
    customFilterName?: string;
    disabled?: boolean;
}

export const DateFilterButtonLocalized: React.FC<IDateFilterButtonLocalizedProps> = ({
    dateFilterOption,
    dateFormat,
    isOpen = false,
    isMobile = true,
    customFilterName,
    disabled,
}) => {
    return (
        <DateFilterButton
            title={customFilterName || <FormattedMessage id="dateFilterDropdown.title" />}
            isOpen={isOpen}
            isMobile={isMobile}
            disabled={disabled}
        >
            <span className="s-button-text">
                <DateFilterTextLocalized filter={dateFilterOption} dateFormat={dateFormat} />
            </span>
        </DateFilterButton>
    );
};
