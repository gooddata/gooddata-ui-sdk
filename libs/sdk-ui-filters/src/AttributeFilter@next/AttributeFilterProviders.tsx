// (C) 2021-2022 GoodData Corporation
import React from "react";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { AttributeFilterComponentsProvider } from "./Context/AttributeFilterComponentsContext";
import { AttributeFilterContextProvider } from "./Context/AttributeFilterContext";
import { IAttributeFilterBaseProps } from "./types";
import { AttributeFilterDefaultComponents as DefaultComponents } from "./AttributeFilterDefaultComponents";

/**
 * @internal
 */
export const AttributeFilterProviders: React.FC<IAttributeFilterBaseProps & { children: React.ReactNode }> = (
    props,
) => {
    const {
        children,
        locale,
        backend,
        workspace,
        title,
        filter,
        connectToPlaceholder,
        identifier,
        parentFilters,
        parentFilterOverAttribute,
        hiddenElements,
        staticElements,
        fullscreenOnMobile = false,
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
        EmptyResultComponent,
        StatusBarComponent,
    } = props;

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
                EmptyResultComponent={EmptyResultComponent ?? DefaultComponents.EmptyResultComponent}
                StatusBarComponent={StatusBarComponent ?? DefaultComponents.StatusBarComponent}
            >
                <AttributeFilterContextProvider
                    backend={backend}
                    workspace={workspace}
                    title={title}
                    filter={filter}
                    connectToPlaceholder={connectToPlaceholder}
                    identifier={identifier}
                    parentFilters={parentFilters}
                    parentFilterOverAttribute={parentFilterOverAttribute}
                    onApply={onApply}
                    onError={onError}
                    hiddenElements={hiddenElements}
                    staticElements={staticElements}
                    fullscreenOnMobile={fullscreenOnMobile}
                >
                    {children}
                </AttributeFilterContextProvider>
            </AttributeFilterComponentsProvider>
        </IntlWrapper>
    );
};
