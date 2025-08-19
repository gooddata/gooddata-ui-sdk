// (C) 2019-2025 GoodData Corporation
import { describe, expect, it } from "vitest";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { DataViewAll, dataViewWindow, recordedDataView } from "../execution.js";
import { isIdentifierRef, ObjRef, isAttributeDescriptor, IExecutionDefinition } from "@gooddata/sdk-model";
import { IExecutionResult } from "@gooddata/sdk-backend-spi";
import { recordedBackend } from "../index.js";
import { ScenarioRecording } from "../types.js";

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
        const result = await recordedBackend(ReferenceRecordings.Recordings, { useRefType: "id" })
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
