// (C) 2007-2023 GoodData Corporation
import cloneDeep from "lodash/cloneDeep.js";
import { dummyDataView } from "@gooddata/sdk-backend-mockingbird";
import { newDefForItems, uriRef } from "@gooddata/sdk-model";
import { IDrillConfig, IDrillEventIntersectionElement, VisualizationTypes } from "@gooddata/sdk-ui";
import Highcharts from "../../../lib/index.js";
import { chartClick, getClickableElementNameByChartType } from "../drilldownEventing.js";
import { IHighchartsPointObject } from "../isGroupHighchartsDrillEvent.js";
import { describe, it, expect, vi } from "vitest";

const SeriesChartTypes = {
    COLUMN: "column",
    LINE: "line",
    AREA: "area",
};

describe("Drilldown Eventing", () => {
    vi.useFakeTimers();

    const ADHOC_MEASURE_LOCAL_IDENTIFIER = "m1";
    const ADHOC_MEASURE_URI = "/gdc/md/projectId/obj/2";
    const dataView = dummyDataView(
        newDefForItems("testWorkspace", [
            {
                measure: {
                    localIdentifier: ADHOC_MEASURE_LOCAL_IDENTIFIER,
                    definition: {
                        measureDefinition: {
                            item: {
                                uri: ADHOC_MEASURE_URI,
                            },
                        },
                    },
                },
            },
        ]),
    );

    const point: Partial<IHighchartsPointObject> = {
        x: 1,
        y: 2,
        value: 678.0,
        drillIntersection: [
            {
                header: {
                    measureHeaderItem: {
                        uri: "uri1",
                        identifier: "identifier1",
                        localIdentifier: "id1",
                        name: "title",
                        format: "",
                    },
                },
            },
            {
                header: {
                    measureHeaderItem: {
                        uri: "uri2",
                        identifier: "identifier2",
                        localIdentifier: "id2",
                        name: "title",
                        format: "",
                    },
                },
            },
            {
                header: {
                    measureHeaderItem: {
                        uri: "uri3",
                        identifier: "identifier3",
                        localIdentifier: "id3",
                        name: "title",
                        format: "",
                    },
                },
            },
        ],
    };
    const pointClickEventData = { point } as Highcharts.DrilldownEventObject;

    it("should get clickable chart element name", () => {
        const fn = getClickableElementNameByChartType;
        expect(fn(VisualizationTypes.LINE)).toBe("point");
        expect(fn(VisualizationTypes.COLUMN)).toBe("bar");
        expect(fn(VisualizationTypes.BAR)).toBe("bar");
        expect(fn(VisualizationTypes.PIE)).toBe("slice");
        expect(fn(VisualizationTypes.TREEMAP)).toBe("slice");
        expect(fn(VisualizationTypes.HEATMAP)).toBe("cell");
        expect(() => {
            fn("headline"); // headline is not defined
        }).toThrowError();
    });

    it("should call point drill context (non-group) when event.points given but null", () => {
        const drillConfig: IDrillConfig = { dataView, onDrill: () => true };
        const target = { dispatchEvent: vi.fn() };
        const pointClickEventDataWithNullPoints: Highcharts.DrilldownEventObject = {
            ...pointClickEventData,
            points: null,
        };

        chartClick(
            drillConfig,
            pointClickEventDataWithNullPoints,
            target as any as EventTarget,
            VisualizationTypes.LINE,
        );

        vi.runAllTimers();

        const drillContext = target.dispatchEvent.mock.calls[0][0].detail.drillContext;
        expect(drillContext.element).toEqual("point");
    });

    it("should call default fire event on point click and fire correct data", () => {
        const drillConfig = { dataView, onDrill: () => true };
        const target = { dispatchEvent: vi.fn() };

        chartClick(drillConfig, pointClickEventData, target as any as EventTarget, VisualizationTypes.LINE);

        vi.runAllTimers();

        expect(target.dispatchEvent).toHaveBeenCalled();

        expect(target.dispatchEvent.mock.calls[0][0].detail).toEqual({
            dataView,
            drillContext: {
                type: "line",
                element: "point",
                x: 1,
                y: 2,
                intersection: [
                    {
                        header: {
                            measureHeaderItem: {
                                uri: "uri1",
                                identifier: "identifier1",
                                localIdentifier: "id1",
                                name: "title",
                                format: "",
                            },
                        },
                    },
                    {
                        header: {
                            measureHeaderItem: {
                                uri: "uri2",
                                identifier: "identifier2",
                                localIdentifier: "id2",
                                name: "title",
                                format: "",
                            },
                        },
                    },
                    {
                        header: {
                            measureHeaderItem: {
                                uri: "uri3",
                                identifier: "identifier3",
                                localIdentifier: "id3",
                                name: "title",
                                format: "",
                            },
                        },
                    },
                ],
            },
        });
    });

    it('should fire correct data with property "value" for treemap and heatmap', () => {
        const drillConfig = { dataView, onDrill: () => true };
        const target = { dispatchEvent: vi.fn() };

        chartClick(
            drillConfig,
            pointClickEventData,
            target as any as EventTarget,
            VisualizationTypes.TREEMAP,
        );

        vi.runAllTimers();

        expect(target.dispatchEvent).toHaveBeenCalled();

        expect(target.dispatchEvent.mock.calls[0][0].detail.drillContext.value).toBe("678");

        chartClick(
            drillConfig,
            pointClickEventData,
            target as any as EventTarget,
            VisualizationTypes.HEATMAP,
        );

        vi.runAllTimers();

        expect(target.dispatchEvent).toHaveBeenCalled();

        expect(target.dispatchEvent.mock.calls[0][0].detail.drillContext.value).toBe("678");
    });

    it("should remove duplicated values for heatmap", () => {
        const drillIntersections: IDrillEventIntersectionElement[] = [
            {
                header: {
                    attributeHeaderItem: {
                        uri: "/gdc/md/dfnkvzqa683mz1c29ijdkydrsodm8wjw/obj/1281/elements?id=1deea80aa5a54d1bbbc2e2de63989eef",
                        name: "Best Case",
                    },
                    attributeHeader: {
                        uri: "/gdc/md/dfnkvzqa683mz1c29ijdkydrsodm8wjw/obj/1282",
                        identifier: "ac3EwmqvbxcX",
                        localIdentifier: "a1",
                        name: "Case",
                        ref: uriRef("/gdc/md/dfnkvzqa683mz1c29ijdkydrsodm8wjw/obj/1282"),
                        formOf: {
                            uri: "/gdc/md/dfnkvzqa683mz1c29ijdkydrsodm8wjw/obj/1281",
                            identifier: "identifier1",
                            name: "Case",
                            ref: uriRef("/gdc/md/dfnkvzqa683mz1c29ijdkydrsodm8wjw/obj/1281"),
                        },
                    },
                },
            },
            {
                header: {
                    attributeHeaderItem: {
                        uri: "/gdc/md/dfnkvzqa683mz1c29ijdkydrsodm8wjw/obj/951/elements?id=168279",
                        name: "CompuSci",
                    },
                    attributeHeader: {
                        uri: "/gdc/md/dfnkvzqa683mz1c29ijdkydrsodm8wjw/obj/952",
                        identifier: "label.product.id.name",
                        localIdentifier: "a2",
                        name: "Product",
                        ref: uriRef("/gdc/md/dfnkvzqa683mz1c29ijdkydrsodm8wjw/obj/952"),
                        formOf: {
                            uri: "/gdc/md/dfnkvzqa683mz1c29ijdkydrsodm8wjw/obj/951",
                            identifier: "label.product.id",
                            name: "Product",
                            ref: uriRef("/gdc/md/dfnkvzqa683mz1c29ijdkydrsodm8wjw/obj/951"),
                        },
                    },
                },
            },
            {
                header: {
                    attributeHeaderItem: {
                        uri: "/gdc/md/dfnkvzqa683mz1c29ijdkydrsodm8wjw/obj/323/elements?id=2010",
                        name: "2010",
                    },
                    attributeHeader: {
                        uri: "/gdc/md/dfnkvzqa683mz1c29ijdkydrsodm8wjw/obj/324",
                        identifier: "closed.aag81lMifn6q",
                        localIdentifier: "a3",
                        name: "Closed",
                        ref: uriRef("/gdc/md/dfnkvzqa683mz1c29ijdkydrsodm8wjw/obj/324"),
                        formOf: {
                            uri: "/gdc/md/dfnkvzqa683mz1c29ijdkydrsodm8wjw/obj/323",
                            identifier: "closed",
                            name: "Closed",
                            ref: uriRef("/gdc/md/dfnkvzqa683mz1c29ijdkydrsodm8wjw/obj/323"),
                        },
                    },
                },
            },
        ];
        const pointsWithEmptyValues: Array<Partial<IHighchartsPointObject>> = [
            { x: 0, y: 0, value: 268.8, drillIntersection: drillIntersections },
            { x: 0, y: 1, value: null, drillIntersection: drillIntersections },
            {
                x: 0,
                y: 1,
                value: null,
                drillIntersection: drillIntersections,
                ignoredInDrillEventContext: true,
            },
            { x: 0, y: 2, value: null, drillIntersection: drillIntersections },
            {
                x: 0,
                y: 2,
                value: null,
                drillIntersection: drillIntersections,
                ignoredInDrillEventContext: true,
            },
            { x: 0, y: 3, value: 3644, drillIntersection: drillIntersections },
        ];
        const pointClickWithEmptyEventData: Highcharts.DrilldownEventObject = {
            points: pointsWithEmptyValues,
        } as any;

        const drillConfig = { dataView, onDrill: () => true };
        const target = { dispatchEvent: vi.fn() };

        chartClick(
            drillConfig,
            pointClickWithEmptyEventData,
            target as any as EventTarget,
            VisualizationTypes.HEATMAP,
        );

        vi.runAllTimers();

        expect(target.dispatchEvent).toHaveBeenCalled();

        expect(target.dispatchEvent.mock.calls[0][0].detail.drillContext.points).toEqual([
            {
                intersection: drillIntersections,
                x: 0,
                y: 0,
            },
            {
                intersection: drillIntersections,
                x: 0,
                y: 1,
            },
            {
                intersection: drillIntersections,
                x: 0,
                y: 2,
            },
            {
                intersection: drillIntersections,
                x: 0,
                y: 3,
            },
        ]);
    });

    it("should correctly handle z coordinate of point", () => {
        const drillConfig = { dataView, onDrill: () => true };
        const target = { dispatchEvent: vi.fn() };
        const pointClickWitZEventData: any = cloneDeep(pointClickEventData);

        pointClickWitZEventData.point["z"] = 12000;

        chartClick(
            drillConfig,
            pointClickWitZEventData,
            target as any as EventTarget,
            VisualizationTypes.BUBBLE,
        );

        vi.runAllTimers();

        expect(target.dispatchEvent).toHaveBeenCalled();

        expect(target.dispatchEvent.mock.calls[0][0].detail).toEqual({
            dataView,
            drillContext: {
                type: "bubble",
                element: "point",
                x: 1,
                y: 2,
                z: 12000,
                intersection: [
                    {
                        header: {
                            measureHeaderItem: {
                                uri: "uri1",
                                identifier: "identifier1",
                                localIdentifier: "id1",
                                name: "title",
                                format: "",
                            },
                        },
                    },
                    {
                        header: {
                            measureHeaderItem: {
                                uri: "uri2",
                                identifier: "identifier2",
                                localIdentifier: "id2",
                                name: "title",
                                format: "",
                            },
                        },
                    },
                    {
                        header: {
                            measureHeaderItem: {
                                uri: "uri3",
                                identifier: "identifier3",
                                localIdentifier: "id3",
                                name: "title",
                                format: "",
                            },
                        },
                    },
                ],
            },
        });
    });

    it("should call user defined callback on point click", () => {
        const drillConfig = { dataView, onDrill: vi.fn() };
        const target = { dispatchEvent: () => true };

        chartClick(drillConfig, pointClickEventData, target as any as EventTarget, VisualizationTypes.LINE);

        vi.runAllTimers();

        expect(drillConfig.onDrill).toHaveBeenCalled();
    });

    it("should call both default fire event and user defined callback on point click", () => {
        const drillConfig = { dataView, onDrill: vi.fn() };
        const target = { dispatchEvent: vi.fn() };

        chartClick(drillConfig, pointClickEventData, target as any as EventTarget, VisualizationTypes.LINE);

        vi.runAllTimers();

        expect(target.dispatchEvent).toHaveBeenCalled();
        expect(drillConfig.onDrill).toHaveBeenCalled();
    });

    it("should only call user defined callback on point click", () => {
        const drillConfig = { dataView, onDrill: vi.fn().mockReturnValue(false) };
        const target = { dispatchEvent: vi.fn() };

        chartClick(drillConfig, pointClickEventData, target as any as EventTarget, VisualizationTypes.LINE);

        vi.runAllTimers();

        expect(target.dispatchEvent).not.toHaveBeenCalled();
        expect(drillConfig.onDrill).toHaveBeenCalled();
    });

    it("should call fire event on label click", () => {
        const drillConfig = { dataView, onDrill: () => true };
        const target = { dispatchEvent: vi.fn() };
        const clickedPoint: Partial<IHighchartsPointObject> = {
            x: 1,
            y: 2,
            drillIntersection: [
                {
                    header: {
                        measureHeaderItem: {
                            uri: "uri1",
                            identifier: "identifier1",
                            localIdentifier: "id1",
                            name: "title",
                            format: "",
                        },
                    },
                },
            ],
        };
        const labelClickEventData = {
            points: [clickedPoint],
        } as any as Highcharts.DrilldownEventObject;

        chartClick(drillConfig, labelClickEventData, target as any as EventTarget, VisualizationTypes.LINE);

        vi.runAllTimers();

        expect(target.dispatchEvent).toHaveBeenCalled();

        expect(target.dispatchEvent.mock.calls[0][0].detail).toEqual({
            dataView,
            drillContext: {
                type: "line",
                element: "label",
                points: [
                    {
                        x: 1,
                        y: 2,
                        intersection: [
                            {
                                header: {
                                    measureHeaderItem: {
                                        uri: "uri1",
                                        identifier: "identifier1",
                                        localIdentifier: "id1",
                                        name: "title",
                                        format: "",
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
        });
    });

    describe("Drilling in Combo chart", () => {
        const columnPoint: IHighchartsPointObject = {
            ...point,
            series: { type: SeriesChartTypes.COLUMN },
        } as any;

        const linePoint: IHighchartsPointObject = {
            ...point,
            x: 2,
            y: 3,
            series: { type: SeriesChartTypes.LINE },
            drillIntersection: [
                {
                    id: "id4",
                    title: "title4",
                    header: {
                        identifier: "identifier4",
                        uri: "uri4",
                    },
                },
                {
                    id: "id5",
                    title: "title5",
                    header: {
                        identifier: "identifier5",
                        uri: "uri5",
                    },
                },
                {
                    id: "id6",
                    title: "title6",
                    header: {
                        identifier: "identifier6",
                        uri: "uri6",
                    },
                },
            ],
        } as any;

        it("should return chart type for each point", () => {
            const drillConfig: IDrillConfig = { dataView, onDrill: vi.fn() };
            const target: any = { dispatchEvent: vi.fn() };
            const pointClickEventData: Highcharts.DrilldownEventObject = {
                point: columnPoint,
                points: [columnPoint, linePoint],
            } as any;

            chartClick(drillConfig, pointClickEventData, target as EventTarget, VisualizationTypes.COMBO2);

            vi.runAllTimers();

            const drillContext = target.dispatchEvent.mock.calls[0][0].detail.drillContext;

            expect(drillConfig.onDrill).toHaveBeenCalled();
            expect(drillContext).toEqual({
                type: VisualizationTypes.COMBO,
                element: "label",
                points: [
                    {
                        x: columnPoint.x,
                        y: columnPoint.y,
                        intersection: columnPoint.drillIntersection,
                        type: SeriesChartTypes.COLUMN,
                    },
                    {
                        x: linePoint.x,
                        y: linePoint.y,
                        intersection: linePoint.drillIntersection,
                        type: SeriesChartTypes.LINE,
                    },
                ],
            });
        });

        it("should fire event on cell click and fire correct data", () => {
            const drillConfig: IDrillConfig = { dataView, onDrill: () => true };
            const target: any = { dispatchEvent: vi.fn() };
            const pointClickEventData: Highcharts.DrilldownEventObject = {
                point: linePoint,
                points: null,
            } as any;

            chartClick(drillConfig, pointClickEventData, target as EventTarget, VisualizationTypes.COMBO2);

            vi.runAllTimers();

            expect(target.dispatchEvent).toHaveBeenCalled();
            expect(target.dispatchEvent.mock.calls[0][0].detail).toEqual({
                dataView,
                drillContext: {
                    type: VisualizationTypes.COMBO,
                    element: "point",
                    elementChartType: SeriesChartTypes.LINE,
                    x: linePoint.x,
                    y: linePoint.y,
                    intersection: linePoint.drillIntersection,
                },
            });
        });

        it("should NOT add chart type for each point if it is not Combo chart", () => {
            const drillConfig: IDrillConfig = { dataView, onDrill: vi.fn() };
            const target: any = { dispatchEvent: vi.fn() };
            const pointClickEventData: Highcharts.DrilldownEventObject = {
                point: columnPoint,
                points: [columnPoint],
            } as any;

            chartClick(drillConfig, pointClickEventData, target as EventTarget, VisualizationTypes.COLUMN);

            vi.runAllTimers();

            const drillContext = target.dispatchEvent.mock.calls[0][0].detail.drillContext;

            expect(drillConfig.onDrill).toHaveBeenCalled();
            expect(drillContext).toEqual({
                type: VisualizationTypes.COLUMN,
                element: "label",
                points: [
                    {
                        x: columnPoint.x,
                        y: columnPoint.y,
                        intersection: columnPoint.drillIntersection,
                    },
                ],
            });
        });

        it("should NOT add elementChartType on cell click if it is not Combo chart", () => {
            const drillConfig: IDrillConfig = { dataView, onDrill: () => true };
            const target: any = { dispatchEvent: vi.fn() };
            const pointClickEventData: Highcharts.DrilldownEventObject = {
                point: linePoint,
                points: null,
            } as any;

            chartClick(drillConfig, pointClickEventData, target as EventTarget, VisualizationTypes.LINE);

            vi.runAllTimers();

            expect(target.dispatchEvent).toHaveBeenCalled();
            expect(target.dispatchEvent.mock.calls[0][0].detail).toEqual({
                dataView,
                drillContext: {
                    type: VisualizationTypes.LINE,
                    element: "point",
                    x: linePoint.x,
                    y: linePoint.y,
                    intersection: linePoint.drillIntersection,
                },
            });
        });
    });

    describe("bullet chart", () => {
        const drillConfig = { dataView, onDrill: () => true };

        const targetPoint: any = {
            x: 1,
            y: 2,
            target: 100,
            series: {
                type: "bullet",
                userOptions: {
                    bulletChartMeasureType: "target",
                },
            },
            drillIntersection: [],
        };

        const targetPointWithNullValue: any = {
            x: 1,
            y: 0,
            target: 0,
            isNullTarget: true,
            series: {
                type: "bullet",
                userOptions: {
                    bulletChartMeasureType: "target",
                },
            },
            drillIntersection: [],
        };

        const primaryPoint: any = {
            x: 1,
            y: 2,
            target: 100,
            series: {
                type: "bar",
                userOptions: {
                    bulletChartMeasureType: "primary",
                },
            },
            drillIntersection: [],
        };

        const comparativePoint: any = {
            x: 1,
            y: 3,
            target: 100,
            series: {
                type: "bar",
                userOptions: {
                    bulletChartMeasureType: "comparative",
                },
            },
            drillIntersection: [],
        };

        it("should fire correct data for target measure drilling", () => {
            const target: any = { dispatchEvent: vi.fn() };
            const targetPointClickEventData: any = { point: targetPoint };
            chartClick(
                drillConfig,
                targetPointClickEventData as Highcharts.DrilldownEventObject,
                target as EventTarget,
                VisualizationTypes.BULLET,
            );

            vi.runAllTimers();

            expect(target.dispatchEvent.mock.calls[0][0].detail.drillContext.element).toBe("target");
            expect(target.dispatchEvent.mock.calls[0][0].detail.drillContext.y).toBe(100);
        });

        it("should fire correct data for primary measure drilling", () => {
            const target: any = { dispatchEvent: vi.fn() };
            const primaryPointClickEventData: any = { point: primaryPoint };
            chartClick(
                drillConfig,
                primaryPointClickEventData,
                target as EventTarget,
                VisualizationTypes.BULLET,
            );

            vi.runAllTimers();

            expect(target.dispatchEvent.mock.calls[0][0].detail.drillContext.element).toBe("primary");
            expect(target.dispatchEvent.mock.calls[0][0].detail.drillContext.y).toBe(2);
        });

        it("should fire correct data for comparative measure drilling", () => {
            const target: any = { dispatchEvent: vi.fn() };
            const comparativePointClickEventData: any = { point: comparativePoint };
            chartClick(
                drillConfig,
                comparativePointClickEventData,
                target as EventTarget,
                VisualizationTypes.BULLET,
            );

            vi.runAllTimers();

            expect(target.dispatchEvent.mock.calls[0][0].detail.drillContext.element).toBe("comparative");
            expect(target.dispatchEvent.mock.calls[0][0].detail.drillContext.y).toBe(3);
        });

        it("should fire correct data for attribute drilling", () => {
            const target: any = { dispatchEvent: vi.fn() };
            const pointClickEventData: any = { points: [targetPoint, primaryPoint, comparativePoint] };

            chartClick(
                drillConfig,
                pointClickEventData as Highcharts.DrilldownEventObject,
                target as EventTarget,
                VisualizationTypes.BULLET,
            );

            vi.runAllTimers();

            expect(target.dispatchEvent.mock.calls[0][0].detail.drillContext.points).toEqual([
                { intersection: [], type: "target", x: 1, y: 100 },
                { intersection: [], type: "primary", x: 1, y: 2 },
                { intersection: [], type: "comparative", x: 1, y: 3 },
            ]);
        });

        it("should fire correct data for attribute drilling with null value target", () => {
            const target: any = { dispatchEvent: vi.fn() };
            const pointClickEventData: any = {
                points: [targetPointWithNullValue, primaryPoint, comparativePoint],
            };

            chartClick(
                drillConfig,
                pointClickEventData as Highcharts.DrilldownEventObject,
                target as EventTarget,
                VisualizationTypes.BULLET,
            );

            vi.runAllTimers();

            expect(target.dispatchEvent.mock.calls[0][0].detail.drillContext.points).toEqual([
                { intersection: [], type: "target", x: 1, y: null },
                { intersection: [], type: "primary", x: 1, y: 2 },
                { intersection: [], type: "comparative", x: 1, y: 3 },
            ]);
        });
    });
});
