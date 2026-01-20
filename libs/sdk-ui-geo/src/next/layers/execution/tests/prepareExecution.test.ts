// (C) 2025-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { attributeDisplayFormRef, bucketAttribute, idRef, newAttribute } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { areaAdapter } from "../../area/adapter.js";
import { createAreaLayer } from "../../area/layerFactory.js";
import { TOOLTIP_TEXT_ATTRIBUTE_LOCAL_ID } from "../../common/constants.js";
import { pushpinAdapter } from "../../pushpin/adapter.js";
import { createPushpinLayer } from "../../pushpin/layerFactory.js";

const backend = dummyBackend();
const workspace = "test-workspace";

const latitudeAttribute = newAttribute(idRef("attr.lat"), (a) => a.localId("lat"));
const longitudeAttribute = newAttribute(idRef("attr.lng"), (a) => a.localId("lng"));
const areaAttribute = newAttribute(idRef("attr.area"), (a) => a.localId("area"));

describe("prepareExecution", () => {
    it("adds TOOLTIP_TEXT bucket for area layers when missing", async () => {
        const layer = createAreaLayer({ area: areaAttribute });
        const execution = areaAdapter.buildExecution(layer, { backend, workspace });

        const prepared = await areaAdapter.prepareExecution?.(layer, { backend, workspace }, execution);
        const tooltipBucket = prepared?.definition.buckets.find(
            (bucket) => bucket.localIdentifier === BucketNames.TOOLTIP_TEXT,
        );
        const tooltipAttribute = tooltipBucket ? bucketAttribute(tooltipBucket) : undefined;

        expect(tooltipBucket).toBeDefined();
        expect(tooltipAttribute).toBeDefined();
        if (!tooltipAttribute) {
            return;
        }
        expect(attributeDisplayFormRef(tooltipAttribute)).toEqual(attributeDisplayFormRef(areaAttribute));
    });

    it("adds TOOLTIP_TEXT bucket for pushpin layers when missing", async () => {
        const layer = createPushpinLayer({ latitude: latitudeAttribute, longitude: longitudeAttribute });
        const execution = pushpinAdapter.buildExecution(layer, { backend, workspace });

        const prepared = await pushpinAdapter.prepareExecution?.(layer, { backend, workspace }, execution);
        const tooltipBucket = prepared?.definition.buckets.find(
            (bucket) => bucket.localIdentifier === BucketNames.TOOLTIP_TEXT,
        );
        const tooltipAttribute = tooltipBucket ? bucketAttribute(tooltipBucket) : undefined;

        expect(tooltipBucket).toBeDefined();
        expect(tooltipAttribute).toBeDefined();
        if (!tooltipAttribute) {
            return;
        }
        expect(attributeDisplayFormRef(tooltipAttribute)).toEqual(attributeDisplayFormRef(latitudeAttribute));
    });

    it("keeps existing TOOLTIP_TEXT bucket unchanged", async () => {
        const tooltipAttribute = newAttribute(idRef("attr.tooltip"), (a) =>
            a.localId(TOOLTIP_TEXT_ATTRIBUTE_LOCAL_ID),
        );
        const layer = createAreaLayer({ area: areaAttribute, tooltipText: tooltipAttribute });
        const execution = areaAdapter.buildExecution(layer, { backend, workspace });

        const prepared = await areaAdapter.prepareExecution?.(layer, { backend, workspace }, execution);
        const tooltipBuckets =
            prepared?.definition.buckets.filter(
                (bucket) => bucket.localIdentifier === BucketNames.TOOLTIP_TEXT,
            ) ?? [];
        const tooltipBucketAttribute = tooltipBuckets[0] ? bucketAttribute(tooltipBuckets[0]) : undefined;

        expect(tooltipBuckets).toHaveLength(1);
        expect(tooltipBucketAttribute).toBeDefined();
        if (!tooltipBucketAttribute) {
            return;
        }
        expect(attributeDisplayFormRef(tooltipBucketAttribute)).toEqual(
            attributeDisplayFormRef(tooltipAttribute),
        );
    });
});
