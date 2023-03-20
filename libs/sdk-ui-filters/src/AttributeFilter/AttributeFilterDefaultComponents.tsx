// (C) 2022-2023 GoodData Corporation
import { IAttributeFilterBaseProps, IAttributeFilterCustomComponentProps } from "./types";
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
import { AttributeFilterElementsActions } from "./Components/ElementsSelect/AttributeFilterElementsActions";
import { SingleSelectionAttributeFilterElementsSelectItem } from "./Components/ElementsSelect/SingleSelectionAttributeFilterElementsSelectItem";
import { SingleSelectionAttributeFilterElementsSelectActions } from "./Components/ElementsSelect/SingleSelectionAttributeFilterElementsActions";
import { SingleSelectionAttributeFilterStatusBar } from "./Components/ElementsSelect/StatusBar/SingleSelectionAttributeFilterStatusBar";
import { SingleSelectionAttributeFilterDropdownActions } from "./Components/Dropdown/SingleSelectionAttributeFilterDropdownActions";

/**
 * @internal
 */
export const AttributeFilterDefaultComponents: Required<IAttributeFilterCustomComponentProps> = {
    ErrorComponent: AttributeFilterError,
    LoadingComponent: undefined,
    DropdownButtonComponent: AttributeFilterDropdownButton,
    DropdownBodyComponent: AttributeFilterDropdownBody,
    DropdownActionsComponent: AttributeFilterDropdownActions,
    ElementsSearchBarComponent: AttributeFilterElementsSearchBar,
    ElementsSelectComponent: AttributeFilterElementsSelect,
    ElementsSelectItemComponent: AttributeFilterElementsSelectItem,
    ElementsSelectErrorComponent: AttributeFilterElementsSelectError,
    ElementsSelectLoadingComponent: AttributeFilterElementsSelectLoading,
    ElementsSelectActionsComponent: AttributeFilterElementsActions,
    EmptyResultComponent: AttributeFilterEmptyResult,
    StatusBarComponent: AttributeFilterStatusBar,
    FilterError: AttributeFilterError,
    FilterLoading: AttributeFilterLoading,
};

/**
 * @internal
 */
export const getAttributeFilterDefaultComponents = ({
    selectionMode,
}: IAttributeFilterBaseProps): Required<IAttributeFilterCustomComponentProps> => {
    return {
        ...AttributeFilterDefaultComponents,
        ...(selectionMode === "single"
            ? {
                  ElementsSelectItemComponent: SingleSelectionAttributeFilterElementsSelectItem,
                  ElementsSelectActionsComponent: SingleSelectionAttributeFilterElementsSelectActions,
                  StatusBarComponent: SingleSelectionAttributeFilterStatusBar,
                  DropdownActionsComponent: SingleSelectionAttributeFilterDropdownActions,
              }
            : {}),
    };
};
