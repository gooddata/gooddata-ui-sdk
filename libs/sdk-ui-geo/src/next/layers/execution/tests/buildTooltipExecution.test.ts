// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { idRef, newAttribute } from "@gooddata/sdk-model";
import { buildKeySegment, joinKeySegments } from "@gooddata/sdk-ui-vis-commons";

import { areaAdapter } from "../../area/adapter.js";
import { createAreaLayer } from "../../area/layerFactory.js";
import { pushpinAdapter } from "../../pushpin/adapter.js";
import { EMPTY_SEGMENT_VALUE } from "../../pushpin/constants.js";
import { createPushpinLayer } from "../../pushpin/layerFactory.js";
import { type IGeoAdapterContext } from "../../registry/adapterTypes.js";

const backend = dummyBackend();
const workspace = "test-workspace";

const latitudeAttribute = newAttribute(idRef("attr.lat"), (a) => a.localId("lat"));
const longitudeAttribute = newAttribute(idRef("attr.lng"), (a) => a.localId("lng"));
const areaAttribute = newAttribute(idRef("attr.city"), (a) => a.localId("area"));
const segmentByAttribute = newAttribute(idRef("attr.region"), (a) => a.localId("seg"));

const customTooltipConfig = {
    enabled: true,
    content: "![{label/attr.city}]({label/city.flag})",
};

async function getPreparedPushpinDefinition(
    layer = createPushpinLayer({
        latitude: latitudeAttribute,
        longitude: longitudeAttribute,
    }),
) {
    const context: IGeoAdapterContext = { backend, workspace };
    const execution = pushpinAdapter.buildExecution(layer, context);
    const prepared = await pushpinAdapter.prepareExecution?.(layer, context, execution);
    return { layer, definition: prepared!.definition };
}

async function getPreparedAreaDefinition(layer = createAreaLayer({ area: areaAttribute })) {
    const context: IGeoAdapterContext = { backend, workspace };
    const execution = areaAdapter.buildExecution(layer, context);
    const prepared = await areaAdapter.prepareExecution?.(layer, context, execution);
    return { layer, definition: prepared!.definition };
}

