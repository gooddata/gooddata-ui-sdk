// (C) 2007-2020 GoodData Corporation
import { fixEmptyHeaderItems } from "../fixEmptyHeaderItems";
import cloneDeep = require("lodash/cloneDeep");
import { DataViewFirstPage, recordedDataView } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";

const EmptyHeaderString = "EmptyHeader";
const TestInput = recordedDataView(
    ReferenceRecordings.Scenarios.PivotTable.TwoMeasuresAndMultipleSubtotals,
    DataViewFirstPage,
).dataView;

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
