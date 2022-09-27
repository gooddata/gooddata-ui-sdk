// (C) 2022 GoodData Corporation
import React from "react";
import { ConfigurationCategory } from "./ConfigurationCategory";
import { ConfigurationPanelHeader } from "./ConfigurationPanelHeader";

import {
    useDashboardSelector,
    selectOtherContextAttributeFilters,
    selectFilterContextAttributeFilters,
} from "../../../../../model";
import { IDashboardAttributeFilter, ObjRef } from "@gooddata/sdk-model";
import { ParentFiltersList } from "./parentFilters/ParentFiltersList";

import invariant from "ts-invariant";
import { AttributeDisplayFormsDropdown } from "./displayForms/AttributeDisplayFormsDropdown";
import { useAttributeFilterParentFiltering } from "../../AttributeFilterParentFilteringContext";

interface IAttributeFilterConfigurationProps {
    closeHandler: () => void;
    onChange: () => void;
    filterRef?: ObjRef;
    filterByText: string;
    displayValuesAsText: string;
}

export const AttributeFilterConfiguration: React.FC<IAttributeFilterConfigurationProps> = (props) => {
    const { filterRef, filterByText, displayValuesAsText } = props;

    const neighborFilters: IDashboardAttributeFilter[] = useDashboardSelector(
        selectOtherContextAttributeFilters(filterRef),
    );

    const currentFilter = useDashboardSelector(selectFilterContextAttributeFilters).find((filter) =>
        neighborFilters.every(
            (neighborFilter) =>
                filter.attributeFilter.localIdentifier !== neighborFilter.attributeFilter.localIdentifier,
        ),
    );

    invariant(currentFilter, "Cannot find current filter in the filter context store.");

    const {
        parents,
        onParentSelect,
        onConnectingAttributeChanged,
        showDisplayFormPicker,
        filterDisplayForms,
        onDisplayFormSelect,
    } = useAttributeFilterParentFiltering();

    if (!filterRef) {
        return null;
    }

    return (
        <div className="s-attribute-filter-dropdown-configuration attribute-filter-dropdown-configuration">
            <ConfigurationPanelHeader />
            {parents.length > 0 && <ConfigurationCategory categoryTitle={filterByText} />}
            <ParentFiltersList
                currentFilterLocalId={currentFilter.attributeFilter.localIdentifier!}
                parents={parents}
                setParents={onParentSelect}
                onConnectingAttributeChanged={onConnectingAttributeChanged}
            />
            {showDisplayFormPicker && (
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
            )}
        </div>
    );
};
