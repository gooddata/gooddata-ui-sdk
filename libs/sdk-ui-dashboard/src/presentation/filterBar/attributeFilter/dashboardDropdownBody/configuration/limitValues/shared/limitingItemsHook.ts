// (C) 2024 GoodData Corporation

import { useMemo } from "react";
import { IntlShape } from "react-intl";
import { invariant } from "ts-invariant";
import {
    ObjRef,
    ICatalogAttribute,
    isIdentifierRef,
    areObjRefsEqual,
    IAttributeDisplayFormMetadataObject,
    ICatalogDateDataset,
    IDashboardDateFilterConfigItem,
    IDashboardDateFilterConfig,
    IDashboardDateFilter,
    isUriRef,
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

export interface IValuesLimitingItemWithTitle {
    title?: string;
    item: ValuesLimitingItem;
    isDisabled?: boolean;
    type?: string;
    isDisabledDateFilterTooltip?: boolean;
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
    dependentDateFilters: IDashboardDependentDateFilter[],
    availableDatasets: ICatalogDateDataset[],
    isEnabledKDAttributeFilterDatesValidation: boolean,
    isSelected: boolean,
    intl: IntlShape,
): IValuesLimitingItemWithTitle[] => {
    const attributes = useDashboardSelector(selectCatalogAttributes);
    const labels = useDashboardSelector(selectAllCatalogDisplayFormsMap);
    const dateDataSetsMap = useDashboardSelector(selectAllCatalogDateDatasetsMap);
    const filterConfig = useDashboardSelector(selectDateFilterConfigOverrides);
    const filterConfigByDimension = useDashboardSelector(selectDateFilterConfigsOverrides);

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

        let dependentDateFilterItems: IValuesLimitingItemWithTitle[] = [];
        if (isEnabledKDAttributeFilterDatesValidation) {
            dependentDateFilterItems = mapDependentDateFilters(
                dateDataSetsMap,
                dependentDateFilters,
                availableDatasets,
                filterConfigByDimension,
                isSelected,
                intl,
                filterConfig,
            );
        }
        return [...selectedParentFilterItems, ...validationItems, ...dependentDateFilterItems].sort(
            sortByTypeAndTitle,
        );
    }, [
        parentFilters,
        dateDataSetsMap,
        validParentFilters,
        validateElementsBy,
        attributes,
        labels,
        metricsAndFacts,
        isEnabledKDAttributeFilterDatesValidation,
        dependentDateFilters,
        filterConfigByDimension,
        intl,
        filterConfig,
        availableDatasets,
        isSelected,
    ]);
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
    dependentCommonDateFilter: IDashboardDateFilter,
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

            const commonDateFilter: IValuesLimitingItemWithTitle[] = [
                {
                    title: filterConfig?.filterName || intl.formatMessage({ id: "dateFilterDropdown.title" }),
                    item: parseCommonDateFilter(dependentCommonDateFilter),
                    isDisabled: false,
                    type: "commonDate",
                },
            ];

            parentFilterItems = [...parentFilterItems, ...dependentDateFilterItems, ...commonDateFilter];
        }

        return parentFilterItems;
    }, [
        dependentCommonDateFilter,
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
            const dateDataSet = item.dataSet ? dateDataSetsMap.get(item.dataSet) : "";
            const dataSetTitle = dateDataSet ? dateDataSet.dataSet.title : "";

            const title = getDatasetTitle(item.dataSet, dataSetTitle, filterConfigByDimension, filterConfig);

            if (item.isCommonDate) {
                const dateFilterTitle =
                    filterConfig?.filterName || intl.formatMessage({ id: "dateFilterDropdown.title" });

                return {
                    title: intl.formatMessage(
                        { id: "attributesDropdown.valuesLimiting.commonDateFilterTitle" },
                        { dateFilterTitle, dataSetTitle },
                    ),
                    item,
                    isDisabled: false,
                    type: "commonDate",
                };
            }
            const isSelectedByCommonDateFilter = dependentDateFilters.some(
                (dependentDateFilter) =>
                    areObjRefsEqual(item.dataSet, dependentDateFilter.dataSet) &&
                    dependentDateFilter.isCommonDate,
            );

            const isDisabled = !availableDatasets.some((availableDataset) =>
                areObjRefsEqual(availableDataset.dataSet.ref, item.dataSet),
            );

            return {
                title,
                item,
                isDisabled: isSelectedByCommonDateFilter || isDisabled,
                isDisabledDateFilterTooltip: isSelectedByCommonDateFilter,
            };
        });

