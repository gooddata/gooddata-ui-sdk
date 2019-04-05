// (C) 2007-2018 GoodData Corporation
import { Execution } from "@gooddata/typings";
import { IUnwrappedAttributeHeadersWithItems } from "../../chartOptionsBuilder";
import { getDrillableSeriesWithParentAttribute } from "../extendedStackingChartOptions";

describe("getDrillableSeriesWithParentAttribute", () => {
    const getParentAttribute = (
        items: Execution.IResultAttributeHeaderItem[] = [],
    ): IUnwrappedAttributeHeadersWithItems => ({
        name: "Region",
        localIdentifier: "regionIdentifier",
        uri: "/gdc/md/test/obj/20",
        identifier: "label.region",
        formOf: {
            uri: "anyUri",
            identifier: "anyIdentifier",
            name: "anyName",
        },
        items,
    });

    const getSeries = (isDrillable: boolean, data: any[] = []) => ({
        name: "Amount",
        yAxis: 0,
        visible: true,
        isDrillable,
        data,
    });

    it("should return same series without drilldown", () => {
        const parentAttribute = getParentAttribute();
        const series = getSeries(false);
        const result = getDrillableSeriesWithParentAttribute([series], parentAttribute);
        expect(result).toEqual([series]);
    });

    it("should return same series with drilldown and empty data", () => {
        const parentAttribute = getParentAttribute();
        const series = getSeries(true);
        const result = getDrillableSeriesWithParentAttribute([series], parentAttribute);
        expect(result).toEqual([series]);
    });

    it("should add parent attribute to drill message for two registered elements", () => {
        const series = getSeries(true, [
            {
                y: 123,
                name: "Amount",
                drilldown: true, // register drilldown
                drillIntersection: [
                    {
                        id: "m1",
                        title: "Amount",
                        header: {},
                    },
                    {
                        id: "a1",
                        title: "Inside Sales",
                        header: {},
                    },
                ],
            },
            {
                y: 456,
                name: "Amount",
                drilldown: true, // register drilldown
                drillIntersection: [
                    {
                        id: "m1",
                        title: "Amount",
                        header: {},
                    },
                    {
                        id: "a2",
                        title: "Direct Sales",
                        header: {},
                    },
                ],
            },
        ]);
        const parentAttribute = getParentAttribute(
            Array(2).fill({
                attributeHeaderItem: {
                    name: "East Coast",
                    uri: "/gdc/md/test/obj/21/elements?id=1",
                },
            }),
        );
        const result = getDrillableSeriesWithParentAttribute([series], parentAttribute)[0];

        expect(result.data).toEqual([
            {
                y: 123,
                name: "Amount",
                drilldown: true,
                drillIntersection: [
                    {
                        id: "m1",
                        title: "Amount",
                        header: {},
                    },
                    {
                        id: "a1",
                        title: "Inside Sales",
                        header: {},
                    },
                    {
                        id: "1",
                        title: "East Coast",
                        header: {
                            identifier: "label.region",
                            uri: "/gdc/md/test/obj/20",
                        },
                    },
                ],
            },
            {
                y: 456,
                name: "Amount",
                drilldown: true,
                drillIntersection: [
                    {
                        id: "m1",
                        title: "Amount",
                        header: {},
                    },
                    {
                        id: "a2",
                        title: "Direct Sales",
                        header: {},
                    },
                    {
                        id: "1",
                        title: "East Coast",
                        header: {
                            identifier: "label.region",
                            uri: "/gdc/md/test/obj/20",
                        },
                    },
                ],
            },
        ]);
    });

    it("should add parent attribute to drill message for one registered elements", () => {
        const series = getSeries(true, [
            {
                y: 123,
                name: "Amount",
                drilldown: true, // register drilldown
                drillIntersection: [
                    {
                        id: "m1",
                        title: "Amount",
                        header: {},
                    },
                    {
                        id: "a1",
                        title: "Inside Sales",
                        header: {},
                    },
                ],
            },
            {
                y: 456,
                name: "Amount",
                drilldown: false, // not register drilldown
            },
        ]);
        const parentAttribute = getParentAttribute(
            Array(2).fill({
                attributeHeaderItem: {
                    name: "East Coast",
                    uri: "/gdc/md/test/obj/21/elements?id=1",
                },
            }),
        );
        const result = getDrillableSeriesWithParentAttribute([series], parentAttribute)[0];

        expect(result.data).toEqual([
            {
                y: 123,
                name: "Amount",
                drilldown: true,
                drillIntersection: [
                    {
                        id: "m1",
                        title: "Amount",
                        header: {},
                    },
                    {
                        id: "a1",
                        title: "Inside Sales",
                        header: {},
                    },
                    {
                        id: "1",
                        title: "East Coast",
                        header: {
                            identifier: "label.region",
                            uri: "/gdc/md/test/obj/20",
                        },
                    },
                ],
            },
            {
                y: 456,
                name: "Amount",
                drilldown: false,
            },
        ]);
    });
});
