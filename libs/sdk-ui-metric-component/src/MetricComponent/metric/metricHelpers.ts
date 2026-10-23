// (C) 2021-2026 GoodData Corporation

import {
    type ICatalogAttribute,
    type IMeasureMetadataObject,
    type IMeasureMetadataObjectDefinition,
    type MetricType,
} from "@gooddata/sdk-model";

import { SaveNameMode } from "../Content/EditMetricContent.data.js";
import { type FormField } from "../Form/data.js";
import { type IMetricInfo, type IMetricInfoDraft, MetricInfoKind } from "../MetricState/metricState.data.js";

import { emptyMetric, emptyMetricWithId } from "./emptyMetric.js";
import { generateUniqId, generateUniqTitle } from "./nameGenerators.js";
import { addPrefixToId, removePrefixFromId } from "./prefixHelper.js";
import { transformToMetricDefinition } from "./transformer.js";

export type IMeasureDef = (IMeasureMetadataObjectDefinition | IMeasureMetadataObject) & { prefix?: string };

export type IMeasureSetting = {
    sqlOpen: boolean;
    computedFor: string | null;
    attributes: ICatalogAttribute[];
    display: { limit: 10 | 100 | 1000 | 10000; ranking: "top" | "bottom" };
};

function normalizeMetricType(metricType?: MetricType): MetricType | undefined {
    return metricType === "UNSPECIFIED" ? undefined : metricType;
}

export function prepareMetricForSaveAs(
    initialValueMetric: IMeasureDef,
    metricToSaveAs: IMeasureDef,
    metrics: IMeasureMetadataObject[] = [],
    prefix = "",
    parents: string[] = [],
): {
    metric: IMeasureMetadataObjectDefinition;
    updatedFields: {
        id: boolean;
        title: boolean;
    };
} {
    const oldMetric = transformToMetricDefinition(initialValueMetric);
    const newMetric = createDefinitionByMetric(metricToSaveAs);
    newMetric.id = metricToSaveAs.id;

    const fieldsToGenerate = {
        id: oldMetric.id === metricToSaveAs.id,
        title: oldMetric.title === metricToSaveAs.title,
    };

    if (fieldsToGenerate.title) {
        newMetric.title = generateUniqTitle(metricToSaveAs, metrics);
    }

    if (fieldsToGenerate.id) {
        newMetric.id = addPrefixToId(prefix, generateUniqId(newMetric.title, prefix, metrics, parents));
    } else if (newMetric.id) {
        newMetric.id = addPrefixToId(prefix, removePrefixFromId(prefix, newMetric.id));
    }

    return { metric: newMetric, updatedFields: fieldsToGenerate };
}

export function createDefinitionByMetric(metric: IMeasureDef): IMeasureMetadataObjectDefinition {
    const { title, description, expression, tags, format, metricType } = metric;
    const base = {
        ...emptyMetric,
        title,
        description,
        expression,
        tags,
        metricType,
    };
    // Include format only when explicitly set (not null/undefined)
    // so backend uses organization/workspace default when omitted
    if (format === null || format === undefined) {
        return base;
    }
    return { ...base, format };
}

export function createNewMetricInfo(
    identifier: string,
    prescription?: IMeasureDef,
    metrics: IMeasureMetadataObject[] = [],
    prefix = "",
    parents: string[] = [],
): IMetricInfo {
    const metric = prescription
        ? prepareMetricForSaveAs(prescription, prescription, metrics, prefix, parents).metric
        : emptyMetricWithId;

    return {
        initial: metric,
        current: metric,
        kind: MetricInfoKind.Create,
        saveMode: SaveNameMode.saveAsNew,
        generateNewId: true,
        identifier,
        //data
        sqlOpen: false,
        computedFor: null,
        attributes: [],
        display: { limit: 10, ranking: "top" },
    };
}

export function createDraftNewMetricInfo(): IMetricInfoDraft {
    return {
        initial: { ...emptyMetricWithId },
        current: emptyMetricWithId,
        kind: MetricInfoKind.Create,
        saveMode: SaveNameMode.saveAsNew,
        generateNewId: true,
        //data
        sqlOpen: false,
        computedFor: null,
        attributes: [],
        display: { limit: 10, ranking: "top" },
    };
}

export function createEditMetricInfo(identifier: string, metric: IMeasureDef): IMetricInfo {
    // Ensure metricType is preserved (can be undefined, "CURRENCY", or "UNSPECIFIED")
    const normalizedMetric = {
        ...metric,
        format: metric.format,
        metricType: normalizeMetricType(metric.metricType),
    };
    return {
        initial: { ...normalizedMetric },
        current: normalizedMetric,
        kind: MetricInfoKind.Edit,
        saveMode: SaveNameMode.save,
        generateNewId: false,
        identifier,
        //data
        sqlOpen: false,
        computedFor: null,
        attributes: [],
        display: { limit: 10, ranking: "top" },
    };
}

export function createDraftEditMetricInfo(
    metric: IMeasureDef,
    saveMode?: SaveNameMode,
    focusedField?: FormField,
    generateNewId?: boolean,
): IMetricInfoDraft {
    return {
        initial: { ...metric },
        current: metric,
        kind: MetricInfoKind.Edit,
        saveMode,
        generateNewId,
        focusedField,
        //data
        sqlOpen: false,
        computedFor: null,
        attributes: [],
        display: { limit: 10, ranking: "top" },
    };
}
