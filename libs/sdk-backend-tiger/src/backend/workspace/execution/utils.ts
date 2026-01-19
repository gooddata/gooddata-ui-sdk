// (C) 2022-2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import {
    type CustomLabel,
    type CustomMetric,
    type CustomOverride,
    type ExportCustomLabel,
    type ExportCustomMetric,
    type ExportCustomOverride,
} from "@gooddata/api-client-tiger";
import { Normalizer } from "@gooddata/sdk-backend-base";
import {
    type IDimensionDescriptor,
    type IExecutionDefinition,
    isAttributeDescriptor,
    isMeasureGroupDescriptor,
    measureMasterIdentifier,
} from "@gooddata/sdk-model";

export type ExportMetrics = { [key: string]: CustomMetric };
export type ExportLabels = { [key: string]: CustomLabel };

/**
 * Resolves custom override value for export payload.
 *
 * @param dimensions - the source of default values
 * @param definition - the source of custom values
 */
export const resolveCustomOverride = (
    dimensions: IDimensionDescriptor[],
    definition: IExecutionDefinition,
): CustomOverride | undefined => {
    const customOverride = prepareCustomOverride(dimensions);
    const metrics = setDerivedMetrics(
        definition,
        setCustomMetrics(definition, customOverride?.metrics ?? {}),
    );
    const labels = setCustomLabels(definition, customOverride?.labels ?? {});
    const result: CustomOverride = {};
    if (!isEmpty(metrics)) {
        result.metrics = metrics;
    }
    if (!isEmpty(labels)) {
        result.labels = labels;
    }
    return isEmpty(result) ? undefined : result;
};

/**
 * Fills measures/metrics and attributes/labels with the lowest priority values, which serve as default.
 *
 * @param dimensions - the source of default values
 */
export const prepareCustomOverride = (dimensions: IDimensionDescriptor[]): CustomOverride => {
    const metrics: ExportMetrics = {};
    const labels: ExportLabels = {};

    for (const dimension of dimensions) {
        for (const header of dimension.headers) {
            if (isMeasureGroupDescriptor(header)) {
                header.measureGroupHeader.items.forEach(({ measureHeaderItem }) => {
                    const { localIdentifier, name, format } = measureHeaderItem;
                    metrics[localIdentifier] = {
                        title: name,
                        format: format,
                    };
                });
            }
            if (isAttributeDescriptor(header)) {
                const { localIdentifier, formOf } = header.attributeHeader;
                labels[localIdentifier] = {
                    title: formOf.name,
                };
            }
        }
    }

    return {
        metrics,
        labels,
    };
};

/**
 * Overwrites default measure/metric values with custom ones.
 * This function should be used after {@link prepareCustomOverride}, because it relies upon its output.
 *
 * @param definition - the source of custom values
 * @param metrics - return values from {@link prepareCustomOverride}
 */
export const setCustomMetrics = (definition: IExecutionDefinition, metrics: ExportMetrics) =>
    definition.measures.reduce((result: ExportMetrics, measure) => {
        const { localIdentifier, alias, title, format } = measure.measure;
        return {
            ...result,
            [localIdentifier]: {
                title: alias ?? title ?? result[localIdentifier].title,
                format: format ?? result[localIdentifier].format,
            },
        };
    }, metrics);

/**
 * Overwrites formats of derived measures/metrics with values from master, which they should inherit.
 * This function should be used after {@link setCustomMetrics}, because it relies upon its output.
 *
 * @param definition - the source of data
 * @param metrics - return values from {@link setCustomMetrics}
 */
export const setDerivedMetrics = (definition: IExecutionDefinition, metrics: ExportMetrics) =>
    definition.measures.reduce((result: ExportMetrics, measure) => {
        const masterId = measureMasterIdentifier(measure);
        if (!masterId) {
            return result;
        }

        const derivedId = measure.measure.localIdentifier;
        if (metrics[masterId].format) {
            return {
                ...result,
                [derivedId]: {
                    ...result[derivedId],
                    format: metrics[masterId].format,
                },
            };
        }

        return result;
    }, metrics);

/**
 * Overwrites default attribute/label values with custom ones.
 * This function should be used after {@link prepareCustomOverride}, because it relies upon its output.
 *
 * @param definition - the source of custom values
 * @param labels - return values from {@link prepareCustomOverride}
 */
export const setCustomLabels = (definition: IExecutionDefinition, labels: ExportLabels) =>
    definition.attributes.reduce((result: ExportLabels, attribute) => {
        const { localIdentifier, alias } = attribute.attribute;
        return {
            ...result,
            [localIdentifier]: {
                title: alias ?? result[localIdentifier].title,
            },
        };
    }, labels);

/**
 * Augments custom override with normalized keys to ensure compatibility with backend caching.
 *
 * For every (denormalized) key in the custom override, this function adds its value again under the
 * corresponding normalized key. This ensures that regardless of how the localIds are specified in
 * the cached result on the backend, the override will match either the denormalized or the normalized one.
 *
 * @remarks
 * The backend may cache execution results using either normalized or denormalized local identifiers.
 * By augmenting the custom override with both versions of the keys, we ensure the export will work
 * correctly regardless of which format the backend uses.
 *
 * @param customOverride - The custom override to augment, may be undefined.
 * @param definition - The execution definition used to determine normalization mapping
 * @returns The augmented custom override with both normalized and denormalized keys, or undefined if input was undefined
 *
 * @internal
 */
export const augmentCustomOverrideWithNormalizedKeys = (
    customOverride: CustomOverride | ExportCustomOverride | undefined,
    definition: IExecutionDefinition,
): ExportCustomOverride | undefined => {
    if (!customOverride) {
        return undefined;
    }

    // Create a mapping from normalized keys to original (denormalized) keys
    const normalizationState = Normalizer.normalize(definition, undefined);
    const transposed: Record<string, string> = {};
    for (const [key, value] of Object.entries(normalizationState.n2oMap)) {
        transposed[value] = key;
    }

    const augmented: ExportCustomOverride = {};

    // Augment labels with normalized keys
    if (customOverride.labels) {
        augmented.labels = {} as { [key: string]: ExportCustomLabel };
        for (const [key, value] of Object.entries(customOverride.labels)) {
            augmented.labels[key] = value;
            // Add the same value under the normalized key if it exists
            if (transposed[key]) {
                augmented.labels[transposed[key]] = value;
            }
        }
    }

    // Augment metrics with normalized keys
    if (customOverride.metrics) {
        augmented.metrics = {} as { [key: string]: ExportCustomMetric };
        for (const [key, value] of Object.entries(customOverride.metrics)) {
            augmented.metrics[key] = value;
            // Add the same value under the normalized key if it exists
            if (transposed[key]) {
                augmented.metrics[transposed[key]] = value;
            }
        }
    }

    return augmented;
};
