// (C) 2022-2025 GoodData Corporation

import { useCallback, useEffect, useMemo } from "react";

import { type IntlShape } from "react-intl";
import { invariant } from "ts-invariant";

import {
    type DashboardAttributeFilterConfigMode,
    DashboardAttributeFilterConfigModeValues,
    type IDashboardAttributeFilter,
    type ObjRef,
} from "@gooddata/sdk-model";
import { LoadingSpinner } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { ConfigurationCategory } from "./ConfigurationCategory.js";
import { ConfigurationPanelHeader } from "./ConfigurationPanelHeader.js";
import { AttributeDisplayFormsDropdown } from "./displayForms/AttributeDisplayFormsDropdown.js";
import { useAvailableDatasetsForItems } from "./hooks/useAvailableDatasetsForItems.js";
import { useConnectingAttributes } from "./hooks/useConnectingAttributes.js";
import { useValidNeighbourAttributes } from "./hooks/useValidNeighbourAttributes.js";
import { LocalizedLimitValuesConfiguration } from "./limitValues/LimitValuesConfiguration.js";
import { ParentFiltersList } from "./parentFilters/ParentFiltersList.js";
import { SelectionMode } from "./selectionMode/SelectionMode.js";
import { useAttributes } from "../../../../../_staging/sharedHooks/useAttributes.js";
import { useMetricsAndFacts } from "../../../../../_staging/sharedHooks/useMetricsAndFacts.js";
import {
    selectBackendCapabilities,
    selectFilterContextAttributeFilters,
    selectOtherContextAttributeFilters,
    selectSupportsSingleSelectDependentFilters,
    useDashboardSelector,
} from "../../../../../model/index.js";
import { ConfigModeSelect } from "../../../configuration/ConfigurationModeSelect.js";
import { AttributeTitleRenaming } from "../../../configuration/title/AttributeTitleRenaming.js";
import { useAttributeFilterParentFiltering } from "../../AttributeFilterParentFilteringContext.js";

interface IAttributeFilterConfigurationProps {
    closeHandler: () => void;
    filterRef?: ObjRef;
    filterByText: string;
    displayValuesAsText: string;
    titleText: string;
    resetTitleText: string;
    selectionTitleText: string;
    multiSelectionOptionText: string;
    singleSelectionOptionText: string;
    singleSelectionDisabledTooltip: string;
    parentFiltersDisabledTooltip: string;
    intl: IntlShape;
    modeCategoryTitleText: string;
    showConfigModeSection: boolean;
}

