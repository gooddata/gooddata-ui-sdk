// (C) 2007-2025 GoodData Corporation
import React, { ComponentType } from "react";

import { useIntl } from "react-intl";

import { ShortenedText } from "@gooddata/sdk-ui-kit";

import { IFilterButtonCustomIcon } from "../../shared/index.js";
import { DateFilterButton, IDateFilterButtonProps } from "../DateFilterButton/DateFilterButton.js";
import {
    DateFilterTextLocalized,
    useDateFilterText,
} from "../DateFilterTextLocalized/DateFilterTextLocalized.js";
import { DateFilterOption } from "../interfaces/index.js";

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
    buttonRef?: React.MutableRefObject<HTMLElement | null>;
    dropdownId?: string;
    onClick?: () => void;
    ButtonComponent?: ComponentType<IDateFilterButtonProps>;
}

export const DateFilterButtonLocalized: React.FC<IDateFilterButtonLocalizedProps> = ({
    dateFilterOption,
    dateFormat,
    isOpen = false,
    isMobile = true,
    customFilterName,
    disabled,
    customIcon,
    buttonRef,
    dropdownId,
    onClick,
    ButtonComponent,
}) => {
    const intl = useIntl();
    const defaultTitle = intl.formatMessage({ id: "dateFilterDropdown.title" });
    const textTitle = customFilterName ?? defaultTitle;
    const title = customFilterName ? (
        <ShortenedText tooltipAlignPoints={ALIGN_POINT}>{customFilterName}</ShortenedText>
    ) : (
        <>{textTitle}</>
    );
    const textSubtitle = useDateFilterText({ filter: dateFilterOption, dateFormat });

    const Component = ButtonComponent ?? DateFilterButton;

    return (
        <Component
            title={title}
            isOpen={isOpen}
            isMobile={isMobile}
            disabled={disabled}
            customIcon={customIcon}
            customFilterName={customFilterName}
            onClick={onClick}
            textTitle={textTitle}
            textSubtitle={textSubtitle}
            buttonRef={buttonRef}
            dropdownId={dropdownId}
        >
            <span className="s-button-text">
                <DateFilterTextLocalized filter={dateFilterOption} dateFormat={dateFormat} />
            </span>
        </Component>
    );
};
