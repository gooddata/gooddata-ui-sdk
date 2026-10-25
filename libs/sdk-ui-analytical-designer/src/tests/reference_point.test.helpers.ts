// (C) 2026 GoodData Corporation

import { type IExtendedRefPointBucketItem } from "../store/reference_point/extended_reference_point_state.js";
import { type IRawBucketItems } from "../typings/buckets.js";

/**
 * Projects raw state items onto the reference-point item shape the plug-viz answers with. Only the
 * fields both shapes declare identically are carried; a test that needs the display forms or the
 * (string-typed) aggregation seeds them itself.
 */
export function toRefPointItems(items: IRawBucketItems): Omit<IExtendedRefPointBucketItem, "displayForms">[] {
    return items.map((item) => ({
        localIdentifier: item.localIdentifier,
        type: item.type,
        attribute: item.attribute,
        format: item.format,
        granularity: item.granularity,
        showInPercent: item.showInPercent,
        showOnSecondaryAxis: item.showOnSecondaryAxis,
        isTotalMeasure: item.isTotalMeasure,
        isThresholdMeasure: item.isThresholdMeasure,
        isKdaDisabled: item.isKdaDisabled,
        masterLocalIdentifier: item.masterLocalIdentifier,
        overTimeComparisonType: item.overTimeComparisonType,
        operandLocalIdentifiers: item.operandLocalIdentifiers,
        operator: item.operator,
        dfRef: item.dfRef,
        locationDisplayFormRef: item.locationDisplayFormRef,
        areaDisplayFormRef: item.areaDisplayFormRef,
        dateDatasetRef: item.dateDatasetRef,
        displayForm: item.displayForm,
    }));
}
