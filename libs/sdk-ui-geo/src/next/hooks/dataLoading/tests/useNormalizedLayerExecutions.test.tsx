// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { dummyBackendEmptyData } from "@gooddata/sdk-backend-mockingbird";
import { idRef, newAttribute } from "@gooddata/sdk-model";

import { createPushpinLayer } from "../../../layers/pushpin/layerFactory.js";
import { type IGeoLayerPushpin } from "../../../types/layers/index.js";
import { useNormalizedLayerExecutions } from "../useNormalizedLayerExecutions.js";

const backend = dummyBackendEmptyData();

const baseLayer = createPushpinLayer({
    latitude: newAttribute(idRef("attr.lat"), (a) => a.localId("lat")),
    longitude: newAttribute(idRef("attr.lng"), (a) => a.localId("lng")),
});

function executionForTooltipContent(content: string) {
    const layer: IGeoLayerPushpin = {
        ...baseLayer,
        config: { customTooltip: { enabled: true, content } },
    };
    return backend
        .workspace("ws")
        .execution()
        .forItems([newAttribute(idRef("attr.lat"), (a) => a.localId("lat"))])
        .withContext(layer);
}

describe("useNormalizedLayerExecutions", () => {
    it("invalidates the normalization cache when only a layer's customTooltip changes (F1-2543)", () => {
        const { result, rerender } = renderHook(
            ({ content }) =>
                useNormalizedLayerExecutions({
                    execution: executionForTooltipContent(content),
                    type: "pushpin",
                }),
            { initialProps: { content: "first" } },
        );

        expect(result.current.layerExecutions[0]?.layer.config?.customTooltip?.content).toBe("first");

        rerender({ content: "second" });

        // Same AFM, only the tooltip text changed — the cached layer must not be reused,
        // otherwise the map would keep planning/rendering the previous template.
        expect(result.current.layerExecutions[0]?.layer.config?.customTooltip?.content).toBe("second");
    });
});
