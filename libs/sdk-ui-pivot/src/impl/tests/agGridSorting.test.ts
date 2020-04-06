// (C) 2007-2020 GoodData Corporation

import { getSortItemByColId, getSortsFromModel } from "../agGridSorting";
import { DataViewFirstPage } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedDataFacade } from "../../../__mocks__/recordings";

describe("getSortItemByColId", () => {
    const fixture = recordedDataFacade(
        ReferenceRecordings.Scenarios.PivotTable.SingleMeasureWithRowAndColumnAttributes,
        DataViewFirstPage,
    );

    it("should return an attributeSortItem", () => {
        expect(getSortItemByColId(fixture.result(), "a_1055", "asc")).toMatchSnapshot();
    });
    it("should return a measureSortItem", () => {
        expect(getSortItemByColId(fixture.result(), "a_1086_460488-m_0", "asc")).toMatchSnapshot();
    });
});

describe("getSortsFromModel", () => {
    const fixture = recordedDataFacade(
        ReferenceRecordings.Scenarios.PivotTable.SingleMeasureWithRowAndColumnAttributes,
        DataViewFirstPage,
    );

    it("should return sortItems for row attribute sort", () => {
        const sortModel: any[] = [
            {
                colId: "a_1055",
                sort: "asc",
            },
        ];
        expect(getSortsFromModel(sortModel, fixture.result())).toMatchSnapshot();
    });
    it("should return sortItems for measure sort", () => {
        const sortModel: any[] = [
            {
                colId: "a_1086_460488-m_0",
                sort: "asc",
            },
        ];
        expect(getSortsFromModel(sortModel, fixture.result())).toMatchSnapshot();
    });
});
