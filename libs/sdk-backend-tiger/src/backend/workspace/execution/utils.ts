// (C) 2022 GoodData Corporation
import {
    IDimensionDescriptor,
    IExecutionDefinition,
    isAttributeDescriptor,
    isMeasureGroupDescriptor,
    measureMasterIdentifier,
} from "@gooddata/sdk-model";
import { CustomLabel, CustomMetric, CustomOverride } from "@gooddata/api-client-tiger";
import isEmpty from "lodash/isEmpty.js";

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
