// (C) 2022-2025 GoodData Corporation

import { useMemo } from "react";

import { invariant } from "ts-invariant";

import { type IWidget, isAttributeMetadataObject, objRefToString } from "@gooddata/sdk-model";

import { AttributeFilterConfigurationItem } from "./AttributeFilterConfigurationItem.js";
import { getAttributeByDisplayForm } from "./utils.js";
import { useAttributeFilterDisplayFormFromMap } from "../../../../_staging/sharedHooks/useAttributeFilterDisplayFormFromMap.js";
import { useAttributes } from "../../../../_staging/sharedHooks/useAttributes.js";
import {
    selectAllCatalogAttributesMap,
    selectFilterContextAttributeFilters,
    useDashboardSelector,
} from "../../../../model/index.js";

interface IAttributeFilterConfigurationProps {
    widget: IWidget;
}

export function AttributeFilterConfiguration({ widget }: IAttributeFilterConfigurationProps) {
    const attributeFilters = useDashboardSelector(selectFilterContextAttributeFilters);
    const getAttributeFilterDisplayFormFromMap = useAttributeFilterDisplayFormFromMap();
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
                const displayForm = getAttributeFilterDisplayFormFromMap(filter.attributeFilter.displayForm);
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
}
