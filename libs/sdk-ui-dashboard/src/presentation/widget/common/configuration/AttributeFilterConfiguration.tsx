// (C) 2022-2026 GoodData Corporation

import { useMemo } from "react";

import { invariant } from "ts-invariant";

import {
    type IWidget,
    dashboardAttributeFilterItemDisplayForm,
    dashboardAttributeFilterItemTitle,
    isAttributeMetadataObject,
    objRefToString,
} from "@gooddata/sdk-model";

import { AttributeFilterConfigurationItem } from "./AttributeFilterConfigurationItem.js";
import { getAttributeByDisplayForm } from "./utils.js";
import { useAttributeFilterDisplayFormFromMap } from "../../../../_staging/sharedHooks/useAttributeFilterDisplayFormFromMap.js";
import { useAttributes } from "../../../../_staging/sharedHooks/useAttributes.js";
import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import { selectAllCatalogAttributesMap } from "../../../../model/store/catalog/catalogSelectors.js";
import { selectFilterContextAttributeFilterItems } from "../../../../model/store/tabs/filterContext/filterContextSelectors.js";

interface IAttributeFilterConfigurationProps {
    widget: IWidget;
}

export function AttributeFilterConfiguration({ widget }: IAttributeFilterConfigurationProps) {
    const attributeFilters = useDashboardSelector(selectFilterContextAttributeFilterItems);
    const getAttributeFilterDisplayFormFromMap = useAttributeFilterDisplayFormFromMap();
    const attrMap = useDashboardSelector(selectAllCatalogAttributesMap);

    const displayForms = useMemo(() => {
        return attributeFilters.map((filter) => dashboardAttributeFilterItemDisplayForm(filter)!);
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
                const filterDisplayForm = dashboardAttributeFilterItemDisplayForm(filter)!;
                const displayForm = getAttributeFilterDisplayFormFromMap(filterDisplayForm);
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
                        title={dashboardAttributeFilterItemTitle(filter) ?? attributeTitle}
                        widget={widget}
                    />
                );
            })}
        </div>
    );
}
