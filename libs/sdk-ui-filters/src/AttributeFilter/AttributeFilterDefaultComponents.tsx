// (C) 2022-2023 GoodData Corporation
import { IAttributeFilterBaseProps, IAttributeFilterCustomComponentProps } from "./types.js";
import { AttributeFilterLoading } from "./Components/AttributeFilterLoading.js";
import { AttributeFilterError } from "./Components/AttributeFilterError.js";
import { AttributeFilterDropdownButton } from "./Components/DropdownButton/AttributeFilterDropdownButton.js";
import { AttributeFilterDropdownBody } from "./Components/Dropdown/AttributeFilterDropdownBody.js";
import { AttributeFilterDropdownActions } from "./Components/Dropdown/AttributeFilterDropdownActions.js";
import { AttributeFilterElementsSearchBar } from "./Components/ElementsSelect/AttributeFilterElementsSearchBar.js";
import { AttributeFilterElementsSelect } from "./Components/ElementsSelect/AttributeFilterElementsSelect.js";
import { AttributeFilterElementsSelectItem } from "./Components/ElementsSelect/AttributeFilterElementsSelectItem.js";
import { AttributeFilterElementsSelectError } from "./Components/ElementsSelect/AttributeFilterElementsSelectError.js";
import { AttributeFilterElementsSelectLoading } from "./Components/ElementsSelect/AttributeFilterElementsSelectLoading.js";
import { AttributeFilterEmptyResult } from "./Components/ElementsSelect/EmptyResult/AttributeFilterEmptyResult.js";
import { AttributeFilterStatusBar } from "./Components/ElementsSelect/StatusBar/AttributeFilterStatusBar.js";
import { AttributeFilterElementsActions } from "./Components/ElementsSelect/AttributeFilterElementsActions.js";
import { SingleSelectionAttributeFilterElementsSelectItem } from "./Components/ElementsSelect/SingleSelectionAttributeFilterElementsSelectItem.js";
import { SingleSelectionAttributeFilterElementsSelectActions } from "./Components/ElementsSelect/SingleSelectionAttributeFilterElementsActions.js";
import { SingleSelectionAttributeFilterStatusBar } from "./Components/ElementsSelect/StatusBar/SingleSelectionAttributeFilterStatusBar.js";
import { SingleSelectionAttributeFilterDropdownActions } from "./Components/Dropdown/SingleSelectionAttributeFilterDropdownActions.js";

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
    ElementsSelectActionsComponent: AttributeFilterElementsActions,
    EmptyResultComponent: AttributeFilterEmptyResult,
    StatusBarComponent: AttributeFilterStatusBar,
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
