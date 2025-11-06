// (C) 2021-2025 GoodData Corporation

import { ReactNode } from "react";

import { IntlWrapper } from "@gooddata/sdk-ui";

import { getAttributeFilterDefaultComponents } from "./AttributeFilterDefaultComponents.js";
import { AttributeFilterComponentsProvider } from "./Context/AttributeFilterComponentsContext.js";
import { AttributeFilterContextProvider } from "./Context/AttributeFilterContext.js";
import { IAttributeFilterBaseProps } from "./types.js";

/**
 * @internal
 */
export function AttributeFilterProviders(props: IAttributeFilterBaseProps & { children: ReactNode }) {
    const {
        resetOnParentFilterChange = true,
        children,
        locale,
        backend,
        workspace,
        title,
        filter,
        workingFilter,
        displayAsLabel,
        connectToPlaceholder,
        parentFilters,
        dependentDateFilters,
        parentFilterOverAttribute,
        validateElementsBy,
        hiddenElements,
        staticElements,
        fullscreenOnMobile = false,
        selectionMode = "multi",
        selectFirst = false,
        disabled,
        customIcon,
        withoutApply,
        overlayPositionType,
        onApply,
        onSelect,
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
        enableImmediateAttributeFilterDisplayAsLabelMigration = false,
        enableDashboardFiltersApplyWithoutLoading = false,
        enableDashboardFiltersApplyModes = false,
        enablePreserveSelectionDuringInit,
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
                    backend={backend}
                    workspace={workspace}
                    title={title}
                    filter={filter}
                    workingFilter={workingFilter}
                    displayAsLabel={displayAsLabel}
                    connectToPlaceholder={connectToPlaceholder}
                    resetOnParentFilterChange={resetOnParentFilterChange}
                    parentFilters={parentFilters}
                    dependentDateFilters={dependentDateFilters}
                    parentFilterOverAttribute={parentFilterOverAttribute}
                    validateElementsBy={validateElementsBy}
                    onApply={onApply}
                    onSelect={onSelect}
                    onError={onError}
                    hiddenElements={hiddenElements}
                    staticElements={staticElements}
                    fullscreenOnMobile={fullscreenOnMobile}
                    selectionMode={selectionMode}
                    selectFirst={selectFirst}
                    disabled={disabled}
                    customIcon={customIcon}
                    enableImmediateAttributeFilterDisplayAsLabelMigration={
                        enableImmediateAttributeFilterDisplayAsLabelMigration
                    }
                    withoutApply={withoutApply ?? enableDashboardFiltersApplyModes}
                    overlayPositionType={overlayPositionType}
                    enableDashboardFiltersApplyWithoutLoading={enableDashboardFiltersApplyWithoutLoading}
                    enablePreserveSelectionDuringInit={enablePreserveSelectionDuringInit}
                >
                    {children}
                </AttributeFilterContextProvider>
            </AttributeFilterComponentsProvider>
        </IntlWrapper>
    );
}
