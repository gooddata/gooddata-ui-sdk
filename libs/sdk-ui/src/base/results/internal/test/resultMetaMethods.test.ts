// (C) 2020-2025 GoodData Corporation

import { cloneDeep } from "lodash-es";
import { describe, expect, it } from "vitest";

import { ReferenceData, ReferenceMd, ReferenceRecordings } from "@gooddata/reference-workspace";
import { DataViewFirstPage, ScenarioRecording, recordedDataView } from "@gooddata/sdk-backend-mockingbird";
import { ISortItem, newAttributeLocator, newMeasureSort } from "@gooddata/sdk-model";

import { DataViewFacade } from "../../facade.js";

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
            ReferenceRecordings.Scenarios.PivotTable
                .SingleMeasureWithRowAndColumnAttributes as unknown as ScenarioRecording,
            DataViewFirstPage,
            [],
        ],
        [
            "strips invalid measure sort when no measures in result",
            ReferenceRecordings.Scenarios.PivotTable.SingleAttribute as unknown as ScenarioRecording,
            DataViewFirstPage,
            [newMeasureSort(ReferenceMd.Amount)],
        ],
        [
            "strips invalid measure sort when attribute not present",
            ReferenceRecordings.Scenarios.PivotTable
                .SingleMeasureWithRowAndColumnAttributes as unknown as ScenarioRecording,
            DataViewFirstPage,
            [
                newMeasureSort(ReferenceMd.Amount, "desc", [
                    newAttributeLocator(ReferenceMd.Product.Name, ReferenceData.ProductName.CompuSci.uri),
                ]),
            ],
        ],
        [
            "strips invalid measure sort when attribute element not present",
            ReferenceRecordings.Scenarios.PivotTable
                .SingleMeasureWithRowAndColumnAttributes as unknown as ScenarioRecording,
            DataViewFirstPage,
            [
                newMeasureSort(ReferenceMd.Amount, "desc", [
                    newAttributeLocator(ReferenceMd.Region.Default, "invalid"),
                ]),
            ],
        ],
        [
            "strips invalid measure sort when measure not present",
            ReferenceRecordings.Scenarios.PivotTable
                .SingleMeasureWithRowAndColumnAttributes as unknown as ScenarioRecording,
            DataViewFirstPage,
            [newMeasureSort(ReferenceMd.Won)],
        ],
    ];

    it.each(Scenarios)("effective sort items %s", (_desc, scenario, dataViewId, sortItems) => {
        const dv = dataViewWithModifiedSorts(scenario, dataViewId, sortItems);

        expect(dv.meta().effectiveSortItems()).toMatchSnapshot();
    });
});
