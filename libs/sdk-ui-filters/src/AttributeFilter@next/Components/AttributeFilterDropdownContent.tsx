// (C) 2019-2022 GoodData Corporation
import React from "react";
import { IAttributeFilterDropdownContentProps } from "./types";
import { useAttributeFilterComponentsContext } from "../Context/AttributeFilterComponentsContext";
import { useAttributeFilterList } from "./AttributeFilterList";
import { useAttributeFilterContext } from "../Context/AttributeFilterContext";

export const AttributeFilterDropdownContent: React.FC<IAttributeFilterDropdownContentProps> = (props) => {
    const { error, parentFilterTitles, showItemsFilteredMessage, hasNoMatchingData, hasNoData } = props;

    const {
        AttributeFilterList,
        MessageNoData,
        MessageNoMatchingData,
        MessageParentItemsFiltered,
        MessageListError,
    } = useAttributeFilterComponentsContext();

    const listProps = useAttributeFilterList();
    return (
        <>
            {error ? (
                <MessageListError />
            ) : hasNoMatchingData ? (
                <MessageNoMatchingData parentFilterTitles={parentFilterTitles} />
            ) : hasNoData ? (
                <MessageNoData />
            ) : (
                <AttributeFilterList {...listProps} />
            )}

            <MessageParentItemsFiltered
                parentFilterTitles={parentFilterTitles}
                showItemsFilteredMessage={showItemsFilteredMessage}
            />
        </>
    );
};

export const useAttributeFilterDropdownContent = (): IAttributeFilterDropdownContentProps => {
    const { elements } = useAttributeFilterContext();

    return {
        error: elements.initialPageLoad.error,
        hasNoMatchingData: false, //implement it
        hasNoData: false, //implement it
        parentFilterTitles: [], //implement it
        showItemsFilteredMessage: false, //implement it
    };
};
