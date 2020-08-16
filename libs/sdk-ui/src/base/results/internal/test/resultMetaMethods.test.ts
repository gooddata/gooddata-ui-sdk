// (C) 2020 GoodData Corporation

import { ISortItem, newAttributeLocator, newMeasureSort } from "@gooddata/sdk-model";
import { ReferenceRecordings, ReferenceLdm, ReferenceData } from "@gooddata/reference-workspace";
import { DataViewFirstPage, recordedDataView, ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";
import cloneDeep from "lodash/cloneDeep";
import { DataViewFacade } from "../../facade";

function dataViewWithModifiedSorts(
    scenario: ScenarioRecording,
    dataViewId: string,
    sortItems: ISortItem[],
): DataViewFacade {
    const scenarioCopy = cloneDeep(scenario);
    const dataView = recordedDataView(scenarioCopy, dataViewId);

    (dataView.definition as any).sortBy = sortItems;

    return DataViewFacade.for(dataView);
}

describe("resultMetaMethods", () => {
    const Scenarios: Array<[string, ScenarioRecording, string, ISortItem[]]> = [
        [
            "are empty if there are no sorts",
            ReferenceRecordings.Scenarios.PivotTable.SingleMeasureWithRowAndColumnAttributes,
            DataViewFirstPage,
            [],
        ],
        [
            "strips invalid measure sort when no measures in result",
            ReferenceRecordings.Scenarios.PivotTable.SingleAttribute,
            DataViewFirstPage,
            [newMeasureSort(ReferenceLdm.Amount)],
        ],
        [
            "strips invalid measure sort when attribute not present",
            ReferenceRecordings.Scenarios.PivotTable.SingleMeasureWithRowAndColumnAttributes,
            DataViewFirstPage,
            [
                newMeasureSort(ReferenceLdm.Amount, "desc", [
                    newAttributeLocator(ReferenceLdm.Product.Name, ReferenceData.ProductName.CompuSci.uri),
                ]),
            ],
        ],
        [
            "strips invalid measure sort when attribute element not present",
            ReferenceRecordings.Scenarios.PivotTable.SingleMeasureWithRowAndColumnAttributes,
            DataViewFirstPage,
            [
                newMeasureSort(ReferenceLdm.Amount, "desc", [
                    newAttributeLocator(ReferenceLdm.Region, "invalid"),
                ]),
            ],
        ],
        [
            "strips invalid measure sort when measure not present",
            ReferenceRecordings.Scenarios.PivotTable.SingleMeasureWithRowAndColumnAttributes,
            DataViewFirstPage,
            [newMeasureSort(ReferenceLdm.Won)],
        ],
    ];

    it.each(Scenarios)("effective sort items %s", (_desc, scenario, dataViewId, sortItems) => {
        const dv = dataViewWithModifiedSorts(scenario, dataViewId, sortItems);

        expect(dv.meta().effectiveSortItems()).toMatchSnapshot();
    });
});
