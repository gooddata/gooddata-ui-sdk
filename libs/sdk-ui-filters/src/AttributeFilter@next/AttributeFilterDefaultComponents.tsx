// (C) 2022 GoodData Corporation
import { IAttributeFilterCustomComponentProps } from "./types";
import { AttributeFilterLoading } from "./Components/AttributeFilterLoading";
import { AttributeFilterError } from "./Components/AttributeFilterError";
import { AttributeFilterDropdownButton } from "./Components/DropdownButton/AttributeFilterDropdownButton";
import { AttributeFilterDropdownBody } from "./Components/Dropdown/AttributeFilterDropdownBody";
import { AttributeFilterDropdownActions } from "./Components/Dropdown/AttributeFilterDropdownActions";
import { AttributeFilterElementsSearchBar } from "./Components/ElementsSelect/AttributeFilterElementsSearchBar";
import { AttributeFilterElementsSelect } from "./Components/ElementsSelect/AttributeFilterElementsSelect";
import { AttributeFilterElementsSelectItem } from "./Components/ElementsSelect/AttributeFilterElementsSelectItem";
import { AttributeFilterElementsSelectError } from "./Components/ElementsSelect/AttributeFilterElementsSelectError";
import { AttributeFilterElementsSelectLoading } from "./Components/ElementsSelect/AttributeFilterElementsSelectLoading";
import { AttributeFilterEmptyResult } from "./Components/ElementsSelect/EmptyResult/AttributeFilterEmptyResult";
import { AttributeFilterStatusBar } from "./Components/ElementsSelect/StatusBar/AttributeFilterStatusBar";

/**
 * @internal
 */
export const AttributeFilterDefaultComponents: Required<IAttributeFilterCustomComponentProps> = {
    ErrorComponent: AttributeFilterError,
    LoadingComponent: AttributeFilterLoading,
    DropdownButtonComponent: AttributeFilterDropdownButton,
    DropdownBodyComponent: AttributeFilterDropdownBody,
    DropdownActionsComponent: AttributeFilterDropdownActions,
    ElementsSearchBarComponent: AttributeFilterElementsSearchBar,
    ElementsSelectComponent: AttributeFilterElementsSelect,
    ElementsSelectItemComponent: AttributeFilterElementsSelectItem,
    ElementsSelectErrorComponent: AttributeFilterElementsSelectError,
    ElementsSelectLoadingComponent: AttributeFilterElementsSelectLoading,
    EmptyResultComponent: AttributeFilterEmptyResult,
    StatusBarComponent: AttributeFilterStatusBar,
    FilterError: AttributeFilterError,
    FilterLoading: AttributeFilterLoading,
};
