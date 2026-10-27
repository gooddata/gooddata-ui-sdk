// (C) 2020-2026 GoodData Corporation

import { compact } from "lodash-es";

import { type IAnalyticalBackend, type IBackendCapabilities } from "@gooddata/sdk-backend-spi";
import {
    type AttributeFilterItem,
    type DateFilterItem,
    type IMeasureValueFilter as IEmbeddingMeasureValueFilter,
} from "@gooddata/sdk-embedding";
import {
    type ICatalogAttribute,
    type IDashboardDateFilter,
    type IDashboardMeasureValueFilter,
    type IFilter,
    type IInsight,
    type IInsightDefinition,
    type IInsightWidget,
    type ObjRef,
    catalogComputedAttributeAsCatalogAttribute,
} from "@gooddata/sdk-model";

import { isComputedAttributesUnavailableError } from "../../../_staging/catalog/computedAttributes.js";

import { getAttributeFilterItems } from "./attributeFilters.js";
import { getDateFilterItems, getWidgetDateFilterItem } from "./dateFilters.js";
import { filterDashboardMvfsForWidget, toMeasureValueFilterItems } from "./measureValueFilters.js";

export type InsightEditorFilterItem = DateFilterItem | AttributeFilterItem | IEmbeddingMeasureValueFilter;

export interface IInsightEditorFilterContextInput {
    widget: IInsightWidget;
    insight: IInsight;
    appliedFilters: IFilter[];
    availableAttributes: ICatalogAttribute[];
    attributeFilterConfigsDisplayAsLabelMap: Map<string, ObjRef> | undefined;
    capabilities: IBackendCapabilities;
    dateFilter: IDashboardDateFilter | undefined;
    isMeasureValueFilterEnabled: boolean;
    measureValueFilters: IDashboardMeasureValueFilter[];
}

/**
 * Builds the filters that the explore flow passes to Analytical Designer, so the explored insight
 * shows the same data as the widget on the dashboard.
 */
export function buildInsightEditorFilterContext(
    input: IInsightEditorFilterContextInput,
): InsightEditorFilterItem[] {
    const { widget, insight, appliedFilters, capabilities } = input;

    const attributeFilters = getAttributeFilterItems(
        appliedFilters,
        insight,
        input.availableAttributes,
        input.attributeFilterConfigsDisplayAsLabelMap,
        !!capabilities.supportsElementUris,
    );

    const measureValueFilters = input.isMeasureValueFilterEnabled
        ? toMeasureValueFilterItems(filterDashboardMvfsForWidget(widget, input.measureValueFilters, insight))
        : [];

    const dateFilters = capabilities.supportsMultipleDateFilters
        ? getDateFilterItems(appliedFilters, insight)
        : compact([getWidgetDateFilterItem(widget, input.dateFilter)]);

    return [...dateFilters, ...attributeFilters, ...measureValueFilters];
}

// The production dataset needs no ref. Its presence is represented by undefined.
const PRODUCTION_DATASET_REF: ObjRef | undefined = undefined;

/**
 * Loads the attributes that can filter the insight. Dashboard filters on other attributes do not
 * pass to Analytical Designer.
 */
export async function loadInsightAvailableAttributes(
    backend: IAnalyticalBackend,
    workspace: string,
    insight: IInsight,
    enableComputedAttributes: boolean,
): Promise<ICatalogAttribute[]> {
    const nonDateDataSetRefs = await getNonDateDataSetRefs(backend, workspace, insight);

    // Computed attributes load separately, so they can never fail a plain attributes request.
    // The listing is skipped when the setting is off: the backend then refuses it (400).
    const loads = [
        ...nonDateDataSetRefs.map((dataSetRef) =>
            loadDataSetAttributes(backend, workspace, dataSetRef, insight),
        ),
        ...(enableComputedAttributes ? [loadComputedAttributes(backend, workspace, insight)] : []),
    ];
    const attributesPerDataSet = await Promise.all(loads);
    return attributesPerDataSet.flat();
}

async function getNonDateDataSetRefs(
    backend: IAnalyticalBackend,
    workspace: string,
    insight: IInsight,
): Promise<Array<ObjRef | undefined>> {
    if (!backend.capabilities.supportsNonProductionDatasets) {
        return [PRODUCTION_DATASET_REF];
    }

    const referencedObjects = await backend
        .workspace(workspace)
        .insights()
        .getInsightReferencedObjects(insight, ["dataSet"]);
    const dataSetMeta = referencedObjects.dataSetMeta ?? [];
    const nonProductionRefs = dataSetMeta.filter((meta) => !meta.production).map((meta) => meta.ref);
    const containsProduction = dataSetMeta.some((meta) => meta.production);
    return containsProduction ? [PRODUCTION_DATASET_REF, ...nonProductionRefs] : nonProductionRefs;
}

async function loadDataSetAttributes(
    backend: IAnalyticalBackend,
    workspace: string,
    dataSetRef: ObjRef | undefined,
    insight: IInsightDefinition,
): Promise<ICatalogAttribute[]> {
    const loader = backend.workspace(workspace).catalog().forTypes(["attribute"]);
    const catalog = await (
        dataSetRef ? loader.forDataset(dataSetRef) : loader.withOptions({ production: true })
    ).load();
    const availableItems = await catalog.availableItems().forInsight(insight).load();
    return availableItems.availableAttributes();
}

async function loadComputedAttributes(
    backend: IAnalyticalBackend,
    workspace: string,
    insight: IInsightDefinition,
): Promise<ICatalogAttribute[]> {
    try {
        const catalog = await backend.workspace(workspace).catalog().forTypes(["computedAttribute"]).load();
        const availableItems = await catalog.availableItems().forInsight(insight).load();
        return availableItems.availableComputedAttributes().map(catalogComputedAttributeAsCatalogAttribute);
    } catch (error) {
        // Degrade only when computed attributes are not available. A genuine failure propagates.
        if (isComputedAttributesUnavailableError(error)) {
            return [];
        }
        throw error;
    }
}
