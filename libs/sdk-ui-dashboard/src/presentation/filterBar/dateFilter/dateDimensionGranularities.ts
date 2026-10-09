// (C) 2026 GoodData Corporation

import {
    type DateFilterGranularity,
    type ICatalogDateDataset,
    type ObjRef,
    areObjRefsEqual,
    isDateFilterGranularity,
} from "@gooddata/sdk-model";
import { type IDateFilterOptionsByType } from "@gooddata/sdk-ui-filters";

/**
 * Date filter granularities exposed by the date dimension the filter is bound to.
 *
 * Returns undefined when the filter is not bound to a dimension (the common date filter) or when the dimension
 * is not in the catalog - in both cases the granularities must not be narrowed.
 */
export function getDateDimensionGranularities(
    dateDatasets: ICatalogDateDataset[],
    dataSetRef: ObjRef | undefined,
): DateFilterGranularity[] | undefined {
    if (!dataSetRef) {
        return undefined;
    }

    const dateDataset = dateDatasets.find((ds) => areObjRefsEqual(ds.dataSet.ref, dataSetRef));

    return dateDataset?.dateAttributes
        .map((attribute) => attribute.granularity)
        .filter(isDateFilterGranularity);
}

/**
 * Keeps only the relative presets and the relative/absolute form granularities supported by the dimension.
 * A stored filter whose granularity is dropped is reconstructed as a form and the date filter body moves it
 * to the first available granularity once the form is opened.
 */
export function narrowDateFilterOptionsToGranularities(
    dateFilterOptions: IDateFilterOptionsByType,
    granularities: DateFilterGranularity[],
): IDateFilterOptionsByType {
    const { relativePreset, absoluteForm } = dateFilterOptions;

    return {
        ...dateFilterOptions,
        ...(relativePreset
            ? {
                  relativePreset: Object.fromEntries(
                      Object.entries(relativePreset).filter(([granularity]) =>
                          granularities.includes(granularity as DateFilterGranularity),
                      ),
                  ),
              }
            : {}),
        ...(absoluteForm?.availableGranularities
            ? {
                  absoluteForm: {
                      ...absoluteForm,
                      availableGranularities: narrowGranularities(
                          absoluteForm.availableGranularities,
                          granularities,
                      ),
                  },
              }
            : {}),
    };
}

/**
 * Keeps only the available granularities the dimension exposes, preserving their original order.
 */
export function narrowGranularities(
    availableGranularities: DateFilterGranularity[],
    granularities: DateFilterGranularity[],
): DateFilterGranularity[] {
    return availableGranularities.filter((granularity) => granularities.includes(granularity));
}
