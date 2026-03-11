// (C) 2020-2026 GoodData Corporation

import {
    type ICatalogMeasure,
    type IDashboardDateFilterConfigItem,
    type IMeasure,
    type ObjRef,
    type ObjRefInScope,
    type SourceInsightFilterObjRef,
    areObjRefsEqual,
    isLocalIdRef,
    measureAlias,
    measureLocalId,
    measureTitle,
    serializeObjRef,
} from "@gooddata/sdk-model";

import { sourceInsightFilterObjRefValue } from "../../../../../_staging/drills/drillingUtils.js";

export function getMeasureTitleFromSourceInsightMeasures(
    sourceInsightMeasures: IMeasure[],
    measureRef: ObjRefInScope | undefined,
    allCatalogMeasures: ICatalogMeasure[],
): string | undefined {
    if (!measureRef) {
        return undefined;
    }

    if (isLocalIdRef(measureRef)) {
        const sourceMeasure = sourceInsightMeasures.find(
            (measure) => measureLocalId(measure) === measureRef.localIdentifier,
        );
        if (!sourceMeasure) {
            return undefined;
        }

        return measureAlias(sourceMeasure) ?? measureTitle(sourceMeasure);
    }

    //fallback to catalog lookup in case of object ref
    return allCatalogMeasures.find((measure) => areObjRefsEqual(measure.measure.ref, measureRef))?.measure
        .title;
}

export function sourceFilterOptionId(sourceFilterObjRef: SourceInsightFilterObjRef): string {
    return `${sourceFilterObjRef.type}:${serializeObjRef(sourceInsightFilterObjRefValue(sourceFilterObjRef))}`;
}

export function getDisplayFormTitle({
    displayFormRef,
    allCatalogDisplayForms,
    allCatalogDateAttributeDisplayForms = [],
}: {
    displayFormRef: ObjRefInScope;
    allCatalogDisplayForms: Array<{ ref: ObjRef; title?: string }>;
    allCatalogDateAttributeDisplayForms?: Array<{ ref: ObjRef; title?: string }>;
}): string {
    const displayForm =
        allCatalogDisplayForms.find((df) => areObjRefsEqual(df.ref, displayFormRef)) ??
        allCatalogDateAttributeDisplayForms.find((df) => areObjRefsEqual(df.ref, displayFormRef));

    return displayForm?.title ?? "";
}

export function getDateDatasetTitle({
    datasetRef,
    allDateDatasets,
}: {
    datasetRef: ObjRefInScope;
    allDateDatasets: Array<{ dataSet: { ref: ObjRef; title?: string } }>;
}): string {
    const dateDataset = allDateDatasets.find((dataset) => areObjRefsEqual(dataset.dataSet.ref, datasetRef));

    return dateDataset?.dataSet.title ?? "";
}

export function getDashboardDateFilterCustomTitle({
    datasetRef,
    allDateFilterConfigsOverrides,
}: {
    datasetRef: ObjRefInScope;
    allDateFilterConfigsOverrides: IDashboardDateFilterConfigItem[];
}): string | undefined {
    const customTitle = allDateFilterConfigsOverrides.find((configOverride) =>
        areObjRefsEqual(configOverride.dateDataSet, datasetRef),
    )?.config.filterName;

    return customTitle || undefined;
}
