// (C) 2007-2019 GoodData Corporation
import { pivotTableWithSubtotals } from "../../../../__mocks__/fixtures";
import { fixEmptyHeaderItems } from "../fixEmptyHeaderItems";
import cloneDeep = require("lodash/cloneDeep");

const EmptyHeaderString = "EmptyHeader";
const TestInput = pivotTableWithSubtotals.dataView;

describe("fixEmptyHeaderItems", () => {
    it("should replace empty values in all types of headerItems", () => {
        const missingHeaders: any = cloneDeep(TestInput);
        missingHeaders.headerItems[0][0][0].attributeHeaderItem.name = "";
        missingHeaders.headerItems[1][0][0].measureHeaderItem.name = "";
        missingHeaders.headerItems[0][2][2].totalHeaderItem.name = "";

        fixEmptyHeaderItems(missingHeaders, EmptyHeaderString);

        expect(missingHeaders.headerItems[0][0][0].attributeHeaderItem.name).toEqual(EmptyHeaderString);
        expect(missingHeaders.headerItems[1][0][0].measureHeaderItem.name).toEqual(EmptyHeaderString);
        expect(missingHeaders.headerItems[0][2][2].totalHeaderItem.name).toEqual(EmptyHeaderString);
    });
});
