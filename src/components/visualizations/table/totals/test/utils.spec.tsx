// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import "jest";
import { mount } from "enzyme";
import { AFM, Execution } from "@gooddata/typings";

import {
    getTotalsDataSource,
    createTotalItem,
    toggleCellClass,
    resetRowClass,
    removeTotalsRow,
    isTotalUsed,
    addTotalsRow,
    updateTotalsRemovePosition,
    getAddTotalDropdownAlignPoints,
    shouldShowAddTotalButton,
    getFirstMeasureIndex,
    hasTableColumnTotalEnabled,
    addMeasureIndex,
    removeMeasureIndex,
    getTotalsDefinition,
    orderTotals,
    shouldShowTotals,
    isNativeTotal,
    getNativeTotals,
    getTotalsFromResultSpec,
    getAttributeDimension,
} from "../utils";
import { createIntlMock } from "../../../utils/intlUtils";
import { ITotalWithData } from "../../../../../interfaces/Totals";
import { IMappingHeader } from "../../../../../interfaces/MappingHeader";

const intl = createIntlMock();

const DEFAULT_MEASURE_FORMAT = "JP rikal, ze metrika ma vzdycky format";

type HeaderType = "measure" | "attribute";

function createTableHeader(type: HeaderType, identifier: string): IMappingHeader {
    const generateUri = () => `/gdc/md/projectId/${identifier}`;
    if (type === "attribute") {
        const attributeHeader: Execution.IAttributeHeader = {
            attributeHeader: {
                identifier,
                localIdentifier: identifier,
                name: identifier,
                uri: generateUri(),
                formOf: {
                    uri: generateUri(),
                    identifier: identifier + "-element",
                    name: identifier,
                },
            },
        };
        return attributeHeader;
    }

    const measureHeader: Execution.IMeasureHeaderItem = {
        measureHeaderItem: {
            format: DEFAULT_MEASURE_FORMAT,
            identifier,
            localIdentifier: identifier,
            name: identifier,
            uri: generateUri(),
        },
    };
    return measureHeader;
}

