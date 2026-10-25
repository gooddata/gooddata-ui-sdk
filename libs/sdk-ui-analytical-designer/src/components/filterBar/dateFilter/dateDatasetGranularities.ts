// (C) 2026 GoodData Corporation

import { type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

import { type IDateDatasetRefWithGranularities } from "../../../typings/datasets.js";

export const datasetRefWithGranularitiesHasSeconds = (
    dateDatasetRefsWithGranularities: IDateDatasetRefWithGranularities[],
    ref: ObjRef | undefined,
): boolean =>
    !!ref &&
    (dateDatasetRefsWithGranularities
        .find((dataset) => areObjRefsEqual(dataset.ref, ref))
        ?.attributes.some((attribute) => attribute.dateType === "GDC.time.second") ??
        false);
