// (C) 2022 GoodData Corporation
import React from "react";
import { IWidget, objRefToString } from "@gooddata/sdk-model";
import invariant from "ts-invariant";
import {
    selectAllCatalogAttributesMap,
    selectAttributeFilterDisplayFormsMap,
    selectFilterContextAttributeFilters,
    useDashboardSelector,
} from "../../../../model";
import { AttributeFilterConfigurationItem } from "./AttributeFilterConfigurationItem";

interface IAttributeFilterConfigurationProps {
    widget: IWidget;
}

export const AttributeFilterConfiguration: React.FC<IAttributeFilterConfigurationProps> = (props) => {
    const { widget } = props;
    const attributeFilters = useDashboardSelector(selectFilterContextAttributeFilters);
    const dfMap = useDashboardSelector(selectAttributeFilterDisplayFormsMap);
    const attrMap = useDashboardSelector(selectAllCatalogAttributesMap);

    return (
        <div>
            {attributeFilters.map((filter) => {
                const displayForm = dfMap.get(filter.attributeFilter.displayForm);
                invariant(displayForm, "Inconsistent state in AttributeFilterConfiguration");

                const attribute = attrMap.get(displayForm.attribute);
                invariant(attribute, "Inconsistent state in AttributeFilterConfiguration");

                return (
                    <AttributeFilterConfigurationItem
                        key={objRefToString(displayForm.ref)}
                        displayFormRef={displayForm.ref}
                        title={attribute.attribute.title}
                        widget={widget}
                    />
                );
            })}
        </div>
    );
};
