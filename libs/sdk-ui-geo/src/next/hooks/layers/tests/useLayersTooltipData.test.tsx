// (C) 2026 GoodData Corporation

import { renderHook, waitFor } from "@testing-library/react";
import { createIntl } from "react-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import { dummyBackendEmptyData, dummyDataView } from "@gooddata/sdk-backend-mockingbird";
import { idRef, newAttribute } from "@gooddata/sdk-model";
import { DataViewFacade } from "@gooddata/sdk-ui";
import { type ITooltipExecution } from "@gooddata/sdk-ui-vis-commons";

import { areaAdapter } from "../../../layers/area/adapter.js";
import { createAreaLayer } from "../../../layers/area/layerFactory.js";
import { type BuildFeatureKey } from "../../../layers/common/customTooltipExecution.js";
import { pushpinAdapter } from "../../../layers/pushpin/adapter.js";
import { createPushpinLayer } from "../../../layers/pushpin/layerFactory.js";
import { clearLayerAdapters, registerLayerAdapter } from "../../../layers/registry/adapterRegistry.js";
import { type IGeoLayerAdapterByType } from "../../../layers/registry/adapterTypes.js";
import { type ILayerExecutionRecord } from "../../../types/props/geoChart/internal.js";
import { useLayersTooltipData } from "../useLayersTooltipData.js";

// Per-REFERENCE fan-out isolation (batch rejects → surviving refs resolve, bad
// ref absent) is covered in sdk-ui-vis-commons (useTooltipLookupExecutions).
// This covers the geo-specific guard: a layer whose plan-building throws must
// not take the others down, and the surviving layer's buildFeatureKey must
// travel through to the result.

const intl = createIntl({ locale: "en-US", messages: {} });
const backend = dummyBackendEmptyData();
const workspace = "ws";

const areaLayer = createAreaLayer({ area: newAttribute(idRef("attr.city"), (a) => a.localId("area")) });
const pushpinLayer = createPushpinLayer({
    latitude: newAttribute(idRef("attr.lat"), (a) => a.localId("lat")),
    longitude: newAttribute(idRef("attr.lng"), (a) => a.localId("lng")),
});

// A real (empty-data) prepared execution: readAll resolves to an empty dataView,
// so buildLookupTable produces an empty lookup without a hand-built fixture.
const survivingPrepared = backend
    .workspace(workspace)
    .execution()
    .forItems([newAttribute(idRef("attr.x"), (a) => a.localId("x"))]);

const survivingBuildFeatureKey: BuildFeatureKey = () => "feature-key";

const survivingTooltipExecution: ITooltipExecution = {
    batch: {
        execution: survivingPrepared,
        meta: { labelCountMap: {}, measureIdMap: {}, labelIdMap: {} },
    },
    perRef: () => [],
};

// Only `.definition` is read by the planner, and the fake adapters ignore it.
const dataViewFacade = DataViewFacade.for(dummyDataView(survivingPrepared.definition));
const layerDataViews = new Map<string, DataViewFacade>([
    ["throws", dataViewFacade],
    ["survives", dataViewFacade],
]);

function record(layerId: string, layer: ILayerExecutionRecord["layer"]): ILayerExecutionRecord {
    // `execution` is unused by the tooltip path (definition comes from layerDataViews).
    return { layerId, layer, execution: survivingPrepared };
}

// These tests only exercise the tooltip-planning path, so the adapters only need
// a real `buildTooltipExecution`. The remaining required methods are filled with
// throwing/no-op stubs: a `() => never` is assignable to every method's return
// type and is never invoked here, so the adapters stay fully typed without a cast.
const unusedAdapterMethod = () => {
    throw new Error("adapter method not used in this test");
};

function pushpinAdapterStub(
    overrides: Partial<IGeoLayerAdapterByType<"pushpin">>,
): IGeoLayerAdapterByType<"pushpin"> {
    return {
        type: "pushpin",
        buildExecution: unusedAdapterMethod,
        prepareLayer: unusedAdapterMethod,
        syncToMap: () => {},
        removeFromMap: () => {},
        getMapLibreLayerIds: () => [],
        ...overrides,
    };
}

function areaAdapterStub(overrides: Partial<IGeoLayerAdapterByType<"area">>): IGeoLayerAdapterByType<"area"> {
    return {
        type: "area",
        buildExecution: unusedAdapterMethod,
        prepareLayer: unusedAdapterMethod,
        syncToMap: () => {},
        removeFromMap: () => {},
        getMapLibreLayerIds: () => [],
        ...overrides,
    };
}

afterEach(() => {
    clearLayerAdapters();
    registerLayerAdapter("pushpin", pushpinAdapter);
    registerLayerAdapter("area", areaAdapter);
});

