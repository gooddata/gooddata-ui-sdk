// (C) 2022 GoodData Corporation
import { IAtributeFilterComponentsContext } from "./AttributeFilterComponentsContext";
import { AttributeFilterLoading } from "../Components/AttributeFilterLoading";
import { AttributeFilterError } from "../Components/AttributeFilterError";
import { AttributeFilterDropdownActions } from "../Components/Dropdown/AttributeFilterDropdownActions";
import { AttributeFilterDropdownButton } from "../Components/DropdownButton/AttributeFilterDropdownButton";
import { AttributeFilterDropdownBody } from "../Components/Dropdown/AttributeFilterDropdownBody";
import { AttributeFilterDropdownContent } from "../Components/Dropdown/AttributeFilterDropdownContent";
import { AttributeFilterElementsSelect } from "../Components/ElementsSelect/AttributeFilterElementsSelect";
import { AttributeFilterElementsSelectNoData } from "../Components/ElementsSelect/AttributeFilterElementsSelectNoData";
import { AttributeFilterElementsSelectNoMatchingData } from "../Components/ElementsSelect/AttributeFilterElementsSelectNoMatchingData";
import { AttributeFilterElementsSelectParentItemsFiltered } from "../Components/ElementsSelect/AttributeFilterElementsSelectParentItemsFiltered";
import { AttributeFilterElementsSelectError } from "../Components/ElementsSelect/AttributeFilterElementsSelectError";
import { AttributeFilterElementsSelectLoading } from "../Components/ElementsSelect/AttributeFilterElementsSelectLoading";
import { AttributeFilterElementsSelectItem } from "../Components/ElementsSelect/AttributeFilterElementsSelectItem";

/**
 * @internal
 */
export const AttributeFilterDefaultComponents: IAtributeFilterComponentsContext = {
    AttributeFilterError,
    AttributeFilterLoading,
    AttributeFilterDropdownButton,
    AttributeFilterDropdownBody,
    AttributeFilterDropdownActions,
    AttributeFilterDropdownContent,
    AttributeFilterElementsSelect,
    AttributeFilterElementsSelectItem,
    AttributeFilterElementsSelectLoading,
    AttributeFilterElementsSelectNoData,
    AttributeFilterElementsSelectNoMatchingData,
    AttributeFilterElementsSelectParentItemsFiltered,
    AttributeFilterElementsSelectError,
};
