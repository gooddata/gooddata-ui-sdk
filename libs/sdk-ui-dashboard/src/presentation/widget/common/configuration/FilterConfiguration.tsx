// (C) 2022-2023 GoodData Corporation
import React, { useMemo } from "react";
import {
    isAttributeMetadataObject,
    isDashboardAttributeFilter,
    isDashboardDateFilterWithDimension,
    IWidget,
    objRefToString,
} from "@gooddata/sdk-model";
import { invariant } from "ts-invariant";
import {
    selectAllCatalogAttributesMap,
    selectAllCatalogDateDatasetsMap,
    selectAttributeFilterDisplayFormsMap,
    selectFilterContextFilters,
    useDashboardSelector,
} from "../../../../model/index.js";
import { AttributeFilterConfigurationItem } from "./AttributeFilterConfigurationItem.js";
import { DateFilterConfigurationItem } from "./DateFilterConfigurationItem.js";
import { getAttributeByDisplayForm } from "./utils.js";
import { useAttributes } from "../../../../_staging/sharedHooks/useAttributes.js";

interface IFilterConfigurationProps {
    widget: IWidget;
}

export const FilterConfiguration: React.FC<IFilterConfigurationProps> = (props) => {
    const { widget } = props;
    const allFilters = useDashboardSelector(selectFilterContextFilters);
    const dfMap = useDashboardSelector(selectAttributeFilterDisplayFormsMap);
    const attrMap = useDashboardSelector(selectAllCatalogAttributesMap);
    const ddsMap = useDashboardSelector(selectAllCatalogDateDatasetsMap);

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

                    return (
                        <AttributeFilterConfigurationItem
                            key={objRefToString(displayForm.ref)}
                            displayFormRef={displayForm.ref}
                            title={filter.attributeFilter.title ?? attributeTitle}
                            widget={widget}
                        />
                    );
                } else if (isDashboardDateFilterWithDimension(filter)) {
                    const dateDataSetTitle = ddsMap.get(filter.dateFilter.dataSet!)?.dataSet.title;
                    return (
                        <DateFilterConfigurationItem
                            key={objRefToString(filter.dateFilter.dataSet!)}
                            dataSetRef={filter.dateFilter.dataSet!}
                            title={dateDataSetTitle || "Date"}
                            widget={widget}
                        />
                    );
                }
            })}
        </div>
    );
};
