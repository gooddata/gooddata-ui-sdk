// (C) 2020 GoodData Corporation
import React, { useState } from "react";
import { IRankingFilter } from "@gooddata/sdk-model";
import { RankingFilterButton } from "./RankingFilterButton";
import { RankingFilterDropdown } from "./RankingFilterDropdown";
import { IMeasureDropdownItem, IAttributeDropdownItem } from "./types";
import noop from "lodash/noop";

/**
 * @beta
 */
export interface IRankingFilterProps {
    measureItems: IMeasureDropdownItem[];
    attributeItems: IAttributeDropdownItem[];
    filter: IRankingFilter;
    onApply: (filter: IRankingFilter) => void;
    onCancel?: () => void;
    buttonTitle: string;
    locale?: string;
}

/**
 * @beta
 */
export const RankingFilter: React.FC<IRankingFilterProps> = ({
    measureItems,
    attributeItems,
    filter,
    onApply,
    onCancel,
    buttonTitle,
    locale,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const onButtonClick = () => {
        setIsOpen(!isOpen);
    };

    const handleApply = (rankingFilter: IRankingFilter) => {
        onApply(rankingFilter);
        setIsOpen(false);
    };

    const handleCancel = () => {
        onCancel();
        setIsOpen(false);
    };

    return (
        <>
            <RankingFilterButton
                isActive={isOpen}
                onClick={onButtonClick}
                title={buttonTitle}
                className="gd-rf-dropdown-button"
            />
            {isOpen && (
                <RankingFilterDropdown
                    measureItems={measureItems}
                    attributeItems={attributeItems}
                    filter={filter}
                    onApply={handleApply}
                    onCancel={handleCancel}
                    locale={locale}
                    anchorEl=".gd-rf-dropdown-button"
                />
            )}
        </>
    );
};

RankingFilter.defaultProps = {
    onCancel: noop,
};
