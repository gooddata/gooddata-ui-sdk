// (C) 2022-2023 GoodData Corporation
import React, { useMemo } from "react";
import { isAttributeMetadataObject, IWidget, objRefToString } from "@gooddata/sdk-model";
import { invariant } from "ts-invariant";
import {
    selectAllCatalogAttributesMap,
    selectAttributeFilterDisplayFormsMap,
    selectFilterContextAttributeFilters,
    useDashboardSelector,
} from "../../../../model/index.js";
import { AttributeFilterConfigurationItem } from "./AttributeFilterConfigurationItem.js";
import { getAttributeByDisplayForm } from "./utils.js";
import { useAttributes } from "../../../../_staging/sharedHooks/useAttributes.js";

interface IAttributeFilterConfigurationProps {
    widget: IWidget;
}

export const AttributeFilterConfiguration: React.FC<IAttributeFilterConfigurationProps> = (props) => {
    const { widget } = props;
    const attributeFilters = useDashboardSelector(selectFilterContextAttributeFilters);
    const dfMap = useDashboardSelector(selectAttributeFilterDisplayFormsMap);
    const attrMap = useDashboardSelector(selectAllCatalogAttributesMap);

    const displayForms = useMemo(() => {
        return attributeFilters.map((filter) => filter.attributeFilter.displayForm);
    }, [attributeFilters]);

    const { attributes, attributesLoading } = useAttributes(displayForms);

    if (attributesLoading) {
        return <span className={"gd-spinner small s-attribute-filter-configuration-loading"} />;
    }

    if (!attributes) {
        return null;
    }

    return (
        <div className="s-attribute-filter-configuration">
            {attributeFilters.map((filter) => {
                const displayForm = dfMap.get(filter.attributeFilter.displayForm);
                invariant(displayForm, "Inconsistent state in AttributeFilterConfiguration");

                const attributeByDisplayForm = getAttributeByDisplayForm(attributes, displayForm.attribute);

                const attribute = attrMap.get(displayForm.attribute) || attributeByDisplayForm;
                invariant(attribute, "Inconsistent state in AttributeFilterConfiguration");

                const attributeTitle = isAttributeMetadataObject(attribute)
                    ? attribute.title
                    : attribute.attribute.title;

                return (
                    <AttributeFilterConfigurationItem
                        key={objRefToString(displayForm.ref)}
                        displayFormRef={displayForm.ref}
                        title={filter.attributeFilter.title ?? attributeTitle}
                        widget={widget}
                    />
                );
            })}
        </div>
    );
};
