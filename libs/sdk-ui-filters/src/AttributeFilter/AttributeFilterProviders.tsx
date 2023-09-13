// (C) 2021-2023 GoodData Corporation
import React from "react";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { AttributeFilterComponentsProvider } from "./Context/AttributeFilterComponentsContext.js";
import { AttributeFilterContextProvider } from "./Context/AttributeFilterContext.js";
import { IAttributeFilterBaseProps } from "./types.js";
import { getAttributeFilterDefaultComponents } from "./AttributeFilterDefaultComponents.js";

/**
 * @internal
 */
export const AttributeFilterProviders: React.FC<IAttributeFilterBaseProps & { children: React.ReactNode }> = (
    props,
) => {
    const {
        resetOnParentFilterChange = true,
        children,
        locale,
        backend,
        workspace,
        title,
        filter,
        connectToPlaceholder,
        parentFilters,
        parentFilterOverAttribute,
        hiddenElements,
        staticElements,
        fullscreenOnMobile = false,
        selectionMode = "multi",
        selectFirst = false,
        attribute,
        onApply,
        onError,
        ErrorComponent,
        LoadingComponent,
        DropdownButtonComponent,
        DropdownBodyComponent,
        DropdownActionsComponent,
        ElementsSearchBarComponent,
        ElementsSelectComponent,
        ElementsSelectItemComponent,
        ElementsSelectErrorComponent,
        ElementsSelectLoadingComponent,
        ElementsSelectActionsComponent,
        EmptyResultComponent,
        StatusBarComponent,
    } = props;

    const DefaultComponents = getAttributeFilterDefaultComponents(props);

    return (
        <IntlWrapper locale={locale}>
            <AttributeFilterComponentsProvider
                ErrorComponent={ErrorComponent ?? DefaultComponents.ErrorComponent}
                LoadingComponent={LoadingComponent ?? DefaultComponents.LoadingComponent}
                DropdownButtonComponent={DropdownButtonComponent ?? DefaultComponents.DropdownButtonComponent}
                DropdownBodyComponent={DropdownBodyComponent ?? DefaultComponents.DropdownBodyComponent}
                DropdownActionsComponent={
                    DropdownActionsComponent ?? DefaultComponents.DropdownActionsComponent
                }
                ElementsSearchBarComponent={
                    ElementsSearchBarComponent ?? DefaultComponents.ElementsSearchBarComponent
                }
                ElementsSelectComponent={ElementsSelectComponent ?? DefaultComponents.ElementsSelectComponent}
                ElementsSelectItemComponent={
                    ElementsSelectItemComponent ?? DefaultComponents.ElementsSelectItemComponent
                }
                ElementsSelectErrorComponent={
                    ElementsSelectErrorComponent ?? DefaultComponents.ElementsSelectErrorComponent
                }
                ElementsSelectLoadingComponent={
                    ElementsSelectLoadingComponent ?? DefaultComponents.ElementsSelectLoadingComponent
                }
                ElementsSelectActionsComponent={
                    ElementsSelectActionsComponent ?? DefaultComponents.ElementsSelectActionsComponent
                }
                EmptyResultComponent={EmptyResultComponent ?? DefaultComponents.EmptyResultComponent}
                StatusBarComponent={StatusBarComponent ?? DefaultComponents.StatusBarComponent}
            >
                <AttributeFilterContextProvider
                    attribute={attribute}
                    backend={backend}
                    workspace={workspace}
                    title={title}
                    filter={filter}
                    connectToPlaceholder={connectToPlaceholder}
                    resetOnParentFilterChange={resetOnParentFilterChange}
                    parentFilters={parentFilters}
                    parentFilterOverAttribute={parentFilterOverAttribute}
                    onApply={onApply}
                    onError={onError}
                    hiddenElements={hiddenElements}
                    staticElements={staticElements}
                    fullscreenOnMobile={fullscreenOnMobile}
                    selectionMode={selectionMode}
                    selectFirst={selectFirst}
                >
                    {children}
                </AttributeFilterContextProvider>
            </AttributeFilterComponentsProvider>
        </IntlWrapper>
    );
};
