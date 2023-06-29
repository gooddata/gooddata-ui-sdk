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
