// (C) 2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { defineMessages, useIntl } from "react-intl";

import type { IMeasureMetadataObjectDefinition } from "@gooddata/sdk-model";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import type { ICatalogItemMeasure } from "../catalogItem/types.js";

import { type MetricYaml, definitionToMetricYaml, mergeCopiedMetricDefinition } from "./metricConverter.js";
import { createCopiedMetric, isDuplicateIdError } from "./metricCopy.js";
import { MetricDialog } from "./MetricDialog.js";
import { useMetricMutation } from "./MetricMutationContext.js";

const messages = defineMessages({
    metricCreateSuccess: { id: "analyticsCatalog.metric.create.success" },
    metricCreateDefaultTitle: { id: "analyticsCatalog.metric.create.defaultTitle" },
});

type Props = {
    sourceDefinition?: IMeasureMetadataObjectDefinition;
    isLoading?: boolean;
    onClose: () => void;
    onCreated?: (item: ICatalogItemMeasure) => void;
};

export function MetricCreateDialog({ sourceDefinition, isLoading = false, onClose, onCreated }: Props) {
    const intl = useIntl();
    const { addSuccess } = useToastMessage();
    const mutation = useMetricMutation();

    // The single source of truth for a duplicate's copy semantics (title bump, id derivation, and
    // which author-owned fields carry over). Undefined for a blank create.
    const copiedMetric = useMemo(
        () => (sourceDefinition ? createCopiedMetric(sourceDefinition) : undefined),
        [sourceDefinition],
    );

    const initialMetric = useMemo<MetricYaml>(() => {
        if (!copiedMetric) {
            return {
                type: "metric",
                title: intl.formatMessage(messages.metricCreateDefaultTitle),
                maql: "SELECT 1",
            };
        }
        return definitionToMetricYaml(copiedMetric);
    }, [copiedMetric, intl]);

    const copiedId = copiedMetric ? initialMetric.id : undefined;

    const handleSubmit = useCallback(
        async (metric: IMeasureMetadataObjectDefinition) => {
            // A duplicate layers the author's YAML edits over the copied source so its non-YAML
            // fields (metricType, isHiddenFromKda) survive the lossy YAML round-trip; a blank create
            // has no source and persists the parsed YAML as-is.
            const definition = copiedMetric ? mergeCopiedMetricDefinition(copiedMetric, metric) : metric;
            let createdMetric: ICatalogItemMeasure;
            try {
                createdMetric = await mutation.create(definition);
            } catch (error) {
                if (copiedId !== undefined && definition.id === copiedId && isDuplicateIdError(error)) {
                    const { id: _id, ...metricWithoutId } = definition;
                    createdMetric = await mutation.create(metricWithoutId);
                } else {
                    throw error;
                }
            }
            onCreated?.(createdMetric);
            onClose();
            addSuccess(messages.metricCreateSuccess);
        },
        [addSuccess, copiedId, copiedMetric, mutation, onClose, onCreated],
    );

    return (
        <MetricDialog
            mode="create"
            isLoading={isLoading}
            initialMetric={initialMetric}
            onClose={onClose}
            onSubmit={handleSubmit}
        />
    );
}
