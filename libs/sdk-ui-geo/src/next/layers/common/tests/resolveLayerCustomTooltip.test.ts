// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { newAttribute } from "@gooddata/sdk-model";
import { type ICustomTooltipConfig } from "@gooddata/sdk-ui-vis-commons";

import { type IGeoChartConfig } from "../../../types/config/unified.js";
import { type IGeoLayerConfig, type IGeoLayerPushpin } from "../../../types/layers/index.js";
import { resolveLayerCustomTooltip } from "../resolveLayerCustomTooltip.js";

const layer = (config?: IGeoLayerConfig): IGeoLayerPushpin => ({
    id: "primary",
    type: "pushpin",
    latitude: newAttribute("lat"),
    longitude: newAttribute("long"),
    ...(config ? { config } : {}),
});

const tooltip: ICustomTooltipConfig = { enabled: true, content: "Region: {label/a1}" };

describe("resolveLayerCustomTooltip", () => {
    it("resolves the layer's own tooltip when the flag is unset (defaults on)", () => {
        const config: IGeoChartConfig = {};
        expect(resolveLayerCustomTooltip(layer({ customTooltip: tooltip }), config)).toEqual(tooltip);
    });

    it("falls back to the chart-level tooltip when the layer has none", () => {
        const config: IGeoChartConfig = { customTooltip: tooltip };
        expect(resolveLayerCustomTooltip(layer(), config)).toEqual(tooltip);
    });

    it("prefers the layer tooltip over the chart-level fallback", () => {
        const config: IGeoChartConfig = { customTooltip: { enabled: true, content: "chart-level" } };
        expect(resolveLayerCustomTooltip(layer({ customTooltip: tooltip }), config)).toEqual(tooltip);
    });

    it("returns undefined when the feature flag is explicitly disabled", () => {
        const config: IGeoChartConfig = { enableCustomTooltip: false, customTooltip: tooltip };
        expect(resolveLayerCustomTooltip(layer({ customTooltip: tooltip }), config)).toBeUndefined();
    });
});
