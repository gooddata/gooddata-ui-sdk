// (C) 2019-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { collectionItemsIdentityKey } from "@gooddata/sdk-backend-base";
import { type ICollectionItemsConfig, type IExecutionResult, NoDataError } from "@gooddata/sdk-backend-spi";
import {
    type IExecutionDefinition,
    type ObjRef,
    isAttributeDescriptor,
    isIdentifierRef,
} from "@gooddata/sdk-model";

import { DataViewAll, dataViewWindow, recordedDataView } from "../execution.js";
import { recordedBackend } from "../index.js";
import { type ScenarioRecording } from "../types.js";

describe("recordedDataView", () => {
    it("should load data view with all data", () => {
        const dv = recordedDataView(
            ReferenceRecordings.Scenarios.BarChart.SingleMeasure as ScenarioRecording,
        );

        expect(dv).toBeDefined();
        expect(dv.data).toBeDefined();
        expect(dv.result).toBeDefined();
    });

    it("should load data view with one page of data", () => {
        const dv = recordedDataView(
            ReferenceRecordings.Scenarios.PivotTable.SingleAttribute as ScenarioRecording,
            dataViewWindow([0, 0], [100, 1000]),
        );

        expect(dv).toBeDefined();
        expect(dv.data).toBeDefined();
        expect(dv.result).toBeDefined();
    });

    it("should load result with idRefs if asked to", () => {
        const dv = recordedDataView(
            ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewBy as ScenarioRecording,
            DataViewAll,
            "id",
        );

        assertExpectedRefs(dv.result, isIdentifierRef);
    });
});

describe("execution factory", () => {
    it("should load result with idRefs if asked to", async () => {
        const result = await recordedBackend(ReferenceRecordings.Recordings, {
            useRefType: "id",
        })
            .workspace("reference-workspace")
            .execution()
            .forDefinition(
                ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewBy.execution
                    .definition as IExecutionDefinition,
            )
            .execute();

        assertExpectedRefs(result, isIdentifierRef);
    });
});

describe("readCollectionItems", () => {
    it("returns recorded collection items when key exists and has features", async () => {
        const config: ICollectionItemsConfig = {
            collectionId: "regions",
            values: ["CA"],
        };
        const key = collectionItemsIdentityKey(config);
        const recordings = {
            ...ReferenceRecordings.Recordings,
            collectionItems: {
                [key]: {
                    type: "FeatureCollection",
                    features: [createFeature("US-CA")],
                },
            },
        };

        const dataView = await readAllFromReferenceScenario(recordings);
        const result = await dataView.readCollectionItems(config);

        expect(result.type).toBe("FeatureCollection");
        expect(result.features).toHaveLength(1);
    });

    it("returns empty collection items when key exists and has no features", async () => {
        const config: ICollectionItemsConfig = {
            collectionId: "regions",
            values: ["CA"],
        };
        const key = collectionItemsIdentityKey(config);
        const recordings = {
            ...ReferenceRecordings.Recordings,
            collectionItems: {
                [key]: {
                    type: "FeatureCollection",
                    features: [],
                },
            },
        };

        const dataView = await readAllFromReferenceScenario(recordings);
        const result = await dataView.readCollectionItems(config);

        expect(result.type).toBe("FeatureCollection");
        expect(result.features).toEqual([]);
    });

    it("throws NoDataError when collection items key is missing", async () => {
        const config: ICollectionItemsConfig = {
            collectionId: "regions",
            values: ["CA"],
        };
        const recordings = {
            ...ReferenceRecordings.Recordings,
            collectionItems: {},
        };

        const dataView = await readAllFromReferenceScenario(recordings);

        await expect(dataView.readCollectionItems(config)).rejects.toThrow(NoDataError);
    });
});

async function readAllFromReferenceScenario(recordings: typeof ReferenceRecordings.Recordings) {
    const definition = ReferenceRecordings.Scenarios.BarChart.SingleMeasure.execution
        .definition as IExecutionDefinition;
    const result = await recordedBackend(recordings)
        .workspace("reference-workspace")
        .execution()
        .forDefinition(definition)
        .execute();

    return result.readAll();
}

function createFeature(id: string): GeoJSON.Feature<GeoJSON.Geometry, GeoJSON.GeoJsonProperties> {
    return {
        type: "Feature",
        id,
        geometry: {
            type: "Polygon",
            coordinates: [
                [
                    [0, 0],
                    [1, 0],
                    [1, 1],
                    [0, 1],
                    [0, 0],
                ],
            ],
        },
        properties: {},
    };
}

function assertExpectedRefs(result: IExecutionResult, verifyFun: (ref: ObjRef) => boolean) {
    result.dimensions.forEach((dim) => {
        dim.headers.forEach((descriptor) => {
            if (isAttributeDescriptor(descriptor)) {
                expect(verifyFun(descriptor.attributeHeader.ref)).toBeTruthy();
                expect(verifyFun(descriptor.attributeHeader.formOf.ref)).toBeTruthy();
            } else {
                descriptor.measureGroupHeader.items.forEach((descriptor) => {
                    if (descriptor.measureHeaderItem.ref) {
                        expect(verifyFun(descriptor.measureHeaderItem.ref)).toBeTruthy();
                    }
                });
            }
        });
    });
}
