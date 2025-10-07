// (C) 2022-2025 GoodData Corporation

import { useMemo } from "react";

import { invariant } from "ts-invariant";

import {
    IWidget,
    isAttributeMetadataObject,
    isDashboardAttributeFilter,
    isDashboardDateFilterWithDimension,
    objRefToString,
} from "@gooddata/sdk-model";

import { AttributeFilterConfigurationItem } from "./AttributeFilterConfigurationItem.js";
import { DateFilterConfigurationItem } from "./DateFilterConfigurationItem.js";
import { getAttributeByDisplayForm } from "./utils.js";
import { useAttributes } from "../../../../_staging/sharedHooks/useAttributes.js";
import {
    selectAllCatalogAttributesMap,
    selectAllCatalogDateDatasetsMap,
    selectAttributeFilterConfigsDisplayAsLabelMap,
    selectAttributeFilterDisplayFormsMap,
    selectFilterContextFilters,
    useDashboardSelector,
} from "../../../../model/index.js";

interface IFilterConfigurationProps {
    widget: IWidget;
}

export function FilterConfiguration({ widget }: IFilterConfigurationProps) {
    const allFilters = useDashboardSelector(selectFilterContextFilters);
    const dfMap = useDashboardSelector(selectAttributeFilterDisplayFormsMap);
    const attrMap = useDashboardSelector(selectAllCatalogAttributesMap);
    const ddsMap = useDashboardSelector(selectAllCatalogDateDatasetsMap);
    const displayAsLabelMap = useDashboardSelector(selectAttributeFilterConfigsDisplayAsLabelMap);

    const draggableFilters = useMemo(() => {
        return allFilters.filter(
            (f) => isDashboardAttributeFilter(f) || isDashboardDateFilterWithDimension(f),
        );
    }, [allFilters]);

    const attributeFilters = useMemo(() => {
        return draggableFilters.filter(isDashboardAttributeFilter);
    }, [draggableFilters]);

    const displayForms = useMemo(() => {
        return attributeFilters.map((filter) => filter.attributeFilter.displayForm);
    }, [attributeFilters]);

    const { attributes, attributesLoading } = useAttributes(displayForms);

    if (attributesLoading) {
        return <span className={"gd-spinner small s-attribute-filter-configuration-loading"} />;
    }

    if (!attributes && ddsMap.size) {
        return null;
    }

    return (
        <div className="s-attribute-filter-configuration">
            {draggableFilters.map((filter) => {
                if (isDashboardAttributeFilter(filter)) {
                    if (!attributes) {
                        return null;
                    }
                    const displayForm = dfMap.get(filter.attributeFilter.displayForm);
                    invariant(displayForm, "Inconsistent state in AttributeFilterConfiguration");

                    const attributeByDisplayForm = getAttributeByDisplayForm(
                        attributes,
                        displayForm.attribute,
                    );

                    const attribute = attrMap.get(displayForm.attribute) || attributeByDisplayForm;
                    invariant(attribute, "Inconsistent state in AttributeFilterConfiguration");

                    const attributeTitle = isAttributeMetadataObject(attribute)
                        ? attribute.title
                        : attribute.attribute.title;

                    const localIdentifier = filter.attributeFilter.localIdentifier;
                    const displayAsLabel = displayAsLabelMap.get(localIdentifier!);

                    return (
                        <AttributeFilterConfigurationItem
                            key={objRefToString(displayForm.ref)}
                            displayFormRef={displayForm.ref}
                            displayAsLabel={displayAsLabel}
                            title={filter.attributeFilter.title ?? attributeTitle}
                            widget={widget}
                        />
                    );
                } else {
                    return (
                        <DateFilterConfigurationItem
                            key={objRefToString(filter.dateFilter.dataSet!)}
                            dataSetRef={filter.dateFilter.dataSet!}
                            widget={widget}
                        />
                    );
                }
            })}
        </div>
    );
}
