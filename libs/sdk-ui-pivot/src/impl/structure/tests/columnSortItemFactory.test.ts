// (C) 2007-2021 GoodData Corporation

import {
    SingleMeasureWithColumnAttribute,
    SingleMeasureWithRowAttribute,
    SingleMeasureWithTwoRowAndTwoColumnAttributes,
} from "./table.fixture";
import { TableDescriptor } from "../tableDescriptor";
import { createSortItemForCol } from "../colSortItemFactory";

describe("createSortItem", () => {
    it("creates valid attribute sort", () => {
        const t = TableDescriptor.for(SingleMeasureWithRowAttribute, "empty value");

        expect(createSortItemForCol(t.headers.sliceCols[0], "asc")).toMatchSnapshot();
    });

    it("creates valid measure sort item when no column attributes", () => {
        const t = TableDescriptor.for(SingleMeasureWithRowAttribute, "empty value");

        expect(createSortItemForCol(t.headers.leafDataCols[0], "asc")).toMatchSnapshot();
    });

    it("creates valid measure sort item when single column attribute", () => {
        const t = TableDescriptor.for(SingleMeasureWithColumnAttribute, "empty value");

        expect(createSortItemForCol(t.headers.leafDataCols[0], "desc")).toMatchSnapshot();
    });

    it("creates valid measure sort item when two attributes", () => {
        const t = TableDescriptor.for(SingleMeasureWithTwoRowAndTwoColumnAttributes, "empty value");

        expect(createSortItemForCol(t.headers.leafDataCols[0], "desc")).toMatchSnapshot();
    });
});
