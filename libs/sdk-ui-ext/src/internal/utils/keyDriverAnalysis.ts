// (C) 2026 GoodData Corporation

import { getAllItemsByType } from "./bucketHelper.js";
import { METRIC } from "../constants/bucket.js";
import { type IExtendedReferencePoint } from "../interfaces/Visualization.js";

export function cleanupKeyDriverAnalysisOnMetrics(
    extendedPoint: IExtendedReferencePoint,
): IExtendedReferencePoint {
    const measures = getAllItemsByType(extendedPoint.buckets ?? [], [METRIC]).map((m) => m.localIdentifier);
    const disableKeyDriveAnalysisOn = extendedPoint.properties?.controls?.["disableKeyDriveAnalysisOn"];

    if (!disableKeyDriveAnalysisOn) {
        return extendedPoint;
    }

    const cloned = { ...(disableKeyDriveAnalysisOn ?? {}) };
    const usedMeasures = Object.keys(cloned);
    const unused = usedMeasures.filter((m) => !measures.includes(m));

    for (const measure of unused) {
        delete cloned[measure];
    }

    return {
        ...extendedPoint,
        properties: {
            ...extendedPoint.properties,
            controls: {
                ...extendedPoint.properties?.controls,
                ...(Object.keys(cloned).length > 0
                    ? {
                          disableKeyDriveAnalysisOn: cloned,
                      }
                    : {
                          disableKeyDriveAnalysisOn: undefined,
                      }),
            },
        },
    };
}

export function hideKeyDriverOnMetrics(extendedPoint: IExtendedReferencePoint): IExtendedReferencePoint {
    const measures = getAllItemsByType(extendedPoint.buckets ?? [], [METRIC]);
    const cloned = {
        ...(extendedPoint.properties?.controls?.["disableKeyDriveAnalysisOn"] ?? {}),
    };

    measures.forEach((m) => {
        const current = cloned[m.localIdentifier];
        if (current === undefined && m.isKdaDisabled) {
            cloned[m.localIdentifier] = true;
        }
    });

    return {
        ...extendedPoint,
        properties: {
            ...extendedPoint.properties,
            controls: {
                ...extendedPoint.properties?.controls,
                ...(Object.keys(cloned).length > 0
                    ? {
                          disableKeyDriveAnalysisOn: cloned,
                      }
                    : {
                          disableKeyDriveAnalysisOn: undefined,
                      }),
            },
        },
    };
}