describe("Totals", () => {
    describe("createTotalItem", () => {
        it("should create total with default values", () => {
            const total = createTotalItem("sum");

            expect(total).toEqual({
                type: "sum",
                outputMeasureIndexes: [],
                values: [],
            });
        });

        it("should create total with provided values", () => {
            const total = createTotalItem("sum", [1, 2], [3, 4]);

            expect(total).toEqual({
                type: "sum",
                outputMeasureIndexes: [1, 2],
                values: [3, 4],
            });
        });
    });

    describe("getTotalsDataSource", () => {
        const usedTotals: ITotalWithData[] = [createTotalItem("sum"), createTotalItem("max")];
        const dataSource = getTotalsDataSource(usedTotals, intl);

        it("should return rows count of 7 (header + 6 totals)", () => {
            expect(dataSource.rowsCount).toEqual(7);
        });

        describe("getObjectAt", () => {
            it('should return disabled "max" on index 2 when it is already used', () => {
                expect(dataSource.getObjectAt(2)).toEqual({
                    disabled: true,
                    title: "Max",
                    type: "max",
                });
            });

            it('should return enabled "Rollup" on index 5 when it is not used already', () => {
                expect(dataSource.getObjectAt(5)).toEqual({
                    disabled: false,
                    title: "Median",
                    type: "med",
                });
            });
        });
    });

    describe("orderTotals", () => {
        it("should order totals by order provided by getTotalsTypesList", () => {
            const nat = createTotalItem("nat");
            const max = createTotalItem("max");
            const sum = createTotalItem("sum");
            const totalsList = [nat, max, sum];

            expect(orderTotals(totalsList)).toEqual([sum, max, nat]);
        });
    });

    describe("toggleCellClass", () => {
        const testClassname = "toggle";

        class CellTestComponent extends React.Component {
            public parentRef: HTMLElement;
            public render() {
                return (
                    <div
                        ref={ref => {
                            this.parentRef = ref;
                        }}
                    >
                        <span className="col-1" />
                        <span className={`col-2 ${testClassname}`} />
                        <span className="col-2" />
                    </div>
                );
            }
        }

        function createCellReference() {
            const cell = mount(<CellTestComponent />);
            return (cell.instance() as CellTestComponent).parentRef;
        }

        it("should remove given classname to all cells having a particular classname", () => {
            const cellReference = createCellReference();
            toggleCellClass(cellReference, 2, false, testClassname);

            expect(cellReference.querySelectorAll(`.${testClassname}`).length).toEqual(0);
        });

        it("should add given classname to all cells having a particular classname", () => {
            const cellReference = createCellReference();
            toggleCellClass(cellReference, 2, true, testClassname);

            expect(cellReference.querySelectorAll(`.${testClassname}`).length).toEqual(2);
        });
    });

    describe("resetRowClass", () => {
        const testClassname = "toggle";
        function getRemoveRowClassList(rowRef: HTMLElement, idx: number) {
            return rowRef.querySelectorAll(".indigo-totals-remove-row")[idx].classList;
        }

        class RowTestComponent extends React.Component {
            public parentRef: HTMLElement;
            public render() {
                return (
                    <div
                        ref={ref => {
                            this.parentRef = ref;
                        }}
                    >
                        <div className="indigo-totals-remove">
                            <div className={`indigo-totals-remove-row ${testClassname}`} />
                            <div className="indigo-totals-remove-row" />
                            <div className="indigo-totals-remove-row" />
                        </div>
                    </div>
                );
            }
        }

        function createRowReference() {
            const row = mount(<RowTestComponent />);
            return (row.instance() as RowTestComponent).parentRef;
        }

        it("should remove given classname from all rows and set it to one row on a given column index", () => {
            const rowReference = createRowReference();
            const oldIndex = 0;
            const newIndex = 2;

            resetRowClass(
                rowReference,
                testClassname,
                ".indigo-totals-remove > .indigo-totals-remove-row",
                newIndex,
            );

            expect(rowReference.querySelectorAll(`.${testClassname}`).length).toEqual(1);
            expect(getRemoveRowClassList(rowReference, oldIndex).contains(testClassname)).toEqual(false);
            expect(getRemoveRowClassList(rowReference, newIndex).contains(testClassname)).toEqual(true);
        });

        it("should keep given classname if row on the given column index already has one", () => {
            const rowReference = createRowReference();
            const columnIndex = 0;

            expect(getRemoveRowClassList(rowReference, columnIndex).contains(testClassname)).toEqual(true);

            resetRowClass(
                rowReference,
                testClassname,
                ".indigo-totals-remove > .indigo-totals-remove-row",
                columnIndex,
            );

            expect(getRemoveRowClassList(rowReference, columnIndex).contains(testClassname)).toEqual(true);
        });
    });

    describe("removeTotalsRow", () => {
        const sum = createTotalItem("sum");
        const avg = createTotalItem("avg");
        const usedTotals: ITotalWithData[] = [sum, avg];

        it("should return totals without selected total", () => {
            const totalToRemove = "avg";
            expect(removeTotalsRow(usedTotals, totalToRemove)).toEqual([sum]);
        });

        it("should return unchanged totals if total to remove is not among selected ones", () => {
            const totalToRemove = "min";
            expect(removeTotalsRow(usedTotals, totalToRemove)).toEqual(usedTotals);
        });
    });

    describe("isTotalUsed", () => {
        const usedTotals: ITotalWithData[] = [createTotalItem("sum"), createTotalItem("avg")];

        it("should return true when given total is already present among selected ones", () => {
            const total = "avg";
            expect(isTotalUsed(usedTotals, total)).toEqual(true);
        });

        it("should return false when given total is not present among selected ones", () => {
            const total = "min";
            expect(isTotalUsed(usedTotals, total)).toEqual(false);
        });
    });

    describe("addTotalsRow", () => {
        it("should add total among used ones", () => {
            const usedTotals: ITotalWithData[] = [createTotalItem("sum")];
            const totalToAdd = "avg";
            const expectedTotals = [...usedTotals, createTotalItem("avg")];
            expect(addTotalsRow(usedTotals, totalToAdd)).toEqual(expectedTotals);
        });

        it("should not add total if is already present among used ones", () => {
            const usedTotals: ITotalWithData[] = [createTotalItem("sum"), createTotalItem("avg")];
            const totalToAdd = "avg";
            expect(addTotalsRow(usedTotals, totalToAdd)).toEqual(usedTotals);
        });
    });

    describe("updateTotalsRemovePosition", () => {
        class TestComponent extends React.Component {
            public parentRef: HTMLDivElement;
            public render() {
                return (
                    <div
                        ref={ref => {
                            this.parentRef = ref;
                        }}
                    />
                );
            }
        }

        const tableBoundingRect: ClientRect = {
            height: 100,
            bottom: 0,
            left: 0,
            right: 0,
            top: 0,
            width: 0,
        };
        const totals = [
            createTotalItem("sum"),
            createTotalItem("avg"),
            createTotalItem("min"),
            createTotalItem("max"),
        ];

        function createTestRef() {
            const component = mount(<TestComponent />);
            return (component.instance() as TestComponent).parentRef;
        }

        it("should set proper style 'top' property to referenced node", () => {
            const ref = createTestRef();
            const isTotalsEditAllowed = true;
            const totalsVisible = true;

            updateTotalsRemovePosition(tableBoundingRect, totals, isTotalsEditAllowed, totalsVisible, ref);

            expect(ref.style.top).toEqual("-70px");
        });

        it("should not set any style 'top' property to referenced node if edit is not allowed", () => {
            const ref = createTestRef();
            const isTotalsEditAllowed = false;
            const totalsVisible = false;

            updateTotalsRemovePosition(tableBoundingRect, totals, isTotalsEditAllowed, totalsVisible, ref);

            expect(ref.style.top).toEqual("");
        });
    });

    describe("getAddTotalDropdownAlignPoints", () => {
        it("should return proper align points for dropdown", () => {
            const expectedAlignPoints = [
                { align: "tc bc", offset: { x: 0, y: -3 } },
                { align: "bc tc", offset: { x: 0, y: 50 } },
            ];
            expect(getAddTotalDropdownAlignPoints()).toEqual(expectedAlignPoints);
        });

        it("should return proper align points for dropdown in last column", () => {
            const isLastColumn = true;
            const expectedAlignPoints = [
                { align: "tc br", offset: { x: 30, y: -3 } },
                { align: "bc tr", offset: { x: 30, y: 50 } },
            ];
            expect(getAddTotalDropdownAlignPoints(isLastColumn)).toEqual(expectedAlignPoints);
        });
    });

    describe("shouldShowAddTotalButton", () => {
        // tslint:disable-next-line:max-line-length
        it("should return true if column is not first, is of 'measure' type and adding of more totals is enabled", () => {
            const measureHeader = createTableHeader("measure", "m1");
            const isFirstColumn = false;
            const addingMoreTotalsEnabled = true;
            expect(shouldShowAddTotalButton(measureHeader, isFirstColumn, addingMoreTotalsEnabled)).toEqual(
                true,
            );
        });

        // tslint:disable-next-line:max-line-length
        it("should return false if column is first, is not of 'measure' type or adding of more totals is not enabled", () => {
            const measureHeader = createTableHeader("measure", "m1");
            const otherTypeColumn = createTableHeader("attribute", "a1");
            const isFirstColumn = true;
            const addingMoreTotalsEnabled = true;
            expect(shouldShowAddTotalButton(measureHeader, isFirstColumn, addingMoreTotalsEnabled)).toEqual(
                false,
            );
            expect(shouldShowAddTotalButton(measureHeader, !isFirstColumn, !addingMoreTotalsEnabled)).toEqual(
                false,
            );
            expect(shouldShowAddTotalButton(otherTypeColumn, isFirstColumn, addingMoreTotalsEnabled)).toEqual(
                false,
            );
        });
    });

    describe("getFirstMeasureIndex", () => {
        it("should return index of first measure when measure present in headers", () => {
            const headers: IMappingHeader[] = [
                createTableHeader("attribute", "a1"),
                createTableHeader("attribute", "a2"),
                createTableHeader("measure", "m1"),
                createTableHeader("measure", "m2"),
            ];
            expect(getFirstMeasureIndex(headers)).toBe(2);
        });

        it("should return index of first measure even when headers are wrongly mixed", () => {
            const headers: IMappingHeader[] = [
                createTableHeader("attribute", "a1"),
                createTableHeader("measure", "m1"),
                createTableHeader("attribute", "a2"),
                createTableHeader("measure", "m2"),
            ];
            expect(getFirstMeasureIndex(headers)).toBe(1);
        });

        it("should return 0 when measure is first header", () => {
            const headers: IMappingHeader[] = [createTableHeader("measure", "m1")];
            expect(getFirstMeasureIndex(headers)).toBe(0);
        });

        it("should return 0 when no measure present in headers", () => {
            const headers: IMappingHeader[] = [createTableHeader("attribute", "a1")];
            expect(getFirstMeasureIndex(headers)).toBe(0);
        });
    });

    describe("hasTableColumnTotalEnabled", () => {
        const outputMeasureIndexes = [3];
        const tableColumnIndex = 4;
        const measureIndexOffset = 1;

        it("should return true on enabled column", () => {
            expect(
                hasTableColumnTotalEnabled(outputMeasureIndexes, tableColumnIndex, measureIndexOffset),
            ).toBeTruthy();
        });

        it("should return false on disabled column", () => {
            expect(hasTableColumnTotalEnabled(outputMeasureIndexes, 3, measureIndexOffset)).toBeFalsy();
        });
    });

    describe("addMeasureIndex", () => {
        const totals: ITotalWithData[] = [createTotalItem("sum"), createTotalItem("max", [1])];
        const headers: IMappingHeader[] = [
            createTableHeader("attribute", "a1"),
            createTableHeader("measure", "m1"),
            createTableHeader("measure", "m2"),
        ];
        const totalType: AFM.TotalType = "sum";
        const tableColumnIndex = 1;

        it("should add measure index in particular total", () => {
            expect(addMeasureIndex(totals, headers, totalType, tableColumnIndex)).toEqual([
                { type: "sum", outputMeasureIndexes: [0], values: [] },
                { type: "max", outputMeasureIndexes: [1], values: [] },
            ]);
        });

        it("should not duplicate measure indexes when adding same index again", () => {
            expect(addMeasureIndex(totals, headers, "max", 2)).toEqual([
                { type: "sum", outputMeasureIndexes: [], values: [] },
                { type: "max", outputMeasureIndexes: [1], values: [] },
            ]);
        });

        it("should do nothing when total not found", () => {
            expect(addMeasureIndex(totals, headers, "nat", tableColumnIndex)).toEqual([
                { type: "sum", outputMeasureIndexes: [], values: [] },
                { type: "max", outputMeasureIndexes: [1], values: [] },
            ]);
        });
    });

    describe("removeMeasureIndex", () => {
        const totals: ITotalWithData[] = [createTotalItem("sum"), createTotalItem("max", [1])];
        const headers: IMappingHeader[] = [
            createTableHeader("attribute", "a1"),
            createTableHeader("measure", "m1"),
            createTableHeader("measure", "m2"),
        ];
        const totalType: AFM.TotalType = "max";
        const tableColumnIndex = 2;

        it("should remove measure index in particular total", () => {
            expect(removeMeasureIndex(totals, headers, totalType, tableColumnIndex)).toEqual([
                { type: "sum", outputMeasureIndexes: [], values: [] },
                { type: "max", outputMeasureIndexes: [], values: [] },
            ]);
        });

        it("should do nothing when total not found", () => {
            expect(removeMeasureIndex(totals, headers, "nat", tableColumnIndex)).toEqual([
                { type: "sum", outputMeasureIndexes: [], values: [] },
                { type: "max", outputMeasureIndexes: [1], values: [] },
            ]);
        });
    });

    describe("getTotalsDefinition", () => {
        const totals: ITotalWithData[] = [createTotalItem("sum", [], [1]), createTotalItem("avg", [], [2])];

        it("should remove values from totals and return ordered", () => {
            expect(getTotalsDefinition(totals)).toEqual([
                { type: "sum", outputMeasureIndexes: [] },
                { type: "avg", outputMeasureIndexes: [] },
            ]);
        });
    });

    describe("shouldShowTotals", () => {
        it("should return false when no header", () => {
            const headers: IMappingHeader[] = [];

            expect(shouldShowTotals(headers)).toBeFalsy();
        });

        it("should return true when mixed attributes and measures", () => {
            const headers: IMappingHeader[] = [
                {
                    attributeHeader: {
                        localIdentifier: "a1",
                        name: "A1",
                        uri: "/gdc/md/foo",
                        identifier: "a1",
                        formOf: {
                            uri: "/gdc/md/foo_element",
                            identifier: "a1_element",
                            name: "ProdA1uct",
                        },
                    },
                },
                {
                    measureHeaderItem: {
                        localIdentifier: "m1",
                        name: "M1",
                        format: "",
                    },
                },
            ];

            expect(shouldShowTotals(headers)).toBeTruthy();
        });

        it("should return false when attributes used", () => {
            const headers: IMappingHeader[] = [
                createTableHeader("attribute", "a1"),
                createTableHeader("attribute", "a2"),
            ];

            expect(shouldShowTotals(headers)).toBeFalsy();
        });

        it("should return false when measures used", () => {
            const headers: IMappingHeader[] = [
                createTableHeader("measure", "m1"),
                createTableHeader("measure", "m2"),
            ];

            expect(shouldShowTotals(headers)).toBeFalsy();
        });
    });

    describe("isNativeTotal", () => {
        it('should return true if total is of type "native"', () => {
            expect(
                isNativeTotal({
                    attributeIdentifier: "a1",
                    measureIdentifier: "m1",
                    type: "nat",
                }),
            ).toBe(true);
        });
        it('should return false if total is NOT of type "native"', () => {
            expect(
                isNativeTotal({
                    attributeIdentifier: "a1",
                    measureIdentifier: "m1",
                    type: "sum",
                }),
            ).toBe(false);
        });
    });

    describe("getNativeTotals", () => {
        const resultSpec = { dimensions: [{ itemIdentifiers: ["a1", "a2", "a3"] }] };
        it("should filter out all but native totals and adapt them to afm.nativeTotal format", () => {
            expect(
                getNativeTotals(
                    [
                        {
                            attributeIdentifier: "a1",
                            measureIdentifier: "m1",
                            type: "sum",
                        },
                        {
                            attributeIdentifier: "a1",
                            measureIdentifier: "m1",
                            type: "nat",
                        },
                    ],
                    resultSpec,
                ),
            ).toEqual([
                {
                    attributeIdentifiers: [],
                    measureIdentifier: "m1",
                },
            ]);
        });
        it("should return correct native subtotals", () => {
            expect(
                getNativeTotals(
                    [
                        {
                            attributeIdentifier: "a2",
                            measureIdentifier: "m1",
                            type: "nat",
                        },
                        {
                            attributeIdentifier: "a3",
                            measureIdentifier: "m1",
                            type: "nat",
                        },
                    ],
                    resultSpec,
                ),
            ).toEqual([
                {
                    attributeIdentifiers: ["a1"],
                    measureIdentifier: "m1",
                },
                {
                    attributeIdentifiers: ["a1", "a2"],
                    measureIdentifier: "m1",
                },
            ]);
        });
        it("should return an empty array if no totals are specified", () => {
            expect(getNativeTotals(undefined, resultSpec)).toEqual([]);
        });
    });

    describe("getTotalsFromResultSpec", () => {
        it("should collect totals from resultSpec dimensions and return them", () => {
            expect(
                getTotalsFromResultSpec({
                    dimensions: [
                        {
                            itemIdentifiers: [],
                            totals: [
                                {
                                    attributeIdentifier: "a1",
                                    measureIdentifier: "m1",
                                    type: "sum",
                                },
                            ],
                        },
                        {
                            itemIdentifiers: [],
                            totals: [
                                {
                                    attributeIdentifier: "a2",
                                    measureIdentifier: "m2",
                                    type: "nat",
                                },
                            ],
                        },
                    ],
                }),
            ).toEqual([
                {
                    attributeIdentifier: "a1",
                    measureIdentifier: "m1",
                    type: "sum",
                },
                {
                    attributeIdentifier: "a2",
                    measureIdentifier: "m2",
                    type: "nat",
                },
            ]);
        });
        it("should return an empty array if no totals are specified", () => {
            expect(getTotalsFromResultSpec(undefined)).toEqual([]);
        });
    });
    describe("getAttributeDimension", () => {
        const resultSpec: AFM.IResultSpec = {
            dimensions: [{ itemIdentifiers: [] }, { itemIdentifiers: ["a1", "a2"] }],
        };
        it("should return correct dimension for attribute", () => {
            expect(getAttributeDimension("a1", resultSpec)).toEqual(resultSpec.dimensions[1]);
        });
    });
});
