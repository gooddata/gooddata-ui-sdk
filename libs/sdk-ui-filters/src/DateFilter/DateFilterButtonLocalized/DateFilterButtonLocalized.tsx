// (C) 2007-2024 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { DateFilterButton } from "../DateFilterButton/DateFilterButton.js";
import { DateFilterTextLocalized } from "../DateFilterTextLocalized/DateFilterTextLocalized.js";
import { DateFilterOption } from "../interfaces/index.js";
import { IFilterButtonCustomIcon } from "../../shared/index.js";
import { ShortenedText } from "@gooddata/sdk-ui-kit";

const ALIGN_POINT = [
    { align: "tc bc", offset: { x: 0, y: -2 } },
    { align: "cc tc", offset: { x: 0, y: 10 } },
    { align: "bl tr", offset: { x: -2, y: -8 } },
];

export interface IDateFilterButtonLocalizedProps {
    dateFilterOption: DateFilterOption;
    dateFormat: string;
    isOpen?: boolean;
    isMobile: boolean;
    customFilterName?: string;
    disabled?: boolean;
    customIcon?: IFilterButtonCustomIcon;
}

export const DateFilterButtonLocalized: React.FC<IDateFilterButtonLocalizedProps> = ({
    dateFilterOption,
    dateFormat,
    isOpen = false,
    isMobile = true,
    customFilterName,
    disabled,
    customIcon,
}) => {
    const title = customFilterName ? (
        <ShortenedText tooltipAlignPoints={ALIGN_POINT}>{customFilterName}</ShortenedText>
    ) : (
        <FormattedMessage id="dateFilterDropdown.title" />
    );
    return (
        <DateFilterButton
            title={title}
            isOpen={isOpen}
            isMobile={isMobile}
            disabled={disabled}
            customIcon={customIcon}
            customFilterName={customFilterName}
        >
            <span className="s-button-text">
                <DateFilterTextLocalized filter={dateFilterOption} dateFormat={dateFormat} />
            </span>
        </DateFilterButton>
    );
};
