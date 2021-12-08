// (C) 2020-2021 GoodData Corporation

import {
    IAttributeColumnLocator,
    newAttributeColumnLocator,
    newWidthForAllColumnsForMeasure,
    newWidthForAllMeasureColumns,
    newWidthForAttributeColumn,
    newWidthForSelectedColumns,
} from "../columnWidths";
import { IAttribute, IMeasure } from "@gooddata/sdk-model";
import { ReferenceMd } from "@gooddata/reference-workspace";

describe("newWidthForAllMeasureColumns", () => {
    it("should create width item without grow to fit prop if not specified on factory call", () => {
        expect(newWidthForAllMeasureColumns(1)).toMatchSnapshot();
    });
});

describe("newWidthForAllColumnsForMeasure", () => {
    const Scenarios: Array<[string, IMeasure | string, number, boolean | undefined]> = [
        ["when measure as value and without grow to fit prop", ReferenceMd.Amount, 10, undefined],
        ["when measure as localId and without grow to fit prop", "localId", 10, undefined],
        ["with grow to fit prop false", ReferenceMd.Amount, 10, false],
        ["with grow to fit prop true", ReferenceMd.Amount, 10, true],
    ];

    it.each(Scenarios)("should create width item %s", (_desc, measureOrId, width, grow) => {
        expect(newWidthForAllColumnsForMeasure(measureOrId, width, grow)).toMatchSnapshot();
    });
});

describe("newWidthForAttributeColumn", () => {
    const Scenarios: Array<[string, IAttribute | string, number, boolean | undefined]> = [
        ["when attribute as value and without grow to fit prop", ReferenceMd.Product.Name, 10, undefined],
        ["when attribute as localId and without grow to fit prop", "localId", 10, undefined],
        ["with grow to fit prop false", ReferenceMd.Product.Name, 10, false],
        ["with grow to fit prop true", ReferenceMd.Product.Name, 10, true],
    ];

    it.each(Scenarios)("should create width item %s", (_desc, attributeOrId, width, grow) => {
        expect(newWidthForAttributeColumn(attributeOrId, width, grow)).toMatchSnapshot();
    });
});

describe("newWidthForSelectedColumns", () => {
    const Scenarios: Array<
        [string, IMeasure | string, IAttributeColumnLocator[], number, boolean | undefined]
    > = [
        ["when measure as value and without grow to fit prop", ReferenceMd.Amount, [], 10, undefined],
        ["when measure as localId and without grow to fit prop", "localId", [], 10, undefined],
        ["with grow to fit prop false", ReferenceMd.Amount, [], 10, false],
        ["with grow to fit prop true", ReferenceMd.Amount, [], 10, true],
        [
            "with attr locators in front of measure locator",
            ReferenceMd.Amount,
            [newAttributeColumnLocator(ReferenceMd.Product.Name, "uri")],
            10,
            undefined,
        ],
    ];

    it.each(Scenarios)("should create width item %s", (_desc, measureOrId, locators, width, grow) => {
        expect(newWidthForSelectedColumns(measureOrId, locators, width, grow)).toMatchSnapshot();
    });
});
