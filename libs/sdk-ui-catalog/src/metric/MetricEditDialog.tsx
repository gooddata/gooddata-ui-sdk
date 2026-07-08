// (C) 2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { defineMessages } from "react-intl";

import type { IMeasureMetadataObject, IMeasureMetadataObjectDefinition } from "@gooddata/sdk-model";
import { useCancelablePromise } from "@gooddata/sdk-ui";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { type ICatalogItemMeasure } from "../catalogItem/types.js";

import { definitionToMetricYaml, overlayMetricYamlFields } from "./metricConverter.js";
import { MetricDialog } from "./MetricDialog.js";
import { useMetricMutation } from "./MetricMutationContext.js";

const messages = defineMessages({
    metricUpdateSuccess: { id: "analyticsCatalog.metric.update.success" },
    metricLoadError: { id: "analyticsCatalog.metric.load.error" },
});

type Props = {
    item: ICatalogItemMeasure;
    onClose: () => void;
    onSaved: (item: ICatalogItemMeasure) => void;
    onDuplicate?: (metric: IMeasureMetadataObjectDefinition) => void;
};

export function MetricEditDialog({ item, onClose, onSaved, onDuplicate }: Props) {
    const { addSuccess, addError } = useToastMessage();
    const mutation = useMetricMutation();

    // The catalog item carries only metadata; the full metric (incl. MAQL and fields the YAML does
    // not carry, such as metricType) is fetched on open and reused as the base for the update. The
    // fetch is re-run only when the item or backend port changes, and a stale in-flight load is
    // discarded when they do.
    const { result: loadedMetric } = useCancelablePromise<IMeasureMetadataObject>(
        {
            promise: () => mutation.load(item),
            onError: () => {
                addError(messages.metricLoadError);
                onClose();
            },
        },
        [item, mutation],
    );

    const handleSubmit = useCallback(
        async (definition: IMeasureMetadataObjectDefinition) => {
            if (!loadedMetric) {
                return;
            }
            const savedMetric = await mutation.update(loadedMetric, definition);
            onSaved(savedMetric);
            onClose();
            addSuccess(messages.metricUpdateSuccess);
        },
        [addSuccess, loadedMetric, mutation, onClose, onSaved],
    );

    // The duplicate is seeded from the loaded metric overlaid with the current YAML edits, so the
    // copy inherits fields the YAML cannot express (metricType, isHiddenFromKda) that the parsed
    // editor content alone would not carry.
    const handleDuplicate = useCallback(
        (edited: IMeasureMetadataObjectDefinition) => {
            if (!loadedMetric || !onDuplicate) {
                return;
            }
            onDuplicate(overlayMetricYamlFields(loadedMetric, edited));
        },
        [loadedMetric, onDuplicate],
    );

    // Undefined until the fetch completes: the eager dialog frame shows an in-frame spinner via
    // isLoading and mounts the editor (seeded with the real metric) only once this is present.
    const initialMetric = useMemo(
        () => (loadedMetric ? definitionToMetricYaml(loadedMetric) : undefined),
        [loadedMetric],
    );

    return (
        <MetricDialog
            mode="edit"
            isLoading={!loadedMetric}
            initialMetric={initialMetric}
            onClose={onClose}
            onSubmit={handleSubmit}
            onDuplicate={onDuplicate ? handleDuplicate : undefined}
        />
    );
}
