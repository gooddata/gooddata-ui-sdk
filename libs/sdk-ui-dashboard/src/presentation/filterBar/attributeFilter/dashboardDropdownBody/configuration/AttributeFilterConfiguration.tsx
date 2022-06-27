// (C) 2022 GoodData Corporation
import React, { useCallback } from "react";
import { useIntl } from "react-intl";
import { DropdownControls } from "../common/DropdownControls";
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
import { useDisplayFormConfiguration } from "./hooks/useDisplayFormConfiguration";
import { useParentsConfiguration } from "./hooks/useParentsConfiguration";
import { AttributeDisplayFormsDropdown } from "./displayForms/AttributeDisplayFormsDropdown";

interface IAttributeFilterConfigurationProps {
    closeHandler: () => void;
    onChange: () => void;
    filterRef?: ObjRef;
}

export const AttributeFilterConfiguration: React.FC<IAttributeFilterConfigurationProps> = (props) => {
    const { closeHandler, filterRef } = props;
    const intl = useIntl();

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
        parentsConfigChanged,
        onConnectingAttributeChanged,
        connectingAttributeChanged,
        onParentFiltersChange,
    } = useParentsConfiguration(neighborFilters, currentFilter);

    const { onDisplayFormSelect, filterDisplayForms, displayFormChanged, onDisplayFormChange } =
        useDisplayFormConfiguration(currentFilter);

    const onConfigurationSave = useCallback(() => {
        onParentFiltersChange();
        onDisplayFormChange();
    }, [onParentFiltersChange, onDisplayFormChange]);

    const showDisplayFormPicker = filterDisplayForms.availableDisplayForms.length > 1;

    if (!filterRef) {
        return null;
    }

    return (
        <div className="s-attribute-filter-dropdown-configuration attribute-filter-dropdown-configuration">
            <ConfigurationPanelHeader />
            {parents.length > 0 && (
                <ConfigurationCategory
                    categoryTitle={intl.formatMessage({ id: "attributesDropdown.filterBy" })}
                />
            )}
            <ParentFiltersList
                currentFilterLocalId={currentFilter.attributeFilter.localIdentifier!}
                parents={parents}
                setParents={onParentSelect}
                onConnectingAttributeChanged={onConnectingAttributeChanged}
            />
            {showDisplayFormPicker && (
                <div className="s-display-form-configuration">
                    <ConfigurationCategory
                        categoryTitle={intl.formatMessage({ id: "attributesDropdown.displayValuesAs" })}
                    />
                    <div className="configuration-panel-body">
                        <AttributeDisplayFormsDropdown
                            displayForms={filterDisplayForms.availableDisplayForms}
                            selectedDisplayForm={filterDisplayForms.selectedDisplayForm}
                            onChange={onDisplayFormSelect}
                        />
                    </div>
                </div>
            )}
            <DropdownControls
                closeHandler={closeHandler}
                isSaveButtonEnabled={parentsConfigChanged || displayFormChanged || connectingAttributeChanged}
                onSave={onConfigurationSave}
            />
        </div>
    );
};
