// (C) 2026 GoodData Corporation

import { renderHook, waitFor } from "@testing-library/react";
import { createIntl } from "react-intl";
import { afterEach, describe, expect, it } from "vitest";

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

afterEach(() => {
    clearLayerAdapters();
    registerLayerAdapter("pushpin", pushpinAdapter);
    registerLayerAdapter("area", areaAdapter);
});

describe("useLayersTooltipData", () => {
    it("isolates a layer whose plan-building throws and keeps the others", async () => {
        registerLayerAdapter("area", {
            buildTooltipExecution: () => {
                throw new Error("plan boom");
            },
        } as unknown as IGeoLayerAdapterByType<"area">);
        registerLayerAdapter("pushpin", {
            buildTooltipExecution: () => ({
                execution: survivingTooltipExecution,
                buildFeatureKey: survivingBuildFeatureKey,
            }),
        } as unknown as IGeoLayerAdapterByType<"pushpin">);

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
});
