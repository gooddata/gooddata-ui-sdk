// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { defineMessages, useIntl } from "react-intl";

import type { IMeasureMetadataObjectDefinition } from "@gooddata/sdk-model";

import { type IAsCodeEditing, type IAsCodeMessages, defineAsCodeDescriptor } from "../asCode/descriptor.js";
import type { ICatalogItemMeasure } from "../catalogItem/types.js";
import { ObjectTypes } from "../objectType/constants.js";

import { METRIC_EDITOR_FEATURE_FLAG } from "./gate.js";
import { metricCompletions } from "./metricCompletions.js";
import {
    definitionToMetricYaml,
    mergeCopiedMetricDefinition,
    metricYamlToDefinition,
} from "./metricConverter.js";
import { createCopiedMetric } from "./metricCopy.js";
import { createMetricMutationAdapter } from "./metricMutationPort.js";
import { serializeMetricToYaml } from "./metricSerialization.js";
import { validateMetricYaml } from "./metricValidation.js";

const METRIC_DOCS_URL = "https://www.gooddata.ai/docs/cloud/api-and-sdk/vs-code-extension/structures/#metric";

const messages = defineMessages({
    createTitle: { id: "analyticsCatalog.metric.dialog.create.title" },
    editTitle: { id: "analyticsCatalog.metric.dialog.edit.title" },
    duplicate: { id: "analyticsCatalog.metric.dialog.edit.duplicate" },
    createDefaultTitle: { id: "analyticsCatalog.metric.create.defaultTitle" },
    createSuccess: { id: "analyticsCatalog.metric.create.success" },
    updateSuccess: { id: "analyticsCatalog.metric.update.success" },
    sectionHeader: { id: "analyticsCatalog.metric.dialog.sectionHeader" },
    sectionHeaderTooltip: { id: "analyticsCatalog.metric.dialog.sectionHeader.tooltip" },
    help: { id: "analyticsCatalog.metric.dialog.help" },
    submitError: { id: "analyticsCatalog.metric.dialog.submit.error" },
    loadError: { id: "analyticsCatalog.metric.load.error" },
    deleteTitle: { id: "analyticsCatalog.metric.dialog.delete.title" },
    deleteBody: { id: "analyticsCatalog.metric.dialog.delete.body" },
    deleteSubmit: { id: "analyticsCatalog.metric.dialog.delete.submit" },
    deleteSuccess: { id: "analyticsCatalog.metric.delete.success" },
    deleteError: { id: "analyticsCatalog.metric.delete.error" },
    deleteUsageWarning: { id: "analyticsCatalog.metric.dialog.delete.usageWarning" },
}) satisfies IAsCodeMessages;

const actionMessages = defineMessages({
    openInEditor: { id: "analyticsCatalog.metric.actions.openInEditor" },
});

const errorMessages = defineMessages({
    empty: { id: "analyticsCatalog.metric.validation.empty" },
    syntax: { id: "analyticsCatalog.metric.validation.syntax" },
    invalidStructure: { id: "analyticsCatalog.metric.validation.invalidStructure" },
    idImmutable: { id: "analyticsCatalog.metric.dialog.edit.idImmutable" },
    missingMaql: { id: "analyticsCatalog.metric.validation.missingMaql" },
    invalidTags: { id: "analyticsCatalog.metric.validation.invalidTags" },
});

function useMetricEditing(): IAsCodeEditing<IMeasureMetadataObjectDefinition> {
    const intl = useIntl();
    return useMemo<IAsCodeEditing<IMeasureMetadataObjectDefinition>>(
        () => ({
            completionSource: metricCompletions,
            syntaxErrorMessage: intl.formatMessage(errorMessages.syntax),
            // The editor works in the YAML shape, a lossy projection of the measure definition.
            serialize: (definition) => serializeMetricToYaml(definitionToMetricYaml(definition)),
            validate: (value, options) => {
                const result = validateMetricYaml(value, options);
                return result.isValid
                    ? { isValid: true, definition: result.measure }
                    : { isValid: false, error: intl.formatMessage(errorMessages[result.errorCode]) };
            },
        }),
        [intl],
    );
}

/**
 * @internal
 */
export const metricDescriptor = defineAsCodeDescriptor<IMeasureMetadataObjectDefinition, ICatalogItemMeasure>(
    {
        objectType: ObjectTypes.METRIC,
        docsUrl: METRIC_DOCS_URL,
        featureFlag: METRIC_EDITOR_FEATURE_FLAG,
        messages,
        useEditing: useMetricEditing,
        createMutationPort: createMetricMutationAdapter,
        emptyDefinition: (defaultTitle) =>
            metricYamlToDefinition({ type: "metric", title: defaultTitle, maql: "SELECT 1" }),
        // No editSeed: the full measure is loaded via port.load (the item carries no MAQL).
        toCopy: createCopiedMetric,
        applyYamlEdits: mergeCopiedMetricDefinition,
        openAction: actionMessages.openInEditor,
    },
);
