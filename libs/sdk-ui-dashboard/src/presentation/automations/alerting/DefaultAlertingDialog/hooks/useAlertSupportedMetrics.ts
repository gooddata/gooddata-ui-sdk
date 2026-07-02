// (C) 2026 GoodData Corporation

import { useEffect, useMemo, useState } from "react";

import { type IAutomationMetadataObject, type IInsight, type IWidget } from "@gooddata/sdk-model";
import { fillMissingTitles } from "@gooddata/sdk-ui";

import { useAlertingDialogContext } from "../../../contexts/AlertingDialogContext.js";
import { useAutomationsContext } from "../../../contexts/AutomationsContext.js";
import { type AlertAttribute, type AlertMetric } from "../../types.js";
import { type IMeasureFormatMap, getMeasureFormatsFromExecution } from "../utils/getters.js";
import {
    getSupportedInsightAttributesByInsight,
    getSupportedInsightMeasuresByInsight,
} from "../utils/items.js";

import { useAttributeValuesFromExecResults } from "./useAttributeValuesFromExecResults.js";

export interface IUseAlertSupportedMetricsProps {
    insight?: IInsight;
    widget?: IWidget;
    alertToEdit?: IAutomationMetadataObject;
}

/**
 * Extracts the supported-metrics derivation cluster from useEditAlert into a focused hook.
 *
 * Reads `locale`, `catalogDateDatasets`, `catalogAttributes` from `useAutomationsContext()`, and
 * `executionResultByRef` from `useAlertingDialogContext()`.
 *
 * `execResult` and `effectiveInsight` are internal — not returned.
 *
 * @internal
 */
export function useAlertSupportedMetrics({ insight, widget, alertToEdit }: IUseAlertSupportedMetricsProps): {
    measureFormatMap: IMeasureFormatMap;
    supportedMeasures: AlertMetric[];
    supportedAttributes: AlertAttribute[];
    isResultLoading: boolean;
    getAttributeValues: ReturnType<typeof useAttributeValuesFromExecResults>["getAttributeValues"];
    getMetricValue: ReturnType<typeof useAttributeValuesFromExecResults>["getMetricValue"];
} {
    const { locale, catalogDateDatasets, catalogAttributes } = useAutomationsContext();

    const { executionResultByRef } = useAlertingDialogContext();

    const execResult = executionResultByRef(widget?.ref);

    const [effectiveInsight, setEffectiveInsight] = useState<IInsight | undefined>(insight);

    useEffect(() => {
        if (insight) {
            void fillMissingTitles(insight, locale, 9999).then(setEffectiveInsight);
        }
    }, [insight, locale]);

    const measureFormatMap = useMemo(() => {
        return getMeasureFormatsFromExecution(execResult?.executionResult);
    }, [execResult?.executionResult]);

    const supportedMeasures = useMemo(
        () => getSupportedInsightMeasuresByInsight(effectiveInsight, catalogDateDatasets, alertToEdit),
        [effectiveInsight, catalogDateDatasets, alertToEdit],
    );

    const supportedAttributes = useMemo(
        () =>
            getSupportedInsightAttributesByInsight(
                insight,
                catalogAttributes,
                catalogDateDatasets,
                alertToEdit,
            ),
        [insight, catalogDateDatasets, catalogAttributes, alertToEdit],
    );

    const { isResultLoading, getAttributeValues, getMetricValue } =
        useAttributeValuesFromExecResults(execResult);

    return {
        measureFormatMap,
        supportedMeasures,
        supportedAttributes,
        isResultLoading,
        getAttributeValues,
        getMetricValue,
    };
}
