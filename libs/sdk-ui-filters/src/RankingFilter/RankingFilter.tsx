// (C) 2020-2025 GoodData Corporation

import { useState } from "react";

import { IRankingFilter, ObjRefInScope } from "@gooddata/sdk-model";

import { RankingFilterButton } from "./RankingFilterButton.js";
import { RankingFilterDropdown } from "./RankingFilterDropdown.js";
import { IAttributeDropdownItem, ICustomGranularitySelection, IMeasureDropdownItem } from "./types.js";

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
    onDropDownItemMouseOver?: (ref: ObjRefInScope) => void;
    onDropDownItemMouseOut?: () => void;
    customGranularitySelection?: ICustomGranularitySelection;
    locale?: string;
}

/**
 * @beta
 */
export function RankingFilter({
    measureItems,
    attributeItems,
    filter,
    onApply,
    onCancel = () => {},
    buttonTitle,
    onDropDownItemMouseOver,
    onDropDownItemMouseOut,
    customGranularitySelection,
    locale,
}: IRankingFilterProps) {
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
            {isOpen ? (
                <RankingFilterDropdown
                    measureItems={measureItems}
                    attributeItems={attributeItems}
                    filter={filter}
                    onApply={handleApply}
                    onCancel={handleCancel}
                    anchorEl=".gd-rf-dropdown-button"
                    onDropDownItemMouseOver={onDropDownItemMouseOver}
                    onDropDownItemMouseOut={onDropDownItemMouseOut}
                    customGranularitySelection={customGranularitySelection}
                    locale={locale}
                />
            ) : null}
        </>
    );
}
