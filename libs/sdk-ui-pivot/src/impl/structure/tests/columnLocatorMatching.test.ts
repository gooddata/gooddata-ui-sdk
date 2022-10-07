// (C) 2007-2021 GoodData Corporation
import { DataViewFacade } from "@gooddata/sdk-ui";
import {
    SingleColumn,
    SingleMeasureWithColumnAttribute,
    SingleMeasureWithTwoRowAndTwoColumnAttributes,
    TwoMeasures,
} from "./table.fixture";
import { ReferenceData, ReferenceMd } from "@gooddata/reference-workspace";
import { ColumnLocator, newAttributeColumnLocator, newMeasureColumnLocator } from "../../../columnWidths";
import { createHeadersAndColDefs } from "../tableDescriptorFactory";
import { searchForLocatorMatch } from "../colLocatorMatching";

describe("searchForLocatorMatch", () => {
    const Scenarios: Array<[string, ColumnLocator[], DataViewFacade, string | undefined]> = [
        [
            "matches first measure locator in two measure table",
            [newMeasureColumnLocator(ReferenceMd.Amount)],
            TwoMeasures,
            "c_0",
        ],
        [
            "matches second measure locator in two measure table",
            [newMeasureColumnLocator(ReferenceMd.Won)],
            TwoMeasures,
            "c_1",
        ],
        [
            "does not match when measure missing in two measure table",
            [newMeasureColumnLocator(ReferenceMd.Probability)],
            TwoMeasures,
            undefined,
        ],
        [
            "matches valid locator in single column attribute table",
            [
                newAttributeColumnLocator(ReferenceMd.Region, ReferenceData.Region.EastCoast.uri),
                newMeasureColumnLocator(ReferenceMd.Amount),
            ],
            SingleMeasureWithColumnAttribute,
            "c_0",
        ],
        [
            "matches another valid locator in single column attribute table",
            [
                newMeasureColumnLocator(ReferenceMd.Amount),
                newAttributeColumnLocator(ReferenceMd.Region, ReferenceData.Region.WestCoast.uri),
            ],
            SingleMeasureWithColumnAttribute,
            "c_1",
        ],
        [
            "does not match locator with non-existent attribute element in single column attribute table",
            [
                newMeasureColumnLocator(ReferenceMd.Amount),
                newAttributeColumnLocator(ReferenceMd.Region, "/does/not/exist"),
            ],
            SingleMeasureWithColumnAttribute,
            undefined,
        ],
        [
            "does match locator in table with two column attributes and single measure",
            [
                newMeasureColumnLocator(ReferenceMd.Amount),
                newAttributeColumnLocator(ReferenceMd.Region, ReferenceData.Region.EastCoast.uri),
                newAttributeColumnLocator(
                    ReferenceMd.StageName.Default,
                    ReferenceData.StageName.Interest.uri,
                ),
            ],
            SingleMeasureWithTwoRowAndTwoColumnAttributes,
            "c_0",
        ],
        [
            "does match another locator in table with two column attributes and single measure",
            [
                newAttributeColumnLocator(
                    ReferenceMd.StageName.Default,
                    ReferenceData.StageName.Negotiation.uri,
                ),
                newMeasureColumnLocator(ReferenceMd.Amount),
                newAttributeColumnLocator(ReferenceMd.Region, ReferenceData.Region.WestCoast.uri),
            ],
            SingleMeasureWithTwoRowAndTwoColumnAttributes,
            "c_11",
        ],
        [
            "does not match locator if first col attribute does not match in table with two column attributes and single measure",
            [
                newAttributeColumnLocator(ReferenceMd.StageName.Default, "/does/not/exist"),
                newMeasureColumnLocator(ReferenceMd.Amount),
                newAttributeColumnLocator(ReferenceMd.Region, ReferenceData.Region.WestCoast.uri),
            ],
            SingleMeasureWithTwoRowAndTwoColumnAttributes,
            undefined,
        ],
        [
            "does not match locator if second col attribute does not match in table with two column attributes and single measure",
            [
                newAttributeColumnLocator(
                    ReferenceMd.StageName.Default,
                    ReferenceData.StageName.Negotiation.uri,
                ),
                newMeasureColumnLocator(ReferenceMd.Amount),
                newAttributeColumnLocator(ReferenceMd.Region, "/does/not/match"),
            ],
            SingleMeasureWithTwoRowAndTwoColumnAttributes,
            undefined,
        ],
        [
            "does not match locator measure in table with two column attributes and single measure",
            [
                newAttributeColumnLocator(
                    ReferenceMd.StageName.Default,
                    ReferenceData.StageName.Negotiation.uri,
                ),
                newMeasureColumnLocator(ReferenceMd.Probability),
                newAttributeColumnLocator(ReferenceMd.Region, ReferenceData.Region.WestCoast.uri),
            ],
            SingleMeasureWithTwoRowAndTwoColumnAttributes,
            undefined,
        ],
        [
            "does not match when insufficient attribute locators in table with two column attributes and single measure",
            [
                newMeasureColumnLocator(ReferenceMd.Probability),
                newAttributeColumnLocator(ReferenceMd.Region, ReferenceData.Region.WestCoast.uri),
            ],
            SingleMeasureWithTwoRowAndTwoColumnAttributes,
            undefined,
        ],
        [
            "does not match when too many attribute locators in table with two column attributes and single measure",
            [
                newAttributeColumnLocator(ReferenceMd.Product.Name, ReferenceData.ProductName.CompuSci.uri),
                newAttributeColumnLocator(
                    ReferenceMd.StageName.Default,
                    ReferenceData.StageName.Negotiation.uri,
                ),
                newMeasureColumnLocator(ReferenceMd.Probability),
                newAttributeColumnLocator(ReferenceMd.Region, ReferenceData.Region.WestCoast.uri),
            ],
            SingleMeasureWithTwoRowAndTwoColumnAttributes,
            undefined,
        ],
        [
            "does match locator in table with only column attribute",
            [newAttributeColumnLocator(ReferenceMd.Product.Name, ReferenceData.ProductName.Explorer.uri)],
            SingleColumn,
            "cg_2",
        ],
    ];

    it.each(Scenarios)("%s", (_desc, locators, dv, expected) => {
        const tableDescriptor = createHeadersAndColDefs(dv, "empty value");
        const result = searchForLocatorMatch(tableDescriptor.headers.rootDataCols, locators);

        expect(result?.id).toEqual(expected);
    });
});
