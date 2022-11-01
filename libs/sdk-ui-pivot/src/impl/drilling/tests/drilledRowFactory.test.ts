// (C) 2007-2022 GoodData Corporation
import { createTestRow, TwoMeasuresWithTwoRowAndTwoColumnAttributesDescriptor } from "./drilling.fixture";
import { ReferenceData } from "@gooddata/reference-workspace";
import { createDrilledRow } from "../drilledRowFactory";

describe("createDrilledRow", () => {
    const TestTable = TwoMeasuresWithTwoRowAndTwoColumnAttributesDescriptor;
    const TestRowForBearAttribute = createTestRow(TestTable, [
        ReferenceData.ProductName.CompuSci,
        ReferenceData.Department.DirectSales,
    ]);
    const TestRowForTigerAttribute = createTestRow(TestTable, [
        { uri: "arbitrary_pk_that_is_not_link", title: "value1" },
        { uri: "arbitrary_pk_that_is_not_a_link", title: "value2" },
    ]);
    const TestRowForTigerDateAttribute = createTestRow(TestTable, [
        { uri: "arbitrary_pk_that_is_not_link", title: "value1", formattedName: "formattedName1" },
        { uri: "arbitrary_pk_that_is_not_a_link", title: "value2", formattedName: "formattedName2" },
    ]);

    it("creates drill row with extracted id when /gdc uri", () => {
        expect(createDrilledRow(TestRowForBearAttribute, TestTable)).toMatchSnapshot();
    });

    it("creates drill row with extracted id when no link in attribute uri", () => {
        expect(createDrilledRow(TestRowForTigerAttribute, TestTable)).toMatchSnapshot();
    });

    it("creates drill row with name when formattedName is present", () => {
        expect(createDrilledRow(TestRowForTigerDateAttribute, TestTable)).toMatchSnapshot();
    });
});
