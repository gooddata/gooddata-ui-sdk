// (C) 2007-2019 GoodData Corporation
import { IUnwrappedAttributeHeadersWithItems } from "../../../utils/types";
import { getCategoriesForTwoAttributes } from "../extendedStackingChartOptions";
import { barChartWith4MetricsAndViewByTwoAttributes } from "../../../../../__mocks__/fixtures";
import { MeasureColorStrategy } from "../../colorFactory";
import { getMVSForViewByTwoAttributes } from "../../test/helper";
import { getDrillableSeries, getSeries } from "../../chartOptionsBuilder";
import { attributeUri, measureUri } from "@gooddata/sdk-model";
import { HeaderPredicates } from "@gooddata/sdk-ui";
import { DefaultColorPalette } from "../../../Config";
import { IAttributeDescriptor } from "@gooddata/sdk-backend-spi";

describe("getCategoriesForTwoAttributes", () => {
    const attributeDescriptor: IAttributeDescriptor["attributeHeader"] = {
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
            ...attributeDescriptor,
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
            ...attributeDescriptor,
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
            ...attributeDescriptor,
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
            ...attributeDescriptor,
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
            ...attributeDescriptor,
            items: [],
        };
        const viewByParentAttribute: IUnwrappedAttributeHeadersWithItems = {
            ...attributeDescriptor,
            items: [],
        };
        const categories = getCategoriesForTwoAttributes(viewByAttribute, viewByParentAttribute);
        expect(categories).toHaveLength(0);
    });
});

describe("getDrillableSeriesWithParentAttribute", () => {
    const dv = barChartWith4MetricsAndViewByTwoAttributes;
    const {
        measureGroup,
        viewByAttribute,
        viewByParentAttribute,
        stackByAttribute,
    } = getMVSForViewByTwoAttributes(dv);
    const type = "column";
    const metricColorStrategy = new MeasureColorStrategy(
        DefaultColorPalette,
        undefined,
        viewByAttribute,
        stackByAttribute,
        dv,
    );
    const seriesWithoutDrillability = getSeries(
        dv,
        measureGroup,
        viewByAttribute,
        stackByAttribute,
        type,
        metricColorStrategy,
    );
    const drillIntersectionItems = [
        {
            header: {
                measureHeaderItem: {
                    format: "#,##0.00",
                    identifier: "aaeb7jTCfexV",
                    localIdentifier: "c2fa878519934f39aefe9325638f2beb",
                    name: "_Close [BOP]",
                    uri: "/gdc/md/jroecoqa7jywstxy1hxp8lwl2c4nc10t/obj/9211",
                },
            },
        },
        {
            header: {
                attributeHeader: {
                    formOf: {
                        identifier: "attr.owner.region",
                        name: "Region",
                        uri: "/gdc/md/jroecoqa7jywstxy1hxp8lwl2c4nc10t/obj/1023",
                    },
                    identifier: "label.owner.region",
                    localIdentifier: "6af145960f4145efbe4ace7504b0f1de",
                    name: "Region",
                    uri: "/gdc/md/jroecoqa7jywstxy1hxp8lwl2c4nc10t/obj/1024",
                },
                attributeHeaderItem: {
                    name: "East Coast",
                    uri: "/gdc/md/jroecoqa7jywstxy1hxp8lwl2c4nc10t/obj/1023/elements?id=1225",
                },
            },
        },
        {
            header: {
                attributeHeader: {
                    formOf: {
                        identifier: "attr.owner.department",
                        name: "Department",
                        uri: "/gdc/md/jroecoqa7jywstxy1hxp8lwl2c4nc10t/obj/1026",
                    },
                    identifier: "label.owner.department",
                    localIdentifier: "0e3388d37e444c369731afe398740572",
                    name: "Department",
                    uri: "/gdc/md/jroecoqa7jywstxy1hxp8lwl2c4nc10t/obj/1027",
                },
                attributeHeaderItem: {
                    name: "Direct Sales",
                    uri: "/gdc/md/jroecoqa7jywstxy1hxp8lwl2c4nc10t/obj/1026/elements?id=1226",
                },
            },
        },
    ];

    const attributes = dv.attributes();
    const measures = dv.measures();

    const a0uri = attributeUri(attributes[0]);
    const a1uri = attributeUri(attributes[1]);
    const m0uri = measureUri(measures[0]);

    it.each([
        ["parent attribute", [a0uri]],
        ["child attribute", [a1uri]],
        ["measure", [measureUri(measures[0])]],
        // tslint:disable-next-line:max-line-length
        ["parent and child attributes", [a0uri, a1uri]],
        // tslint:disable-next-line:max-line-length
        ["parent attribute and measure", [a0uri, m0uri]],
    ])('should return 3 drill items with "%s" configured', (_desc: string, itemUris: string[]) => {
        const drillableItems = itemUris.map((uri: string) => HeaderPredicates.uriMatch(uri));
        const drillableMeasuresSeriesData = getDrillableSeries(
            dv,
            seriesWithoutDrillability,
            drillableItems,
            [viewByAttribute, viewByParentAttribute],
            stackByAttribute,
            type,
        );

        expect(drillableMeasuresSeriesData[0].data[0].drillIntersection).toEqual(drillIntersectionItems);
    });
});
