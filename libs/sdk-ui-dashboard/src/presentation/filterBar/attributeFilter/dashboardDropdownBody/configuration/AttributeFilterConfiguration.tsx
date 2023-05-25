// (C) 2022-2023 GoodData Corporation
import React, { useCallback, useEffect, useMemo } from "react";
import { ConfigurationCategory } from "./ConfigurationCategory.js";
import { ConfigurationPanelHeader } from "./ConfigurationPanelHeader.js";

import {
    useDashboardSelector,
    selectOtherContextAttributeFilters,
    selectFilterContextAttributeFilters,
    selectSupportsElementsQueryParentFiltering,
} from "../../../../../model/index.js";
import { IDashboardAttributeFilter, ObjRef } from "@gooddata/sdk-model";
import { ParentFiltersList } from "./parentFilters/ParentFiltersList.js";

import { invariant } from "ts-invariant";
import { AttributeDisplayFormsDropdown } from "./displayForms/AttributeDisplayFormsDropdown.js";
import { useAttributeFilterParentFiltering } from "../../AttributeFilterParentFilteringContext.js";
import { useConnectingAttributes } from "./hooks/useConnectingAttributes.js";
import { LoadingSpinner } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { useAttributes } from "../../../../../_staging/sharedHooks/useAttributes.js";
import { AttributeTitleRenaming } from "./title/AttributeTitleRenaming.js";
import { SelectionMode } from "./selectionMode/SelectionMode.js";

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
}

export const AttributeFilterConfiguration: React.FC<IAttributeFilterConfigurationProps> = (props) => {
    const {
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
    } = props;
    const theme = useTheme();

    useEffect(() => {
        return () => {
            closeHandler();
        };
    }, [closeHandler]);

    const neighborFilters: IDashboardAttributeFilter[] = useDashboardSelector(
        selectOtherContextAttributeFilters(filterRef),
    );
    const isDependentFiltersEnabled = useDashboardSelector(selectSupportsElementsQueryParentFiltering);

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
    } = useAttributeFilterParentFiltering();

    const { connectingAttributesLoading, connectingAttributes } = useConnectingAttributes(
        currentFilter.attributeFilter.displayForm,
        neighborFilterDisplayForms,
    );

    const { attributes, attributesLoading } = useAttributes(neighborFilterDisplayForms);

    const parentsSelected = useCallback(() => {
        return parents.filter((parent) => parent.isSelected).length > 0;
    }, [parents]);

    if (connectingAttributesLoading || attributesLoading) {
        return (
            <div className="gd-loading-equalizer-attribute-filter-config-wrap">
                <LoadingSpinner
                    className="large gd-loading-equalizer-spinner"
                    color={theme?.palette?.complementary?.c9}
                />
            </div>
        );
    }

    if (!filterRef || !connectingAttributes || !attributes) {
        return null;
    }

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
                disabled={parentsSelected()}
            />
            {isDependentFiltersEnabled && parents.length > 0 ? (
                <ConfigurationCategory categoryTitle={filterByText} />
            ) : null}
            <ParentFiltersList
                currentFilterLocalId={currentFilter.attributeFilter.localIdentifier!}
                parents={parents}
                setParents={onParentSelect}
                onConnectingAttributeChanged={onConnectingAttributeChanged}
                connectingAttributes={connectingAttributes}
                attributes={attributes}
                disabled={selectionMode === "single"}
                disabledTooltip={parentFiltersDisabledTooltip}
            />
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
        </div>
    );
};
