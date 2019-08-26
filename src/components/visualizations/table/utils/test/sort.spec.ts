// (C) 2007-2018 GoodData Corporation
import { AFM, Execution } from "@gooddata/typings";

import { createSortItem, getHeaderSortClassName, getNextSortDir, getSortInfo, getSortItem } from "../sort";
import { ASC, DESC } from "../../../../../constants/sort";
import { TABLE_HEADERS_2A_3M } from "../../fixtures/2attributes3measures";
import { ISortInfo, ISortObj } from "../../../../../interfaces/Table";
import IAttributeSortItem = AFM.IAttributeSortItem;
import "jest";

const ATTRIBUTE_SORT_ITEM: AFM.IAttributeSortItem = {
    attributeSortItem: {
        direction: ASC,
        attributeIdentifier: "2nd_attr_df_local_identifier",
    },
};

const MEASURE_SORT_ITEM: AFM.IMeasureSortItem = {
    measureSortItem: {
        direction: DESC,
        locators: [
            {
                measureLocatorItem: {
                    measureIdentifier: "2nd_measure_local_identifier",
                },
            },
        ],
    },
};

const MEASURE_SORT_ITEM_WITH_TWO_LOCATORS: AFM.IMeasureSortItem = {
    measureSortItem: {
        direction: DESC,
        locators: [
            {
                measureLocatorItem: {
                    measureIdentifier: "1st_measure_local_identifier",
                },
            },
            {
                measureLocatorItem: {
                    measureIdentifier: "2nd_measure_local_identifier",
                },
            },
        ],
    },
};

const SORT_ITEM_WITH_UNKNOWN_IDENTIFIER: IAttributeSortItem = {
    attributeSortItem: {
        direction: ASC,
        attributeIdentifier: "unknown_identifier",
    },
};

function getMeasureHeader(): Execution.IMeasureHeaderItem {
    return {
        measureHeaderItem: {
            uri: "uri",
            identifier: "identifier",
            localIdentifier: "localIdentifier",
            name: "name",
            format: "format",
        },
    };
}

function getAttributeHeader(): Execution.IAttributeHeader {
    return {
        attributeHeader: {
            uri: "uri",
            identifier: "identifier",
            localIdentifier: "localIdentifier",
            name: "name",
            formOf: {
                uri: "uri_id_element",
                identifier: "identifier_element",
                name: "name",
            },
        },
    };
}

describe("Table utils - Sort", () => {
    describe("getHeaderSortClassName", () => {
        it("should create classes with hinted ASC and current sort DESC", () => {
            const classes: string = getHeaderSortClassName(ASC, DESC);
            expect(classes).toContain("gd-table-arrow-up");
            expect(classes).toContain("s-sorted-desc");
        });

        it("should create classes with hinted sort and without current sort", () => {
            const classes: string = getHeaderSortClassName(DESC, null);
            expect(classes).toContain("gd-table-arrow-down");
            expect(classes).not.toContain("s-sorted-desc");
            expect(classes).not.toContain("s-sorted-asc");
        });
    });

    describe("getNextSortDir", () => {
        it("should get nextSortDir when currentSortDir is not specified", () => {
            expect(getNextSortDir(getAttributeHeader(), null)).toEqual(ASC);
            expect(getNextSortDir(getMeasureHeader(), null)).toEqual(DESC);
        });

        it("should get nextSortDir when currentSortDir is specified", () => {
            expect(getNextSortDir(getAttributeHeader(), ASC)).toEqual(DESC);
            expect(getNextSortDir(getMeasureHeader(), ASC)).toEqual(DESC);
            expect(getNextSortDir(getAttributeHeader(), DESC)).toEqual(ASC);
            expect(getNextSortDir(getMeasureHeader(), DESC)).toEqual(ASC);
        });
    });

    describe("getSortItem", () => {
        it("should return null if there are no sorts", () => {
            const executionRequest: AFM.IExecution = { execution: { afm: {} } };
            expect(getSortItem(executionRequest)).toEqual(null);
        });

        it("should throw error if there is more than one sort", () => {
            const executionRequest: AFM.IExecution = {
                execution: {
                    afm: {},
                    resultSpec: {
                        sorts: [ATTRIBUTE_SORT_ITEM, MEASURE_SORT_ITEM],
                    },
                },
            };
            expect(() => {
                getSortItem(executionRequest);
            }).toThrow("Table allows only one sort");
        });

        it("should return sort item", () => {
            const executionRequest: AFM.IExecution = {
                execution: {
                    afm: {},
                    resultSpec: {
                        sorts: [ATTRIBUTE_SORT_ITEM],
                    },
                },
            };
            expect(getSortItem(executionRequest)).toEqual(ATTRIBUTE_SORT_ITEM);
        });
    });

    describe("getSortInfo", () => {
        it("should get sortInfo for attribute", () => {
            const sortInfo: ISortInfo = getSortInfo(ATTRIBUTE_SORT_ITEM, TABLE_HEADERS_2A_3M);
            expect(sortInfo.sortBy).toEqual(1);
            expect(sortInfo.sortDir).toEqual(ASC);
        });

        it("should get sortInfo for measure", () => {
            const sortInfo: ISortInfo = getSortInfo(MEASURE_SORT_ITEM, TABLE_HEADERS_2A_3M);
            expect(sortInfo.sortBy).toEqual(3);
            expect(sortInfo.sortDir).toEqual(DESC);
        });

        it("should throw error for measure sort item which contains more than one locator", () => {
            expect(() => {
                getSortInfo(MEASURE_SORT_ITEM_WITH_TWO_LOCATORS, TABLE_HEADERS_2A_3M);
            }).toThrow("Measure sort item couldn't contain more than one locator");
        });

        it("should throw error for sort identifier which ism't included in table headers", () => {
            expect(() => {
                getSortInfo(SORT_ITEM_WITH_UNKNOWN_IDENTIFIER, TABLE_HEADERS_2A_3M);
            }).toThrow("Cannot find sort identifier unknown_identifier in table headers");
        });
    });

    describe("createSortItem", () => {
        it("should create attribute sort item", () => {
            const sortObj: ISortObj = { dir: null, nextDir: "asc", sortDirClass: "" };
            expect(createSortItem(TABLE_HEADERS_2A_3M[1], sortObj)).toEqual(ATTRIBUTE_SORT_ITEM);
        });

        it("should create measure sort item", () => {
            const sortObj: ISortObj = { dir: null, nextDir: "desc", sortDirClass: "" };
            expect(createSortItem(TABLE_HEADERS_2A_3M[3], sortObj)).toEqual(MEASURE_SORT_ITEM);
        });
    });
});
