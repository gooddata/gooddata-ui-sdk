// (C) 2007-2022 GoodData Corporation
import { IUnwrappedAttributeHeadersWithItems } from "../../../typings/mess";
import { getCategoriesForTwoAttributes } from "../extendedStackingChartOptions";
import { getMVSForViewByTwoAttributes } from "../../_util/test/helper";
import { attributeIdentifier, measureIdentifier, uriRef, IAttributeDescriptor } from "@gooddata/sdk-model";
import { HeaderPredicates, DefaultColorPalette } from "@gooddata/sdk-ui";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { MeasureColorStrategy } from "../../_chartColoring/measure";
import { recordedDataFacade } from "../../../../../__mocks__/recordings";
import { getSeries } from "../chartSeries";
import { getDrillableSeries } from "../chartDrilling";

describe("getCategoriesForTwoAttributes", () => {
    const attributeDescriptor: IAttributeDescriptor["attributeHeader"] = {
        uri: "uri",
        identifier: "identifier",
        localIdentifier: "localIdentifier",
        name: "name",
        ref: uriRef("uri"),
        formOf: {
            uri: "uri",
            identifier: "identifier",
            ref: uriRef("uri"),
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
    const dv = recordedDataFacade(ReferenceRecordings.Scenarios.BarChart.TwoMeasuresWithTwoViewBy);
    const { measureGroup, viewByAttribute, viewByParentAttribute, stackByAttribute } =
        getMVSForViewByTwoAttributes(dv);
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

    const attributes = dv.def().attributes();
    const measures = dv.def().measures();

    const a0id = attributeIdentifier(attributes[0]);
    const a1id = attributeIdentifier(attributes[1]);
    const m0id = measureIdentifier(measures[0]);

    it.each([
        ["parent attribute", [a0id]],
        ["child attribute", [a1id]],
        ["measure", [m0id]],
        ["parent and child attributes", [a0id, a1id]],
        ["parent attribute and measure", [a0id, m0id]],
    ])('should return 3 drill items with "%s" configured', (_desc: string, itemIds: string[]) => {
        const drillableItems = itemIds.map((id: string) => HeaderPredicates.identifierMatch(id));
        const drillableMeasuresSeriesData = getDrillableSeries(
            dv,
            seriesWithoutDrillability,
            drillableItems,
            [viewByAttribute, viewByParentAttribute],
            stackByAttribute,
            type,
        );

        expect(drillableMeasuresSeriesData[0].data[0].drillIntersection).toMatchSnapshot();
    });
});