const getDatasetTitle = (
    dateDataSet: ObjRef | undefined,
    defaultDateFilterTitle: string,
    filterConfigByDimension: IDashboardDateFilterConfigItem[],
    filterConfig?: IDashboardDateFilterConfig,
) => {
    const usedConfig = dateDataSet
        ? filterConfigByDimension.find((config) => areObjRefsEqual(config.dateDataSet, dateDataSet))?.config
        : filterConfig;

    return !usedConfig || usedConfig?.filterName === "" ? defaultDateFilterTitle : usedConfig?.filterName;
};

export const useCommonDateItems = (
    availableDatasets: ICatalogDateDataset[],
    dependentCommonDateFilter: IDashboardDateFilter,
    dependentDateFilters?: IDashboardDependentDateFilter[],
): IValuesLimitingItemWithTitle[] => {
    return useMemo(() => {
        return availableDatasets
            .filter(
                (availableDataset) =>
                    !dependentDateFilters?.some(
                        (item) =>
                            areObjRefsEqual(availableDataset.dataSet.ref, item.dataSet) && item.isCommonDate,
                    ),
            )
            .map((dateDataSet) => {
                const isDisabled = (dependentDateFilters ?? []).some(
                    (item) =>
                        areObjRefsEqual(dateDataSet.dataSet.ref, item.dataSet) &&
                        !item.isCommonDate &&
                        !!item.isSelected,
                );
                return {
                    title: dateDataSet.dataSet.title,
                    item: parseCommonDateFilter(dependentCommonDateFilter, dateDataSet.dataSet.ref),
                    isDisabled,
                    type: "commonDate",
                };
            });
    }, [availableDatasets, dependentCommonDateFilter, dependentDateFilters]);
};

const parseCommonDateFilter = (
    commonDate: IDashboardDateFilter,
    dataSet?: ObjRef,
): IDashboardDependentDateFilter => {
    invariant(!isUriRef(dataSet));

    return {
        from: commonDate.dateFilter.from,
        to: commonDate.dateFilter.to,
        granularity: commonDate.dateFilter.granularity,
        type: commonDate.dateFilter.type,
        localIdentifier: dataSet?.identifier ?? "commonDate",
        isSelected: true,
        dataSet: dataSet,
        isCommonDate: true,
    };
};

export const useDependentDateFilterTitle = (
    dataSet: ObjRef | undefined,
    dependentDateFilters: IDashboardDependentDateFilter[],
): string => {
    const dateDataSetsMap = useDashboardSelector(selectAllCatalogDateDatasetsMap);
    const filterConfigByDimension = useDashboardSelector(selectDateFilterConfigsOverrides);

    return useMemo(() => {
        const dateFilter = dependentDateFilters.find((filter) => areObjRefsEqual(filter.dataSet, dataSet));

        const dateDataSet = dateFilter?.dataSet ? dateDataSetsMap.get(dateFilter?.dataSet) : "";
        const dataSetTitle = dateDataSet ? dateDataSet.dataSet.title : "";

        return getDatasetTitle(dateFilter?.dataSet, dataSetTitle, filterConfigByDimension);
    }, [dependentDateFilters, dataSet, filterConfigByDimension, dateDataSetsMap]);
};
