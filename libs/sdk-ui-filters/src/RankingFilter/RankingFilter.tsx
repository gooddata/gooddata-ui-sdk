// (C) 2020-2022 GoodData Corporation
import React, { useState } from "react";
import { IRankingFilter, ObjRefInScope } from "@gooddata/sdk-model";
import { RankingFilterButton } from "./RankingFilterButton.js";
import { RankingFilterDropdown } from "./RankingFilterDropdown.js";
import { IMeasureDropdownItem, IAttributeDropdownItem, ICustomGranularitySelection } from "./types.js";
import noop from "lodash/noop.js";

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
    enableRenamingMeasureToMetric?: boolean;
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
    onDropDownItemMouseOver,
    onDropDownItemMouseOut,
    customGranularitySelection,
    locale,
    enableRenamingMeasureToMetric,
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
                    enableRenamingMeasureToMetric={enableRenamingMeasureToMetric}
                />
            ) : null}
        </>
    );
};

RankingFilter.defaultProps = {
    onCancel: noop,
};
