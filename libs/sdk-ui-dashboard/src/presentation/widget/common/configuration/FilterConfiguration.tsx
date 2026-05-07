// (C) 2022-2026 GoodData Corporation

import { useMemo } from "react";

import { invariant } from "ts-invariant";

import {
    type IWidget,
    dashboardAttributeFilterItemDisplayForm,
    dashboardAttributeFilterItemLocalIdentifier,
    dashboardAttributeFilterItemTitle,
    isAttributeMetadataObject,
    isDashboardAttributeFilterItem,
    isDashboardDateFilterWithDimension,
    isDashboardMeasureValueFilter,
    objRefToString,
} from "@gooddata/sdk-model";

import { useAttributeFilterDisplayFormFromMap } from "../../../../_staging/sharedHooks/useAttributeFilterDisplayFormFromMap.js";
import { useAttributes } from "../../../../_staging/sharedHooks/useAttributes.js";
import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import {
    selectAllCatalogAttributesMap,
    selectAllCatalogDateDatasetsMap,
    selectAllCatalogMeasuresMap,
} from "../../../../model/store/catalog/catalogSelectors.js";
import { selectAttributeFilterConfigsDisplayAsLabelMap } from "../../../../model/store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import { selectFilterContextFilters } from "../../../../model/store/tabs/filterContext/filterContextSelectors.js";
import { AttributeFilterConfigurationItem } from "./AttributeFilterConfigurationItem.js";
import { DateFilterConfigurationItem } from "./DateFilterConfigurationItem.js";
import { MeasureValueFilterConfigurationItem } from "./MeasureValueFilterConfigurationItem.js";
import { useMeasureValueFilterCompatibility } from "./useMeasureValueFilterCompatibility.js";
import { getAttributeByDisplayForm } from "./utils.js";

interface IFilterConfigurationProps {
    widget: IWidget;
}

export function FilterConfiguration({ widget }: IFilterConfigurationProps) {
    const allFilters = useDashboardSelector(selectFilterContextFilters);
    const getAttributeFilterDisplayFormFromMap = useAttributeFilterDisplayFormFromMap();
    const attrMap = useDashboardSelector(selectAllCatalogAttributesMap);
    const ddsMap = useDashboardSelector(selectAllCatalogDateDatasetsMap);
    const measureMap = useDashboardSelector(selectAllCatalogMeasuresMap);
    const displayAsLabelMap = useDashboardSelector(selectAttributeFilterConfigsDisplayAsLabelMap);

    const draggableFilters = useMemo(() => {
        return allFilters.filter(
            (f) =>
                isDashboardAttributeFilterItem(f) ||
                isDashboardDateFilterWithDimension(f) ||
                isDashboardMeasureValueFilter(f),
        );
    }, [allFilters]);

    const attributeFilters = useMemo(() => {
        return draggableFilters.filter(isDashboardAttributeFilterItem);
    }, [draggableFilters]);

    const displayForms = useMemo(() => {
        return attributeFilters.map((filter) => dashboardAttributeFilterItemDisplayForm(filter));
    }, [attributeFilters]);

    const { attributes, attributesLoading } = useAttributes(displayForms);
    const measureValueFilters = useMemo(
        () => draggableFilters.filter(isDashboardMeasureValueFilter),
        [draggableFilters],
    );
    const { isCompatible } = useMeasureValueFilterCompatibility(widget, measureValueFilters);

    if (attributesLoading) {
        return <span className={"gd-spinner small s-attribute-filter-configuration-loading"} />;
    }

    if (!attributes && ddsMap.size) {
        return null;
    }

    return (
        <div className="s-attribute-filter-configuration">
            {draggableFilters.map((filter) => {
                if (isDashboardAttributeFilterItem(filter)) {
                    if (!attributes) {
                        return null;
                    }
                    const filterDisplayForm = dashboardAttributeFilterItemDisplayForm(filter);
                    const displayForm = getAttributeFilterDisplayFormFromMap(filterDisplayForm);
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

                    const localIdentifier = dashboardAttributeFilterItemLocalIdentifier(filter);
                    const displayAsLabel = localIdentifier
                        ? displayAsLabelMap.get(localIdentifier)
                        : undefined;

                    return (
                        <AttributeFilterConfigurationItem
                            key={objRefToString(displayForm.ref)}
                            displayFormRef={displayForm.ref}
                            displayAsLabel={displayAsLabel}
                            title={dashboardAttributeFilterItemTitle(filter) ?? attributeTitle}
                            widget={widget}
                        />
                    );
                } else if (isDashboardDateFilterWithDimension(filter)) {
                    return (
                        <DateFilterConfigurationItem
                            key={objRefToString(filter.dateFilter.dataSet!)}
                            dataSetRef={filter.dateFilter.dataSet!}
                            widget={widget}
                        />
                    );
                } else if (isDashboardMeasureValueFilter(filter)) {
                    const { measure, localIdentifier, title } = filter.dashboardMeasureValueFilter;
                    const measureTitle = title ?? measureMap.get(measure)?.measure.title ?? "";

                    return (
                        <MeasureValueFilterConfigurationItem
                            key={localIdentifier}
                            measureRef={measure}
                            title={measureTitle}
                            widget={widget}
                            isCompatible={isCompatible(measure)}
                        />
                    );
                } else {
                    console.warn("Unsupported filter type in FilterConfiguration.", filter);
                    return null;
                }
            })}
        </div>
    );
}
