// (C) 2022 GoodData Corporation
import { IAtributeFilterComponentsContext } from "./types";
import { AttributeFilterDropdownButtons } from "../Components/AttributeFilterDropdownButtons";
import { AttributeFilterButton } from "../Components/AttributeFilterButton";
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
    AttributeFilterButton: AttributeFilterButton,
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
