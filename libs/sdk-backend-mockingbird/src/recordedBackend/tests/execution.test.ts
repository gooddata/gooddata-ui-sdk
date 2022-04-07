// (C) 2019-2022 GoodData Corporation

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { DataViewAll, dataViewWindow, recordedDataView } from "../execution";
import { isIdentifierRef, isUriRef, ObjRef } from "@gooddata/sdk-model";
import { IExecutionResult } from "@gooddata/sdk-backend-spi";
import { isAttributeDescriptor } from "@gooddata/sdk-model";
import { recordedBackend } from "../index";

describe("recordedDataView", () => {
    it("should load data view with all data", () => {
        const dv = recordedDataView(ReferenceRecordings.Scenarios.BarChart.SingleMeasure);

        expect(dv).toBeDefined();
        expect(dv.data).toBeDefined();
        expect(dv.result).toBeDefined();
    });

    it("should load data view with one page of data", () => {
        const dv = recordedDataView(
            ReferenceRecordings.Scenarios.PivotTable.SingleAttribute,
            dataViewWindow([0, 0], [100, 1000]),
        );

        expect(dv).toBeDefined();
        expect(dv.data).toBeDefined();
        expect(dv.result).toBeDefined();
    });

    it("should load result with uriRefs by default", () => {
        const dv = recordedDataView(ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewBy);

        assertExpectedRefs(dv.result, isUriRef);
    });

    it("should load result with idRefs if asked to", () => {
        const dv = recordedDataView(
            ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewBy,
            DataViewAll,
            "id",
        );

        assertExpectedRefs(dv.result, isIdentifierRef);
    });
});

describe("execution factory", () => {
    it("should load result with uriRefs by default", async () => {
        const result = await recordedBackend(ReferenceRecordings.Recordings)
            .workspace("reference-workspace")
            .execution()
            .forDefinition(
                ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewBy.execution.definition,
            )
            .execute();

        assertExpectedRefs(result, isUriRef);
    });

    it("should load result with idRefs if asked to", async () => {
        const result = await recordedBackend(ReferenceRecordings.Recordings, { useRefType: "id" })
            .workspace("reference-workspace")
            .execution()
            .forDefinition(
                ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewBy.execution.definition,
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
