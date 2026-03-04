// (C) 2020-2026 GoodData Corporation

import {
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
): string | undefined {
    if (!measureRef || !isLocalIdRef(measureRef)) {
        return undefined;
    }

    const sourceMeasure = sourceInsightMeasures.find(
        (measure) => measureLocalId(measure) === measureRef.localIdentifier,
    );
    if (!sourceMeasure) {
        return undefined;
    }

    return measureAlias(sourceMeasure) ?? measureTitle(sourceMeasure);
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
