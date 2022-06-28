// (C) 2019-2022 GoodData Corporation

import { IAtributeFilterComponentsContext } from "./AttributeFilterComponentsContext";
import { AttributeFilterDropdownButtons } from "../Components/AttributeFilterDropdownButtons";
import { AttributeFilterSimpleButton } from "../Components/AttributeFilterSimpleButton";

import { AttributeFilterError } from "../Components/AttributeFilterError";
import { AttributeFilterDropdownBody } from "../Components/AttributeFilterDropdownBody";
import { AttributeFilterDropdownContent } from "../Components/AttributeFilterDropdownContent";
import { AttributeFilterList } from "../Components/AttributeFilterList";
import { MessageNoData } from "../Components/MessageNoData";
import { MessageNoMatchingData } from "../Components/MessageNoMatchingData";
import { MessageParentItemsFiltered } from "../Components/MessageParentItemsFiltered";
import { MessageListError } from "../Components/MessageListError";
import { AttributeFilterListLoading } from "../Components/AttributeFilterListLoading";
import { AttributeFilterListItem } from "../Components/AttributeFilterListItem";

/**
 * @internal
 */
export const AttributeFilterDefaultComponents: IAtributeFilterComponentsContext = {
    AttributeFilterError: AttributeFilterError,
    AttributeFilterButton: AttributeFilterSimpleButton,
    AttributeFilterDropdownBody: AttributeFilterDropdownBody,
    AttributeFilterDropdownButtons: AttributeFilterDropdownButtons,
    AttributeFilterDropdownContent: AttributeFilterDropdownContent,
    AttributeFilterList: AttributeFilterList,
    AttributeFilterListItem: AttributeFilterListItem,
    AttributeFilterListLoading: AttributeFilterListLoading,
    MessageListError: MessageListError,
    MessageNoData: MessageNoData,
    MessageNoMatchingData: MessageNoMatchingData,
    MessageParentItemsFiltered: MessageParentItemsFiltered,
};
