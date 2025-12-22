// (C) 2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import type { IExecutionFactory } from "@gooddata/sdk-backend-spi";
import {
    type IExecutionDefinition,
    type IInsightDefinition,
    type INullableFilter,
    idRef,
    newAttribute,
    newPositiveAttributeFilter,
    newRelativeDateFilter,
} from "@gooddata/sdk-model";

import { createAreaLayer } from "../../area/layerFactory.js";
import { createPushpinLayer } from "../../pushpin/layerFactory.js";
import { buildLayerExecution } from "../buildLayerExecution.js";

const backend = dummyBackend();
const workspace = "test-workspace";

const latitudeAttribute = newAttribute(idRef("attr.lat"), (a) => a.localId("lat"));
const longitudeAttribute = newAttribute(idRef("attr.lng"), (a) => a.localId("lng"));
const areaAttribute = newAttribute(idRef("attr.area"), (a) => a.localId("area"));

function getFiltersFromExecution(executionDefinition: IExecutionDefinition) {
    return executionDefinition.filters ?? [];
}

describe("buildLayerExecution", () => {
    it("applies layer and global filters with global filters overriding", () => {
        const layerFilter = newPositiveAttributeFilter("attr.layer", ["layer-value"]);
        const globalFilter = newRelativeDateFilter("dataset.date", "GDC.time.year", -1, 0);

        const layer = createPushpinLayer({
            latitude: latitudeAttribute,
            longitude: longitudeAttribute,
            filters: [layerFilter],
        });

        const execution = buildLayerExecution(layer, {
            backend,
            workspace,
            config: undefined,
            execConfig: undefined,
            globalFilters: [globalFilter],
        });

        const filters = getFiltersFromExecution(execution.definition);

        expect(filters).toEqual([layerFilter, globalFilter]);
    });

    it("uses provided executionFactory so downstream decorations (e.g., fixed filters) apply", () => {
        const layer = createAreaLayer({
            area: areaAttribute,
        });

        const factory = backend.workspace(workspace).execution();
        const fixedFilter = newRelativeDateFilter("dataset.extra", "GDC.time.month", -3, 0);

        const decoratedFactory: IExecutionFactory = {
            forDefinition: factory.forDefinition.bind(factory),
            forItems: factory.forItems.bind(factory),
            forBuckets: factory.forBuckets.bind(factory),
            forInsight: (insight: IInsightDefinition, filters: INullableFilter[] = [], options?: any) =>
                factory.forInsight(insight, [...filters, fixedFilter], options),
            forInsightByRef: factory.forInsightByRef.bind(factory),
        };

        const execution = buildLayerExecution(layer, {
            backend,
            workspace,
            config: undefined,
            execConfig: undefined,
            globalFilters: [],
            executionFactory: decoratedFactory,
        });

        const filters = getFiltersFromExecution(execution.definition);

        expect(filters).toEqual([fixedFilter]);
    });

    it("drops null filters before creating the layer insight", () => {
        const layerFilter = newPositiveAttributeFilter("attr.layer", ["layer-value"]);
        const layer = createAreaLayer({
            area: areaAttribute,
            filters: [layerFilter, null],
        });

        const execution = buildLayerExecution(layer, {
            backend,
            workspace,
            config: undefined,
            execConfig: undefined,
            globalFilters: [null],
        });

        const filters = getFiltersFromExecution(execution.definition);

        expect(filters).toEqual([layerFilter]);
    });
});
