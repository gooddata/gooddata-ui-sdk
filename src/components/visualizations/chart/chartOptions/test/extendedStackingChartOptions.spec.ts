// (C) 2007-2019 GoodData Corporation
import { Execution } from "@gooddata/typings";
import { getCategoriesForTwoAttributes } from "../extendedStackingChartOptions";
import {
    getDrillableSeries,
    getSeries,
    IUnwrappedAttributeHeadersWithItems,
} from "../../chartOptionsBuilder";
import { barChartWith4MetricsAndViewBy2Attribute } from "../../../../../../stories/test_data/fixtures";
import { getMVSForViewByTwoAttributes } from "../../test/helper";
import { MeasureColorStrategy } from "../../colorFactory";
import { DEFAULT_COLOR_PALETTE } from "../../../utils/color";
import * as headerPredicateFactory from "../../../../../factory/HeaderPredicateFactory";

describe("getCategoriesForTwoAttributes", () => {
    const attributeHeader: Execution.IAttributeHeader["attributeHeader"] = {
        uri: "uri",
        identifier: "identifier",
        localIdentifier: "localIdentifier",
        name: "name",
        formOf: {
            uri: "uri",
            identifier: "identifier",
            name: "name",
        },
    };

    it("should return categories for two attributes", () => {
        const viewByAttribute: IUnwrappedAttributeHeadersWithItems = {
            ...attributeHeader,
            items: [
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/5/elements?id=1",
                        name: "Won",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/5/elements?id=2",
                        name: "Lost",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/5/elements?id=1",
                        name: "Won",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/5/elements?id=2",
                        name: "Lost",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/5/elements?id=2",
                        name: "Lost",
                    },
                },
            ],
        };
        const viewByParentAttribute: IUnwrappedAttributeHeadersWithItems = {
            ...attributeHeader,
            items: [
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/4/elements?id=1",
                        name: "Direct Sales",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/4/elements?id=1",
                        name: "Direct Sales",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/4/elements?id=2",
                        name: "Inside Sales",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/4/elements?id=2",
                        name: "Inside Sales",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/4/elements?id=3",
                        name: "Common Sales",
                    },
                },
            ],
        };

        const categories = getCategoriesForTwoAttributes(viewByAttribute, viewByParentAttribute);
        expect(categories).toEqual([
            {
                name: "Direct Sales",
                categories: ["Won", "Lost"],
            },
            {
                name: "Inside Sales",
                categories: ["Won", "Lost"],
            },
            {
                name: "Common Sales",
                categories: ["Lost"],
            },
        ]);
    });

    it("should return categories when attribute names have numerical values", () => {
        const viewByAttribute: IUnwrappedAttributeHeadersWithItems = {
            ...attributeHeader,
            items: [
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/5/elements?id=1",
                        name: "Jack",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/5/elements?id=2",
                        name: "David",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/5/elements?id=3",
                        name: "Ben",
                    },
                },
            ],
        };
        const viewByParentAttribute: IUnwrappedAttributeHeadersWithItems = {
            ...attributeHeader,
            items: [
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/4/elements?id=3",
                        name: "3",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/4/elements?id=2",
                        name: "2",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/storybook/obj/4/elements?id=1",
                        name: "1",
                    },
                },
            ],
        };

        const categories = getCategoriesForTwoAttributes(viewByAttribute, viewByParentAttribute);
        expect(categories).toEqual([
            {
                name: "3",
                categories: ["Jack"],
            },
            {
                name: "2",
                categories: ["David"],
            },
            {
                name: "1",
                categories: ["Ben"],
            },
        ]);
    });

    it("should return empty category", () => {
        const viewByAttribute: IUnwrappedAttributeHeadersWithItems = {
            ...attributeHeader,
            items: [],
        };
        const viewByParentAttribute: IUnwrappedAttributeHeadersWithItems = {
            ...attributeHeader,
            items: [],
        };
        const categories = getCategoriesForTwoAttributes(viewByAttribute, viewByParentAttribute);
        expect(categories).toHaveLength(0);
    });
});

describe("getDrillableSeriesWithParentAttribute", () => {
    const dataSet = barChartWith4MetricsAndViewBy2Attribute;
    const { afm } = dataSet.executionRequest;
    const {
        measureGroup,
        viewByAttribute,
        viewByParentAttribute,
        stackByAttribute,
    } = getMVSForViewByTwoAttributes(dataSet);
    const type = "column";
    const metricColorStrategy = new MeasureColorStrategy(
        DEFAULT_COLOR_PALETTE,
        undefined,
        viewByAttribute,
        stackByAttribute,
        dataSet.executionResponse,
        dataSet.executionRequest.afm,
    );
    const seriesWithoutDrillability = getSeries(
        dataSet.executionResult.data,
        measureGroup,
        viewByAttribute,
        stackByAttribute,
        type,
        {} as any,
        metricColorStrategy,
    );
    const drillIntersectionItems = [
        {
            id: "c2fa878519934f39aefe9325638f2beb",
            title: "_Close [BOP]",
            header: { uri: "/gdc/md/jroecoqa7jywstxy1hxp8lwl2c4nc10t/obj/9211", identifier: "aaeb7jTCfexV" },
        },
        {
            id: "1225",
            title: "East Coast",
            header: {
                uri: "/gdc/md/jroecoqa7jywstxy1hxp8lwl2c4nc10t/obj/1024",
                identifier: "label.owner.region",
            },
        },
        {
            id: "1226",
            title: "Direct Sales",
            header: {
                uri: "/gdc/md/jroecoqa7jywstxy1hxp8lwl2c4nc10t/obj/1027",
                identifier: "label.owner.department",
            },
        },
    ];

    it.each([
        ["parent attribute", [dataSet.executionRequest.afm.attributes[0].displayForm.uri]],
        ["child attribute", [dataSet.executionRequest.afm.attributes[1].displayForm.uri]],
        ["measure", [dataSet.executionRequest.afm.measures[0].definition.measure.item.uri]],
        // tslint:disable-next-line:max-line-length
        [
            "parent and child attributes",
            [
                dataSet.executionRequest.afm.attributes[0].displayForm.uri,
                dataSet.executionRequest.afm.attributes[1].displayForm.uri,
            ],
        ],
        // tslint:disable-next-line:max-line-length
        [
            "parent attribute and measure",
            [
                dataSet.executionRequest.afm.attributes[0].displayForm.uri,
                dataSet.executionRequest.afm.measures[0].definition.measure.item.uri,
            ],
        ],
    ])('should return 3 drill items with "%s" configured', (_desc: string, itemUris: string[]) => {
        const drillableItems = itemUris.map((uri: string) => headerPredicateFactory.uriMatch(uri));
        const drillableMeasuresSeriesData = getDrillableSeries(
            seriesWithoutDrillability,
            drillableItems,
            [viewByAttribute, viewByParentAttribute],
            stackByAttribute,
            dataSet.executionResponse,
            afm,
            type,
        );

        expect(drillableMeasuresSeriesData[0].data[0].drillIntersection).toEqual(drillIntersectionItems);
    });
});
