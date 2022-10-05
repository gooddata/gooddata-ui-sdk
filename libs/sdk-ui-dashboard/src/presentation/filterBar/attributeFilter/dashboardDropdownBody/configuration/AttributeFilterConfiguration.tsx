// (C) 2022 GoodData Corporation
import React, { useEffect, useMemo } from "react";
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
import { useConnectingAttributes } from "./hooks/useConnectingAttributes";
import { LoadingComponent } from "@gooddata/sdk-ui";

interface IAttributeFilterConfigurationProps {
    closeHandler: () => void;
    onChange: () => void;
    filterRef?: ObjRef;
    filterByText: string;
    displayValuesAsText: string;
}

export const AttributeFilterConfiguration: React.FC<IAttributeFilterConfigurationProps> = (props) => {
    const { filterRef, filterByText, displayValuesAsText, closeHandler } = props;

    useEffect(() => {
        return () => {
            closeHandler();
        };
    }, [closeHandler]);

    const neighborFilters: IDashboardAttributeFilter[] = useDashboardSelector(
        selectOtherContextAttributeFilters(filterRef),
    );

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
        parents,
        onParentSelect,
        onConnectingAttributeChanged,
        showDisplayFormPicker,
        filterDisplayForms,
        onDisplayFormSelect,
    } = useAttributeFilterParentFiltering();

    const { connectingAttributesLoading, connectingAttributes } = useConnectingAttributes(
        currentFilter.attributeFilter.displayForm,
        neighborFilterDisplayForms,
    );

    if (connectingAttributesLoading) {
        return <LoadingComponent />;
    }

    if (!filterRef || !connectingAttributes) {
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
                connectingAttributes={connectingAttributes}
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
