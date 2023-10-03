// (C) 2022-2023 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import {
    areObjRefsEqual,
    ICatalogDateDataset,
    IInsightDefinition,
    IMeasure,
    insightMeasures,
    isDateFilter,
    isSimpleMeasure,
    measureFilters,
    IAttributeMetadataObject,
    ObjRef,
} from "@gooddata/sdk-model";
import { sortDateDatasets, IDateDataset, unrelatedHeader, IDateDatasetHeader } from "@gooddata/sdk-ui-kit";

const DATE_DROPDOWN_BODY_MARGIN = 6;
const UNRELATED_HEIGHT = 37;
const PADDING = 10;
const DROPDOWN_MAX_HEIGHT = 400;

export function getUnrelatedDateDataset(
    relatedDateDataSets: readonly ICatalogDateDataset[],
    selectedDateDataSet: ICatalogDateDataset | undefined,
    selectedDateDataSetHidden: boolean | undefined,
): ICatalogDateDataset | undefined {
    if (!selectedDateDataSet || selectedDateDataSetHidden) {
        return undefined;
    }
    const idx = relatedDateDataSets.findIndex((dateDataSet) =>
        areObjRefsEqual(dateDataSet.dataSet.ref, selectedDateDataSet.dataSet.ref),
    );
    return idx < 0 ? selectedDateDataSet : undefined;
}

function isDateFiltered(measure: IMeasure): boolean {
    if (isSimpleMeasure(measure)) {
        const filters = measureFilters(measure);
        return !!filters?.some(isDateFilter);
    }
    return true;
}

export function getDateOptionsDisabledForInsight(insight: IInsightDefinition): boolean {
    const measures = insightMeasures(insight);
    return isEmpty(measures) ? false : measures.every(isDateFiltered);
}

export function removeDateFromTitle(title: string): string {
    return title.trim().replace(/^Date \((.*)\)$/, "$1");
}

export function getAttributeByDisplayForm(attributes: IAttributeMetadataObject[], displayForm: ObjRef) {
    return attributes.find((attribute) => areObjRefsEqual(attribute.ref, displayForm));
}

export function getUnrelatedDateDatasets(
    allDateDataSets: readonly ICatalogDateDataset[],
    relatedDateDataSets?: readonly ICatalogDateDataset[],
): readonly ICatalogDateDataset[] {
    if (!relatedDateDataSets) {
        return allDateDataSets;
    }
    return allDateDataSets.filter(
        (unrelatedItem) =>
            !relatedDateDataSets.some((relatedItem) =>
                areObjRefsEqual(relatedItem.dataSet.ref, unrelatedItem.dataSet.ref),
            ),
    );
}

export function getDateConfigurationDropdownHeight(
    dropdownButtonTop: number,
    dropdownButtonHeight: number,
    dropdownBodyHeight: number,
    hasFooter = false,
) {
    const footerHeight = hasFooter ? UNRELATED_HEIGHT : 0;
    const dropdownHeight = 2 * DATE_DROPDOWN_BODY_MARGIN + PADDING + footerHeight;
    const nodeAboveHeight = dropdownButtonTop - dropdownHeight;
    const nodeBelowHeight = window.innerHeight - (dropdownButtonTop + dropdownButtonHeight + dropdownHeight);
    const maxHeight = Math.max(nodeAboveHeight, nodeBelowHeight);

    return Math.min(dropdownBodyHeight, maxHeight, DROPDOWN_MAX_HEIGHT);
}

function catalogDateDatasetToDateDataset(ds: ICatalogDateDataset): IDateDataset {
    return {
        id: ds.dataSet.id,
        title: ds.dataSet.title,
        relevance: ds.relevance,
    };
}

export function getSortedDateDatasetsItems(
    relatedDateDatasets: readonly ICatalogDateDataset[],
    recommendedDateDataSet: ICatalogDateDataset | undefined,
    unrelatedDateDataset: ICatalogDateDataset | undefined,
    unrelatedDateDatasets: readonly ICatalogDateDataset[] | undefined,
    shouldDisplayUnrelatedDatasets = false,
): (IDateDataset | IDateDatasetHeader)[] {
    const sortedUnrelatedDateDataset = sortDateDatasets(
        (unrelatedDateDatasets || []).map(catalogDateDatasetToDateDataset),
    );
    const withUnrelatedHeader = [unrelatedHeader, ...sortedUnrelatedDateDataset];

    if (shouldDisplayUnrelatedDatasets) {
        return [
            ...sortDateDatasets(
                relatedDateDatasets.map(catalogDateDatasetToDateDataset),
                recommendedDateDataSet ? catalogDateDatasetToDateDataset(recommendedDateDataSet) : undefined,
            ),
            ...withUnrelatedHeader,
        ];
    }

    return sortDateDatasets(
        relatedDateDatasets.map(catalogDateDatasetToDateDataset),
        recommendedDateDataSet ? catalogDateDatasetToDateDataset(recommendedDateDataSet) : undefined,
        unrelatedDateDataset ? catalogDateDatasetToDateDataset(unrelatedDateDataset) : undefined,
    );
}
