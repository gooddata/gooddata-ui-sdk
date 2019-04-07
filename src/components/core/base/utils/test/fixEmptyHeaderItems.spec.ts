// (C) 2007-2018 GoodData Corporation
import { Execution } from "@gooddata/typings";
import { fixEmptyHeaderItems } from "../fixEmptyHeaderItems";

function getExecutionResult(): Execution.IExecutionResult {
    return {
        data: null,
        paging: {
            count: [2, 7],
            offset: [0, 0],
            total: [2, 7],
        },
        headerItems: [
            [
                [
                    {
                        attributeHeaderItem: {
                            name: "2014",
                            uri: "/gdc/md/oqxssdt6v69m9n7hn0dl5qfegxh57m43/obj/324/elements?id=2014",
                        },
                    },
                    {
                        attributeHeaderItem: {
                            name: "2016",
                            uri: "/gdc/md/oqxssdt6v69m9n7hn0dl5qfegxh57m43/obj/324/elements?id=2016",
                        },
                    },
                    {
                        attributeHeaderItem: {
                            name: "2017",
                            uri: "/gdc/md/oqxssdt6v69m9n7hn0dl5qfegxh57m43/obj/324/elements?id=2017",
                        },
                    },
                ],
            ],
            [
                [
                    {
                        attributeHeaderItem: {
                            name: "East Coast",
                            uri: "/gdc/md/oqxssdt6v69m9n7hn0dl5qfegxh57m43/obj/1024/elements?id=1225",
                        },
                    },
                    {
                        attributeHeaderItem: {
                            name: "",
                            uri: "/gdc/md/oqxssdt6v69m9n7hn0dl5qfegxh57m43/obj/1024/elements?id=1237",
                        },
                    },
                ],
                [
                    {
                        measureHeaderItem: {
                            name: "m1",
                            order: 0,
                        },
                    },
                    {
                        measureHeaderItem: {
                            name: "",
                            order: 0,
                        },
                    },
                ],
                [
                    {
                        totalHeaderItem: {
                            name: "",
                            type: "unknown",
                        },
                    },
                ],
            ],
        ],
    };
}

const EMPTY_HEADER_STRING = "empty-value-translation";

describe("fixEmptyHeaderItems", () => {
    it("should handle missing headerItems", () => {
        const missingHeaders = getExecutionResult();
        delete missingHeaders.headerItems;
        expect(fixEmptyHeaderItems(missingHeaders, EMPTY_HEADER_STRING)).toEqual(missingHeaders);
    });

    it("should replace empty values in all types of headerItems", () => {
        const fixed = fixEmptyHeaderItems(getExecutionResult(), EMPTY_HEADER_STRING) as any;

        expect(fixed.headerItems[1][0][1].attributeHeaderItem.name).toEqual(EMPTY_HEADER_STRING);
        expect(fixed.headerItems[1][1][1].measureHeaderItem.name).toEqual(EMPTY_HEADER_STRING);
        expect(fixed.headerItems[1][2][0].totalHeaderItem.name).toEqual(EMPTY_HEADER_STRING);
    });
});
