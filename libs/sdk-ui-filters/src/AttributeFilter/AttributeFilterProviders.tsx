// (C) 2021-2026 GoodData Corporation

import { type ReactNode } from "react";

import { IntlWrapper } from "@gooddata/sdk-ui";

import { getAttributeFilterDefaultComponents } from "./AttributeFilterDefaultComponents.js";
import { AttributeFilterComponentsProvider } from "./Context/AttributeFilterComponentsContext.js";
import { AttributeFilterContextProvider } from "./Context/AttributeFilterContext.js";
import { type IAttributeFilterBaseProps } from "./types.js";

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
        withoutApply = false,
        overlayPositionType,
        alignPoints,
        menuConfig,
        hideTooltips,
        showHeader,
        onApply,
        onChange,
        onSelect,
        onError,
        onInitLoadingChanged,
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
        FilterMenuComponent,
        TextFilterBodyComponent,
        enableImmediateAttributeFilterDisplayAsLabelMigration = false,
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
                FilterMenuComponent={FilterMenuComponent ?? DefaultComponents.FilterMenuComponent}
                TextFilterBodyComponent={TextFilterBodyComponent ?? DefaultComponents.TextFilterBodyComponent}
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
                    onChange={onChange ?? onSelect}
                    onError={onError}
                    onInitLoadingChanged={onInitLoadingChanged}
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
                    withoutApply={withoutApply}
                    overlayPositionType={overlayPositionType}
                    alignPoints={alignPoints}
                    menuConfig={menuConfig}
                    hideTooltips={hideTooltips}
                    showHeader={showHeader}
                >
                    {children}
                </AttributeFilterContextProvider>
            </AttributeFilterComponentsProvider>
        </IntlWrapper>
    );
}
