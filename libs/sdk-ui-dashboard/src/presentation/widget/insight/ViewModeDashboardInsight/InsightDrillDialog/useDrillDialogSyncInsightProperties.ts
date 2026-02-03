// (C) 2026 GoodData Corporation

import { useCallback, useEffect, useMemo, useState } from "react";

import { isEqual, mergeWith } from "lodash-es";

import { type IInsight, insightProperties, insightSetProperties } from "@gooddata/sdk-model";
import { type IPushData, type PushDataCallback } from "@gooddata/sdk-ui";

function mergeVisualizationProperties(
    current: NonNullable<IInsight["insight"]["properties"]> | undefined,
    incoming: IPushData["properties"],
): NonNullable<IInsight["insight"]["properties"]> {
    return mergeWith({}, current ?? {}, incoming, (currentValue, incomingValue) => {
        /**
         * Replace arrays instead of merging them. This is important for properties like column sizing,
         * where callers may provide an empty array to fully override previously set values.
         */
        if (Array.isArray(currentValue)) {
            return incomingValue;
        }
        return undefined;
    });
}

export interface IUseDrillDialogSyncInsightPropertiesParams {
    insight: IInsight;
    drillStepInsightId: string | undefined;
    onPushData: PushDataCallback;
    pushData: PushDataCallback | undefined;
    isWidgetAsTable?: boolean;
}

/**
 * Keeps drill dialog visualization props in sync with interactive changes reported via `pushData.properties`.
 *
 * @remarks
 * In drill dialog we do not persist `pushData.properties` anywhere (unlike in the normal widget rendering path),
 * so we keep them locally and overlay them on top of the currently rendered insight properties.
 *
 * This is intentionally **generic**: it merges the entire `pushData.properties` object (not a whitelist).
 * PivotTableNext text wrapping is just one example: it uses this to keep the header menu checked state consistent.
 *
 * @internal
 */
export function useDrillDialogSyncInsightProperties({
    insight,
    drillStepInsightId,
    onPushData,
    pushData,
    isWidgetAsTable,
}: IUseDrillDialogSyncInsightPropertiesParams) {
    const [pushedProperties, setPushedProperties] = useState<IPushData["properties"] | undefined>(undefined);

    // Reset pushed properties when drilled insight changes (and when switching as-table/original).
    useEffect(() => {
        setPushedProperties(undefined);
    }, [drillStepInsightId, isWidgetAsTable]);

    const syncedInsight = useMemo(() => {
        if (!pushedProperties) {
            return insight;
        }

        const baseProperties = insightProperties(insight);
        const mergedProperties = mergeVisualizationProperties(baseProperties, pushedProperties);
        return insightSetProperties(insight, mergedProperties);
    }, [insight, pushedProperties]);

    const handlePushData = useCallback(
        (data: IPushData) => {
            onPushData(data);

            if (data.properties) {
                setPushedProperties((current) => {
                    const mergedProperties = mergeVisualizationProperties(current, data.properties);
                    return isEqual(mergedProperties, current) ? current : mergedProperties;
                });
            }

            pushData?.(data);
        },
        [onPushData, pushData],
    );

    return {
        syncedInsight,
        handlePushData,
    };
}
