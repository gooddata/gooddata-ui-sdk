// (C) 2007-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    MultipleMeasuresAndNoColumnsWithMetricsInRows,
    SingleMeasureWithRowAttribute,
    SingleMeasureWithTwoRowAndTwoColumnAttributes,
    TwoMeasuresWithSingleRowAttrWithMetricsInRows,
} from "./table.fixture.js";
import { createColumnLocator, createTransposedColumnLocator } from "../colLocatorFactory.js";
import { TableDescriptor } from "../tableDescriptor.js";
import { MixedValuesCol, ScopeCol, SliceMeasureCol } from "../tableDescriptorTypes.js";

describe("createColumnLocator", () => {
    it("creates valid leaf column locator in table without column attributes", () => {
        const t = TableDescriptor.for(SingleMeasureWithRowAttribute, "empty value");

        expect(createColumnLocator(t.headers.leafDataCols[0])).toMatchSnapshot();
    });

    it("creates valid leaf column locator in table with column attributes", () => {
        const t = TableDescriptor.for(SingleMeasureWithTwoRowAndTwoColumnAttributes, "empty value");

        expect(createColumnLocator(t.headers.leafDataCols[0])).toMatchSnapshot();
    });

    it("creates valid group column locator for top-level group in table with column attributes", () => {
        const t = TableDescriptor.for(SingleMeasureWithTwoRowAndTwoColumnAttributes, "empty value");

        const topLevelGroup = t.headers.rootDataCols[0].children[0] as ScopeCol;

        expect(createColumnLocator(topLevelGroup)).toMatchSnapshot();
    });

    it("creates valid group column locator for second-level group in table with column attributes", () => {
        const t = TableDescriptor.for(SingleMeasureWithTwoRowAndTwoColumnAttributes, "empty value");

        const secondLevelGroup = t.headers.rootDataCols[0].children[0].children[0] as ScopeCol;

        expect(createColumnLocator(secondLevelGroup)).toMatchSnapshot();
    });

    it("creates valid slice measure column locator in transposed table", () => {
        const t = TableDescriptor.for(TwoMeasuresWithSingleRowAttrWithMetricsInRows, "empty value");

        const sliceMeasureCol = t.headers.sliceMeasureCols[0] as SliceMeasureCol;

        expect(createTransposedColumnLocator(sliceMeasureCol)).toMatchSnapshot();
    });

    it("creates valid mixed values column locator in transposed table", () => {
        const t = TableDescriptor.for(MultipleMeasuresAndNoColumnsWithMetricsInRows, "empty value");

        const mixedValuesCol = t.headers.mixedValuesCols[0] as MixedValuesCol;

        expect(createTransposedColumnLocator(mixedValuesCol)).toMatchSnapshot();
    });
});