describe("useLayersTooltipData", () => {
    it("isolates a layer whose plan-building throws and keeps the others", async () => {
        registerLayerAdapter(
            "area",
            areaAdapterStub({
                buildTooltipExecution: () => {
                    throw new Error("plan boom");
                },
            }),
        );
        registerLayerAdapter(
            "pushpin",
            pushpinAdapterStub({
                buildTooltipExecution: () => ({
                    execution: survivingTooltipExecution,
                    buildFeatureKey: survivingBuildFeatureKey,
                }),
            }),
        );

        const { result } = renderHook(() =>
            useLayersTooltipData({
                layerExecutions: [record("throws", areaLayer), record("survives", pushpinLayer)],
                layerDataViews,
                backend,
                workspace,
                config: { customTooltip: { enabled: true, content: "{label/x}" } },
                intl,
            }),
        );

        await waitFor(() => expect(result.current.tooltipLookups.size).toBeGreaterThan(0));

        expect(result.current.tooltipLookups.has("throws")).toBe(false);
        expect(result.current.tooltipLookups.has("survives")).toBe(true);
        expect(result.current.tooltipLookups.get("survives")?.buildFeatureKey).toBe(survivingBuildFeatureKey);
    });

    it("plans a layer with its own customTooltip even when chart-level config has none (F1-2543)", async () => {
        registerLayerAdapter(
            "pushpin",
            pushpinAdapterStub({
                buildTooltipExecution: () => ({
                    execution: survivingTooltipExecution,
                    buildFeatureKey: survivingBuildFeatureKey,
                }),
            }),
        );

        const layerWithOwnTooltip = {
            ...pushpinLayer,
            config: { customTooltip: { enabled: true, content: "{label/x}" } },
        };

        const { result } = renderHook(() =>
            useLayersTooltipData({
                layerExecutions: [record("survives", layerWithOwnTooltip)],
                layerDataViews,
                backend,
                workspace,
                // No chart-level custom tooltip — only the layer carries one.
                config: {},
                intl,
            }),
        );

        await waitFor(() => expect(result.current.tooltipLookups.has("survives")).toBe(true));
    });

    it("falls back to the chart-level config when a layer has no tooltip of its own (direct API)", async () => {
        registerLayerAdapter(
            "pushpin",
            pushpinAdapterStub({
                buildTooltipExecution: () => ({
                    execution: survivingTooltipExecution,
                    buildFeatureKey: survivingBuildFeatureKey,
                }),
            }),
        );

        const { result } = renderHook(() =>
            useLayersTooltipData({
                layerExecutions: [record("survives", pushpinLayer)],
                layerDataViews,
                backend,
                workspace,
                // Layer carries no config; tooltip comes only from chart-level config.
                config: { customTooltip: { enabled: true, content: "{label/x}" } },
                intl,
            }),
        );

        await waitFor(() => expect(result.current.tooltipLookups.has("survives")).toBe(true));
    });

    it("re-plans when the chart-level custom tooltip content changes (direct API, F1-2543)", () => {
        const buildTooltipExecution = vi.fn(() => ({
            execution: survivingTooltipExecution,
            buildFeatureKey: survivingBuildFeatureKey,
        }));
        registerLayerAdapter("pushpin", pushpinAdapterStub({ buildTooltipExecution }));

        // Stable layerExecutions (no per-layer config): only the chart-level tooltip changes,
        // so the normalization fingerprint / layerExecutions identity stay the same.
        const stableLayerExecutions = [record("survives", pushpinLayer)];

        const { rerender } = renderHook(
            ({ content }) =>
                useLayersTooltipData({
                    layerExecutions: stableLayerExecutions,
                    layerDataViews,
                    backend,
                    workspace,
                    config: { customTooltip: { enabled: true, content } },
                    intl,
                }),
            { initialProps: { content: "{label/a}" } },
        );

        const callsBefore = buildTooltipExecution.mock.calls.length;
        // Guard the comparison below: without this, an initial-planning regression to
        // zero calls would leave callsBefore at 0 and still satisfy `> 0` on rerender.
        expect(callsBefore).toBeGreaterThan(0);
        rerender({ content: "{label/b}" });

        // Switching between two enabled chart-level templates must trigger a fresh plan.
        expect(buildTooltipExecution.mock.calls.length).toBeGreaterThan(callsBefore);
    });

    it("plans nothing when neither the layer nor the chart config has a custom tooltip", () => {
        registerLayerAdapter(
            "pushpin",
            pushpinAdapterStub({
                buildTooltipExecution: () => ({
                    execution: survivingTooltipExecution,
                    buildFeatureKey: survivingBuildFeatureKey,
                }),
            }),
        );

        const { result } = renderHook(() =>
            useLayersTooltipData({
                layerExecutions: [record("survives", pushpinLayer)],
                layerDataViews,
                backend,
                workspace,
                config: {},
                intl,
            }),
        );

        expect(result.current.tooltipLookups.size).toBe(0);
    });
});