export function AttributeFilterConfiguration({
    filterRef,
    filterByText,
    displayValuesAsText,
    titleText,
    resetTitleText,
    selectionTitleText,
    multiSelectionOptionText,
    singleSelectionOptionText,
    singleSelectionDisabledTooltip,
    parentFiltersDisabledTooltip,
    closeHandler,
    intl,
    modeCategoryTitleText,
    showConfigModeSection,
}: IAttributeFilterConfigurationProps) {
    const theme = useTheme();

    useEffect(() => {
        return () => {
            closeHandler();
        };
    }, [closeHandler]);

    const neighborFilters: IDashboardAttributeFilter[] = useDashboardSelector(
        selectOtherContextAttributeFilters(filterRef),
    );
    const supportsSingleSelectDependentFilters = useDashboardSelector(
        selectSupportsSingleSelectDependentFilters,
    );
    const capabilities = useDashboardSelector(selectBackendCapabilities);
    const showDependentFiltersConfiguration = !capabilities.supportsAttributeFilterElementsLimiting;

    const neighborFilterDisplayForms = useMemo(() => {
        return neighborFilters.map((filter) => filter.attributeFilter.displayForm);
    }, [neighborFilters]);

    const currentFilter = useDashboardSelector(selectFilterContextAttributeFilters).find((filter) =>
        neighborFilters.every(
            (neighborFilter) =>
                filter.attributeFilter.localIdentifier !== neighborFilter.attributeFilter.localIdentifier,
        ),
    );

    invariant(currentFilter, "Cannot find current filter in the filter context store.");

    const {
        title,
        defaultAttributeFilterTitle,
        parents,
        onParentSelect,
        onConnectingAttributeChanged,
        showDisplayFormPicker,
        filterDisplayForms,
        onDisplayFormSelect,
        showResetTitle,
        onTitleUpdate,
        onTitleReset,
        selectionMode,
        onSelectionModeUpdate,
        mode,
        onModeUpdate,
        limitingItems,
        onLimitingItemsUpdate,
        availableDatasetsForFilter,
        dependentDateFilters,
        dependentCommonDateFilter,
        onDependentDateFiltersSelect,
    } = useAttributeFilterParentFiltering();

    const disableParentFiltersList = selectionMode === "single" && !supportsSingleSelectDependentFilters;

    const { connectingAttributesLoading, connectingAttributes } = useConnectingAttributes(
        currentFilter.attributeFilter.displayForm,
        neighborFilterDisplayForms,
    );

    const { availableDatasetsForItemsLoading, availableDatasetForItems } =
        useAvailableDatasetsForItems(availableDatasetsForFilter);

    const { validNeighbourAttributesLoading, validNeighbourAttributes } = useValidNeighbourAttributes(
        filterDisplayForms.selectedDisplayForm,
        neighborFilterDisplayForms,
    );

    const { attributes, attributesLoading } = useAttributes(neighborFilterDisplayForms);
    const { metricsAndFacts, metricsAndFactsLoading } = useMetricsAndFacts();

    const getIsSelectionDisabled = useCallback(() => {
        if (supportsSingleSelectDependentFilters) {
            return false;
        }

        return parents.filter((parent) => parent.isSelected).length > 0;
    }, [parents, supportsSingleSelectDependentFilters]);

    if (
        connectingAttributesLoading ||
        attributesLoading ||
        validNeighbourAttributesLoading ||
        metricsAndFactsLoading ||
        availableDatasetsForItemsLoading
    ) {
        return (
            <div className="gd-loading-equalizer-attribute-filter-config-wrap">
                <LoadingSpinner
                    className="large gd-loading-equalizer-spinner"
                    color={theme?.palette?.complementary?.c9}
                />
            </div>
        );
    }

    if (
        !filterRef ||
        !connectingAttributes ||
        !validNeighbourAttributes ||
        !attributes ||
        !availableDatasetForItems
    ) {
        return null;
    }

    const handleModeChanged = (value: string) => {
        onModeUpdate(value as DashboardAttributeFilterConfigMode);
    };

    return (
        <div className="s-attribute-filter-dropdown-configuration attribute-filter-dropdown-configuration sdk-edit-mode-on">
            <ConfigurationPanelHeader />
            <AttributeTitleRenaming
                categoryTitle={titleText}
                resetTitleText={resetTitleText}
                onClick={onTitleReset}
                onChange={onTitleUpdate}
                showResetTitle={showResetTitle}
                attributeTitle={title ?? defaultAttributeFilterTitle}
            />
            <SelectionMode
                selectionTitleText={selectionTitleText}
                multiSelectionOptionText={multiSelectionOptionText}
                singleSelectionOptionText={singleSelectionOptionText}
                singleSelectionDisabledTooltip={singleSelectionDisabledTooltip}
                selectionMode={selectionMode}
                onSelectionModeChange={onSelectionModeUpdate}
                disabled={getIsSelectionDisabled()}
            />
            <LocalizedLimitValuesConfiguration
                attributeTitle={title ?? defaultAttributeFilterTitle}
                parentFilters={parents}
                validParentFilters={validNeighbourAttributes}
                validateElementsBy={limitingItems}
                onLimitingItemUpdate={onLimitingItemsUpdate}
                onParentFilterUpdate={onParentSelect}
                onDependentDateFilterUpdate={onDependentDateFiltersSelect}
                metricsAndFacts={metricsAndFacts!}
                intl={intl}
                availableDatasets={availableDatasetForItems}
                dependentDateFilters={dependentDateFilters}
                dependentCommonDateFilter={dependentCommonDateFilter}
            />
            {showDependentFiltersConfiguration && parents.length > 0 ? (
                <>
                    <ConfigurationCategory categoryTitle={filterByText} />
                    <ParentFiltersList
                        currentFilterLocalId={currentFilter.attributeFilter.localIdentifier!}
                        parents={parents}
                        setParents={onParentSelect}
                        onConnectingAttributeChanged={onConnectingAttributeChanged}
                        connectingAttributes={connectingAttributes}
                        attributes={attributes}
                        disabled={disableParentFiltersList}
                        disabledTooltip={parentFiltersDisabledTooltip}
                        validParents={validNeighbourAttributes}
                    />
                </>
            ) : null}
            {showDisplayFormPicker ? (
                <div className="s-display-form-configuration">
                    <ConfigurationCategory categoryTitle={displayValuesAsText} />
                    <div className="configuration-panel-body">
                        <AttributeDisplayFormsDropdown
                            displayForms={filterDisplayForms.availableDisplayForms}
                            selectedDisplayForm={filterDisplayForms.selectedDisplayForm}
                            onChange={onDisplayFormSelect}
                        />
                    </div>
                </div>
            ) : null}
            {showConfigModeSection ? (
                <>
                    <ConfigurationCategory categoryTitle={modeCategoryTitleText} />
                    <ConfigModeSelect
                        intl={intl}
                        selectedMode={mode ?? DashboardAttributeFilterConfigModeValues.ACTIVE}
                        onChanged={handleModeChanged}
                    />
                </>
            ) : null}
        </div>
    );
}
