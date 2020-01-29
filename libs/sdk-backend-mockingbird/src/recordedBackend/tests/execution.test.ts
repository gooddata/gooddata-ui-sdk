// (C) 2019-2020 GoodData Corporation

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { dataViewWindow, recordedDataView } from "../execution";

describe("recordedDataView", () => {
    it("should load data view with all data", () => {
        const dv = recordedDataView(ReferenceRecordings.Scenarios.BarChart.SingleMeasure);

        expect(dv).toBeDefined();
        expect(dv.data()).toBeDefined();
        expect(dv.allHeaders()).toBeDefined();
        expect(dv.result()).toBeDefined();
    });

    it("should load data view with one page of data", () => {
        const dv = recordedDataView(
            ReferenceRecordings.Scenarios.PivotTable.SingleAttribute,
            dataViewWindow([0, 0], [100, 1000]),
        );

        expect(dv).toBeDefined();
        expect(dv.data()).toBeDefined();
        expect(dv.allHeaders()).toBeDefined();
        expect(dv.result()).toBeDefined();
    });
});
