// (C) 2022 GoodData Corporation
import React from "react";
import { useAttributeFilterComponentsContext } from "../../Context/AttributeFilterComponentsContext";
import { useAttributeFilterContext } from "../../Context/AttributeFilterContext";
import { IAttributeFilterDropdownBodyProps } from "./types";

/**
 * @internal
 */
export const AttributeFilterDropdownBody: React.FC<IAttributeFilterDropdownBodyProps> = (props) => {
    const { onApplyButtonClick, onCloseButtonClick } = props;

    const { AttributeFilterDropdownActions, AttributeFilterDropdownContent } =
        useAttributeFilterComponentsContext();

    const {
        initialElementsPageError,
        nextElementsPageError,
        hasNoData,
        hasNoMatchingData,
        parentFilterTitles,
        showItemsFilteredMessage,
        isApplyDisabled,
    } = useAttributeFilterContext();

    return (
        <div className="gd-attribute-filter-overlay__next">
            <AttributeFilterDropdownContent
                error={initialElementsPageError ?? nextElementsPageError}
                hasNoData={hasNoData}
                hasNoMatchingData={hasNoMatchingData}
                parentFilterTitles={parentFilterTitles}
                showItemsFilteredMessage={showItemsFilteredMessage}
            />
            <AttributeFilterDropdownActions
                onApplyButtonClick={onApplyButtonClick}
                onCloseButtonClick={onCloseButtonClick}
                isApplyDisabled={isApplyDisabled}
            />
        </div>
    );
};
