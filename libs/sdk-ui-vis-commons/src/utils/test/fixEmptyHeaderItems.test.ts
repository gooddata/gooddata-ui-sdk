// (C) 2007-2025 GoodData Corporation
import { cloneDeep } from "lodash-es";
import { describe, expect, it } from "vitest";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import {
    DataViewFirstPage,
    type ScenarioRecording,
    recordedDataView,
} from "@gooddata/sdk-backend-mockingbird";

import { fixEmptyHeaderItems } from "../fixEmptyHeaderItems.js";

const EmptyHeaderString = "EmptyHeader";
const TestInput = recordedDataView(
    ReferenceRecordings.Scenarios.PivotTable.TwoMeasuresAndMultipleSubtotals as ScenarioRecording,
    DataViewFirstPage,
);

describe("fixEmptyHeaderItems", () => {
    it("should replace empty values in all types of headerItems", () => {
        const missingHeaders: any = cloneDeep(TestInput);
        missingHeaders.headerItems[0][0][0].attributeHeaderItem.name = "";
        missingHeaders.headerItems[1][2][0].measureHeaderItem.name = "";
        missingHeaders.headerItems[0][1][2].totalHeaderItem.name = "";

        fixEmptyHeaderItems(missingHeaders, EmptyHeaderString);

        expect(missingHeaders.headerItems[0][0][0].attributeHeaderItem.name).toEqual(EmptyHeaderString);
        expect(missingHeaders.headerItems[1][2][0].measureHeaderItem.name).toEqual(EmptyHeaderString);
        expect(missingHeaders.headerItems[0][1][2].totalHeaderItem.name).toEqual(EmptyHeaderString);
    });
});
