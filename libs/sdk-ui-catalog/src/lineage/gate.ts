// (C) 2026 GoodData Corporation

import type { ObjectType } from "../objectType/types.js";
import { useFeatureFlag } from "../permission/PermissionsContext.js";

const SUPPORTED_LINEAGE_TYPES: ObjectType[] = [
    "analyticalDashboard",
    "insight",
    "measure",
    "attribute",
    "fact",
    "dataSet",
];

/**
 * Checks whether lineage is enabled.
 */
export function useIsLineageEnabled(objectType?: ObjectType): boolean {
    const isLineageEnabled = useFeatureFlag("enableCatalogLineage");
    if (!isLineageEnabled || !objectType) {
        return false;
    }

    return SUPPORTED_LINEAGE_TYPES.includes(objectType);
}
