// (C) 2024 GoodData Corporation

import { useMemo } from "react";
import {
    ObjRef,
    ICatalogAttribute,
    isIdentifierRef,
    areObjRefsEqual,
    IAttributeDisplayFormMetadataObject,
    ICatalogDateDataset,
    IDashboardDateFilterConfigItem,
    IDashboardDateFilterConfig,
} from "@gooddata/sdk-model";

import { ValuesLimitingItem } from "../../../../types.js";
import {
    useDashboardSelector,
    selectCatalogAttributes,
    selectAllCatalogDisplayFormsMap,
    IDashboardAttributeFilterParentItem,
    IMetricsAndFacts,
    selectCatalogMeasures,
    selectCatalogFacts,
    IDashboardDependentDateFilter,
    selectAllCatalogDateDatasetsMap,
    selectDateFilterConfigOverrides,
    selectDateFilterConfigsOverrides,
} from "../../../../../../../model/index.js";
import { ObjRefMap } from "../../../../../../../_staging/metadata/objRefMap.js";
import { IntlShape } from "react-intl";

export interface IValuesLimitingItemWithTitle {
    title?: string;
    item: ValuesLimitingItem;
    isDisabled?: boolean;
    type?: string;
}

const findAttributeByLabel = (
    labelRef: ObjRef,
    labels: ObjRefMap<IAttributeDisplayFormMetadataObject>,
    attributes: ICatalogAttribute[],
) => {
    const attributeRef = labels.get(labelRef)?.attribute;
    return attributes.find((attribute) => areObjRefsEqual(attribute.attribute.ref, attributeRef));
};

const findTitleForParentFilter = (
    parentFilter: IDashboardAttributeFilterParentItem,
    labels: ObjRefMap<IAttributeDisplayFormMetadataObject>,
    attributes: ICatalogAttribute[],
) =>
    parentFilter.title ?? findAttributeByLabel(parentFilter.displayForm, labels, attributes)?.attribute.title;

const findTitleForCatalogItem = (
    item: ObjRef,
    { metrics, facts }: IMetricsAndFacts,
    attributes: ICatalogAttribute[],
) => {
    if (!isIdentifierRef(item)) {
        return undefined;
    }
    if (item.type === "measure") {
        return metrics.find((metric) => areObjRefsEqual(metric.measure.ref, item))?.measure.title;
    }
    if (item.type === "fact") {
        return facts.find((fact) => areObjRefsEqual(fact.fact.ref, item))?.fact.title;
    }
    if (item.type === "attribute") {
        return attributes.find((attribute) => areObjRefsEqual(attribute.attribute.ref, item))?.attribute
            .title;
    }
    return undefined;
};

// put items with undefined titles at the end of the particular list's subgroup
const compareOptionalTitles = (titleA?: string, titleB?: string): number => {
    if (titleA === undefined) {
        return 1;
    }
    if (titleB === undefined) {
        return -1;
    }
    return titleA.localeCompare(titleB);
};

const getTypeOrder = (item: ValuesLimitingItem): number => {
    if (!isIdentifierRef(item)) {
        return 0;
    }
    switch (item.type) {
        case "measure":
            return 1;
        case "attribute":
            return 2;
        case "fact":
            return 3;
        default:
            return 0;
    }
};

export const sortByTypeAndTitle = (
    a: IValuesLimitingItemWithTitle,
    b: IValuesLimitingItemWithTitle,
): number => {
    const refTypeComparison = getTypeOrder(a.item) - getTypeOrder(b.item);
    if (refTypeComparison !== 0) {
        return refTypeComparison;
    }
    return compareOptionalTitles(a.title, b.title);
};

const mapParentFilters = (
    parentFilters: IDashboardAttributeFilterParentItem[],
    validParentFilters: ObjRef[],
    labels: ObjRefMap<IAttributeDisplayFormMetadataObject>,
    attributes: ICatalogAttribute[],
    isSelected: boolean,
): IValuesLimitingItemWithTitle[] =>
    parentFilters
        .filter((item) => item.isSelected === isSelected)
        .map((item) => {
            const isDisabled = !validParentFilters.some((validParent) =>
                areObjRefsEqual(validParent, item.displayForm),
            );
            return {
                title: findTitleForParentFilter(item, labels, attributes),
                item,
                isDisabled,
            };
        });

export const useLimitingItems = (
    parentFilters: IDashboardAttributeFilterParentItem[],
    validParentFilters: ObjRef[],
    validateElementsBy: ObjRef[],
    metricsAndFacts: IMetricsAndFacts,
): IValuesLimitingItemWithTitle[] => {
    const attributes = useDashboardSelector(selectCatalogAttributes);
    const labels = useDashboardSelector(selectAllCatalogDisplayFormsMap);

    return useMemo(() => {
        const selectedParentFilterItems: IValuesLimitingItemWithTitle[] = mapParentFilters(
            parentFilters,
            validParentFilters,
            labels,
            attributes,
            true,
        );
        const validationItems =
            validateElementsBy.map((item) => ({
                title: findTitleForCatalogItem(item, metricsAndFacts, attributes),
                item,
            })) ?? [];
        return [...selectedParentFilterItems, ...validationItems].sort(sortByTypeAndTitle);
    }, [parentFilters, validParentFilters, validateElementsBy, attributes, labels, metricsAndFacts]);
};

