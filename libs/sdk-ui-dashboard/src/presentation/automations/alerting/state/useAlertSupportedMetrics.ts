// (C) 2026 GoodData Corporation

import { useEffect, useMemo, useState } from "react";

import { type IAutomationMetadataObject, type IInsight, type IWidget } from "@gooddata/sdk-model";
import { fillMissingTitles } from "@gooddata/sdk-ui";

import { useAlertingDialogContext } from "../../contexts/AlertingDialogContext.js";
import { useAutomationsContext } from "../../contexts/AutomationsContext.js";
import { useAttributeValuesFromExecResults } from "../hooks/useAttributeValuesFromExecResults.js";
import { getMeasureFormatsFromExecution } from "../utils/getters.js";
import {
    getSupportedInsightAttributesByInsight,
    getSupportedInsightMeasuresByInsight,
} from "../utils/items.js";

import { type IAlertSupportedMetrics } from "./types.js";

export interface IUseAlertSupportedMetricsProps {
    insight?: IInsight;
    widget?: IWidget;
    alertToEdit?: IAutomationMetadataObject;
}

/**
 * Derives which measures and attributes the alerting dialog may offer for the current widget: it
 * resolves the effective insight and its execution result, then narrows the catalog down to the
 * metrics alerting actually supports.
 *
 * `execResult` and `effectiveInsight` stay internal — they are implementation detail rather than part
 * of the returned contract.
 *
 * @internal
 */
export function useAlertSupportedMetrics({
    insight,
    widget,
    alertToEdit,
}: IUseAlertSupportedMetricsProps): IAlertSupportedMetrics {
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