describe("pushpinAdapter.buildTooltipExecution", () => {
    it("builds the tooltip plan from the prepared definition even when layer.tooltipText is missing", async () => {
        // No explicit tooltipText: `prepareExecution` adds the TOOLTIP_TEXT bucket
        // from the location attribute, so the plan is still resolvable.
        const { layer, definition } = await getPreparedPushpinDefinition();
        const context: IGeoAdapterContext = {
            backend,
            workspace,
            config: { customTooltip: customTooltipConfig },
        };

        const built = pushpinAdapter.buildTooltipExecution!(layer, context, definition);

        expect(built).not.toBeNull();
        expect(built?.execution).toBeDefined();
        expect(built?.buildFeatureKey).toBeTypeOf("function");
    });

    it("returns null when the custom tooltip is disabled", async () => {
        const { layer, definition } = await getPreparedPushpinDefinition();
        const context: IGeoAdapterContext = {
            backend,
            workspace,
            config: { customTooltip: { ...customTooltipConfig, enabled: false } },
        };

        expect(pushpinAdapter.buildTooltipExecution!(layer, context, definition)).toBeNull();
    });

    it("returns null when the prepared definition has no TOOLTIP_TEXT bucket", async () => {
        const { layer, definition } = await getPreparedPushpinDefinition();
        const definitionWithoutTooltip = {
            ...definition,
            buckets: definition.buckets.filter((b) => b.localIdentifier !== "tooltipText"),
        };
        const context: IGeoAdapterContext = {
            backend,
            workspace,
            config: { customTooltip: customTooltipConfig },
        };

        expect(pushpinAdapter.buildTooltipExecution!(layer, context, definitionWithoutTooltip)).toBeNull();
    });

    it("derives the feature key from properties.locationName.attrId", async () => {
        const { layer, definition } = await getPreparedPushpinDefinition();
        const context: IGeoAdapterContext = {
            backend,
            workspace,
            config: { customTooltip: customTooltipConfig },
        };

        const built = pushpinAdapter.buildTooltipExecution!(layer, context, definition);
        // The prepared TOOLTIP_TEXT bucket is sourced from latitudeAttribute, so
        // its display-form id is "attr.lat". Feature payloads carry the same id
        // (see pushpin/source.ts → locationNameAttrId).
        const key = built?.buildFeatureKey({
            locationName: { title: "City", attrId: "attr.lat", uri: "/city/cz" },
        });

        expect(key).toBe("attr.lat:/city/cz");
    });

    it("keys off the explicit tooltipText display form when the layer provides one", async () => {
        // With an explicit tooltip-text attribute, the key must come from THAT
        // display form, not the location (latitude) one.
        const tooltipTextAttribute = newAttribute(idRef("attr.region"), (a) => a.localId("ttText"));
        const layer = createPushpinLayer({
            latitude: latitudeAttribute,
            longitude: longitudeAttribute,
            tooltipText: tooltipTextAttribute,
        });
        const { definition } = await getPreparedPushpinDefinition(layer);
        const context: IGeoAdapterContext = {
            backend,
            workspace,
            config: { customTooltip: customTooltipConfig },
        };

        const built = pushpinAdapter.buildTooltipExecution!(layer, context, definition);

        expect(built).not.toBeNull();
        expect(
            built?.buildFeatureKey({
                locationName: { title: "Region", attrId: "attr.region", uri: "/region/bohemia" },
            }),
        ).toBe("attr.region:/region/bohemia");
        // A feature still carrying the location df must NOT match the explicit tooltipText key.
        expect(
            built?.buildFeatureKey({
                locationName: { title: "Region", attrId: "attr.lat", uri: "/region/bohemia" },
            }),
        ).toBeNull();
    });

    it("includes the segment in the feature key, matching buildLookupTable's key format", async () => {
        const layer = createPushpinLayer({
            latitude: latitudeAttribute,
            longitude: longitudeAttribute,
            segmentBy: segmentByAttribute,
        });
        const { definition } = await getPreparedPushpinDefinition(layer);
        const context: IGeoAdapterContext = {
            backend,
            workspace,
            config: { customTooltip: customTooltipConfig },
        };

        const built = pushpinAdapter.buildTooltipExecution!(layer, context, definition);
        const key = built?.buildFeatureKey({
            locationName: { title: "City", attrId: "attr.lat", uri: "/city/cz" },
            segment: { title: "Bohemia", attrId: "attr.region", uri: "/region/bohemia" },
        });

        // buildLookupTable keys a row as joinKeySegments over per-attribute
        // buildKeySegment(dfId, uri). The hover key must use the SAME primitives
        // so the two sides meet — joinKeySegments sorts, so segment order can't drift.
        expect(key).toBe(
            joinKeySegments([
                buildKeySegment("attr.lat", "/city/cz"),
                buildKeySegment("attr.region", "/region/bohemia"),
            ]),
        );
    });

    it("normalizes the EMPTY_SEGMENT_VALUE sentinel to an empty uri so null-segment keys match", async () => {
        const layer = createPushpinLayer({
            latitude: latitudeAttribute,
            longitude: longitudeAttribute,
            segmentBy: segmentByAttribute,
        });
        const { definition } = await getPreparedPushpinDefinition(layer);
        const context: IGeoAdapterContext = {
            backend,
            workspace,
            config: { customTooltip: customTooltipConfig },
        };

        const built = pushpinAdapter.buildTooltipExecution!(layer, context, definition);
        // The pushpin payload writer substitutes EMPTY_SEGMENT_VALUE for a null
        // segment uri (MapLibre `in` filtering); the execution result keeps the
        // original empty uri, so the hover key must normalize the sentinel back to "".
        const key = built?.buildFeatureKey({
            locationName: { title: "City", attrId: "attr.lat", uri: "/city/cz" },
            segment: { title: "(empty value)", attrId: "attr.region", uri: EMPTY_SEGMENT_VALUE },
        });

        expect(key).toBe(
            joinKeySegments([buildKeySegment("attr.lat", "/city/cz"), buildKeySegment("attr.region", "")]),
        );
    });

    it("returns null when a segmented feature's segment df does not match the layer", async () => {
        const layer = createPushpinLayer({
            latitude: latitudeAttribute,
            longitude: longitudeAttribute,
            segmentBy: segmentByAttribute,
        });
        const { definition } = await getPreparedPushpinDefinition(layer);
        const context: IGeoAdapterContext = {
            backend,
            workspace,
            config: { customTooltip: customTooltipConfig },
        };

        const built = pushpinAdapter.buildTooltipExecution!(layer, context, definition);
        const key = built?.buildFeatureKey({
            locationName: { title: "City", attrId: "attr.lat", uri: "/city/cz" },
            segment: { title: "Bohemia", attrId: "attr.WRONG", uri: "/region/bohemia" },
        });

        expect(key).toBeNull();
    });
});

describe("areaAdapter.buildTooltipExecution", () => {
    it("keeps working unchanged (regression guard for the parity fix)", async () => {
        const { layer, definition } = await getPreparedAreaDefinition();
        const context: IGeoAdapterContext = {
            backend,
            workspace,
            config: { customTooltip: customTooltipConfig },
        };

        const built = areaAdapter.buildTooltipExecution!(layer, context, definition);
        expect(built).not.toBeNull();
    });
});