export const useSearchableLimitingItems = (
    currentlySelectedItems: ObjRef[],
): IValuesLimitingItemWithTitle[] => {
    const attributes = useDashboardSelector(selectCatalogAttributes);
    const measures = useDashboardSelector(selectCatalogMeasures);
    const facts = useDashboardSelector(selectCatalogFacts);

    return useMemo(() => {
        const metricsWithTitles = measures.map((measure) => ({
            title: measure.measure.title,
            item: measure.measure.ref,
        }));
        const factsWithTitles = facts.map((fact) => ({
            title: fact.fact.title,
            item: fact.fact.ref,
        }));
        const attributesWithTitles = attributes.map((attribute) => ({
            title: attribute.attribute.title,
            item: attribute.attribute.ref,
        }));
        return [...metricsWithTitles, ...factsWithTitles, ...attributesWithTitles]
            .filter((item) => !currentlySelectedItems.includes(item.item))
            .sort(sortByTypeAndTitle);
    }, [currentlySelectedItems, measures, facts, attributes]);
};

export const useFilterItems = (
    parentFilters: IDashboardAttributeFilterParentItem[],
    validParentFilters: ObjRef[],
    dependentDateFilters: IDashboardDependentDateFilter[],
    availableDatasets: ICatalogDateDataset[],
    isEnabledKDAttributeFilterDatesValidation: boolean,
    isSelected: boolean,
    intl: IntlShape,
): IValuesLimitingItemWithTitle[] => {
    const labels = useDashboardSelector(selectAllCatalogDisplayFormsMap);
    const attributes = useDashboardSelector(selectCatalogAttributes);
    const dateDataSetsMap = useDashboardSelector(selectAllCatalogDateDatasetsMap);
    const filterConfig = useDashboardSelector(selectDateFilterConfigOverrides);
    const filterConfigByDimension = useDashboardSelector(selectDateFilterConfigsOverrides);

    return useMemo(() => {
        let parentFilterItems = mapParentFilters(
            parentFilters,
            validParentFilters,
            labels,
            attributes,
            false,
        ).sort(sortByTypeAndTitle);

        if (isEnabledKDAttributeFilterDatesValidation) {
            const dependentDateFilterItems = mapDependentDateFilters(
                dateDataSetsMap,
                dependentDateFilters,
                availableDatasets,
                filterConfigByDimension,
                isSelected,
                intl,
                filterConfig,
            );

            parentFilterItems = [...parentFilterItems, ...dependentDateFilterItems];
        }

        return parentFilterItems;
    }, [
        labels,
        attributes,
        parentFilters,
        validParentFilters,
        isEnabledKDAttributeFilterDatesValidation,
        dateDataSetsMap,
        dependentDateFilters,
        availableDatasets,
        filterConfigByDimension,
        isSelected,
        intl,
        filterConfig,
    ]);
};

const mapDependentDateFilters = (
    dateDataSetsMap: ObjRefMap<ICatalogDateDataset>,
    dependentDateFilters: IDashboardDependentDateFilter[],
    availableDatasets: ICatalogDateDataset[],
    filterConfigByDimension: IDashboardDateFilterConfigItem[],
    isSelected: boolean,
    intl: IntlShape,
    filterConfig?: IDashboardDateFilterConfig,
): IValuesLimitingItemWithTitle[] =>
    dependentDateFilters
        .filter((item) => item.isSelected === isSelected)
        .map((item) => {
            if (item.localIdentifier === "commonDate") {
                return {
                    title: intl.formatMessage({ id: "dateFilterDropdown.title" }),
                    item,
                    isDisabled: false,
                    type: "commonDate",
                };
            }

            const dateDataSet = dateDataSetsMap.get(item.dataSet!);
            const dataSetTitle = dateDataSet ? dateDataSet.dataSet.title : "";

            const title = getDatasetTitle(
                item.dataSet,
                dataSetTitle,
                filterConfigByDimension,
                intl,
                filterConfig,
            );

            const isDisabled = !availableDatasets.some((availableDataset) =>
                areObjRefsEqual(availableDataset.dataSet.ref, item.dataSet),
            );

            return {
                title,
                item,
                isDisabled,
            };
        });

// Specific date filters
export const useDateFilterItemsWithDimensions = (
    dependentDateFilters: IDashboardDependentDateFilter[],
    availableDatasets: ICatalogDateDataset[],
    isSelected: boolean,
    intl: IntlShape,
): IValuesLimitingItemWithTitle[] => {
    const dateDataSetsMap = useDashboardSelector(selectAllCatalogDateDatasetsMap);
    const filterConfig = useDashboardSelector(selectDateFilterConfigOverrides);
    const filterConfigByDimension = useDashboardSelector(selectDateFilterConfigsOverrides);

    return useMemo(() => {
        return mapDependentDateFilters(
            dateDataSetsMap,
            dependentDateFilters,
            availableDatasets,
            filterConfigByDimension,
            isSelected,
            intl,
            filterConfig,
        );
    }, [
        dateDataSetsMap,
        dependentDateFilters,
        availableDatasets,
        filterConfigByDimension,
        isSelected,
        filterConfig,
        intl,
    ]);
};

const getDatasetTitle = (
    dateDataSet: ObjRef | undefined,
    defaultDateFilterTitle: string,
    filterConfigByDimension: IDashboardDateFilterConfigItem[],
    intl: IntlShape,
    filterConfig?: IDashboardDateFilterConfig,
) => {
    const usedConfig = dateDataSet
        ? filterConfigByDimension.find((config) => areObjRefsEqual(config.dateDataSet, dateDataSet))?.config
        : filterConfig;

    const dataSetTitle =
        !usedConfig || usedConfig?.filterName === "" ? defaultDateFilterTitle : usedConfig?.filterName;

    return intl.formatMessage(
        { id: "attributesDropdown.valuesLimiting.depedentDateFilterTitle" },
        { dataSetTitle },
    );
};
