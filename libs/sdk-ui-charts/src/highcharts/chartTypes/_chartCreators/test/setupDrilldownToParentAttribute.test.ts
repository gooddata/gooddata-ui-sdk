// (C) 2007-2020 GoodData Corporation
import { getDDPointsInParentTick, setupDrilldown } from "../setupDrilldownToParentAttribute.js";
import { styleVariables } from "../styles/variables.js";
import { IHighchartsPointObject } from "../isGroupHighchartsDrillEvent.js";
import { describe, it, expect } from "vitest";

class MockHighChartsLabel {
    public basicStyles = { cursor: "default" };
    private classNames: string[] = [];
    private cssObj: { [property: string]: string } = {};
    private events: { [property: string]: (event: Event) => void } = {};

    public addClass(className: string) {
        this.classNames.push(className);
        return this;
    }

    public hasClass(className: string) {
        return this.classNames.indexOf(className) !== -1;
    }

    public css(cssObj: { [property: string]: string }) {
        this.cssObj = cssObj;
        return this;
    }

    public on(eventName: string, callback: (event: Event) => void) {
        this.events[eventName] = callback;
        return this;
    }

    public getCss() {
        return this.cssObj;
    }

    public hasEvent(eventName: string) {
        return Boolean(this.events[eventName]);
    }
}

describe("setupDrilldown", () => {
    it("should not setup drill without x axis in chart", () => {
        const highchartObject: any = {
            xAxis: [],
        };
        expect(setupDrilldown(highchartObject, "column")).toBeFalsy();
    });

    it("should not setup drill without chart type", () => {
        const highchartObject: any = {
            xAxis: [{}],
        };
        expect(setupDrilldown(highchartObject, null)).toBeFalsy();
    });

    it("should set parent item drillable", () => {
        const highchartObject: any = {
            container: "",
            xAxis: [
                {
                    userOptions: {
                        drillConfig: {},
                    },
                    categoriesTree: [
                        {
                            name: "Pink",
                            categories: ["low", "medium", "high"],
                            tick: {
                                startAt: 0,
                                leaves: 3,
                                label: new MockHighChartsLabel(),
                            },
                        },
                    ],
                    getDDPoints: (): IHighchartsPointObject[] => Array(3).fill({}),
                },
            ],
            options: {
                chart: {
                    type: "column",
                },
            },
        };

        setupDrilldown(highchartObject, "column");

        const label = highchartObject.xAxis[0].categoriesTree[0].tick.label;
        expect(label.hasClass("highcharts-drilldown-axis-label")).toBeTruthy();
        expect(label.hasEvent("click")).toBeTruthy();
        expect(label.getCss()).toEqual({
            cursor: "pointer",
            color: styleVariables.gdColorText,
        });
    });

    it("should not set parent item drillable without drilling points", () => {
        const highchartObject: any = {
            container: "",
            xAxis: [
                {
                    userOptions: {
                        drillConfig: {},
                    },
                    categoriesTree: [
                        {
                            name: "Pink",
                            categories: ["low", "medium", "high"],
                            tick: {
                                startAt: 0,
                                leaves: 3,
                                label: new MockHighChartsLabel(),
                            },
                        },
                    ],
                    getDDPoints: (): IHighchartsPointObject[] => [],
                },
            ],
            options: {
                chart: {
                    type: "column",
                },
            },
        };

        setupDrilldown(highchartObject, "column");

        const label = highchartObject.xAxis[0].categoriesTree[0].tick.label;
        expect(label.hasClass("highcharts-drilldown-axis-label")).toBeFalsy();
        expect(label.hasEvent("click")).toBeFalsy();
        expect(label.getCss()).toEqual({ cursor: "default" });
    });
});

describe("getDDPointsInParentTick", () => {
    it("should return the right drilldown points for bullet chart", () => {
        const ddPointsForBulletChart = [
            [
                {
                    series: {
                        userOptions: {
                            bulletChartMeasureType: "primary",
                        },
                    },
                    x: 0,
                    y: 200,
                },
                {
                    series: {
                        userOptions: {
                            bulletChartMeasureType: "target",
                        },
                    },
                    x: 0,
                    y: 0,
                    target: 300,
                },
                {
                    series: {
                        userOptions: {
                            bulletChartMeasureType: "comparative",
                        },
                    },
                    x: 0,
                    y: 400,
                },
            ],
            [
                {
                    series: {
                        userOptions: {
                            bulletChartMeasureType: "target",
                        },
                    },
                    x: 0,
                    y: 0,
                    target: 0,
                    isNullTarget: true,
                },
            ],
        ];

        const axis = {
            getDDPoints: (i: number) => ddPointsForBulletChart[i] || [],
        };

        const tick = {
            startAt: 0,
            leaves: 3,
            label: new MockHighChartsLabel(),
        };

        const expectedDDPoints = [
            {
                series: {
                    userOptions: {
                        bulletChartMeasureType: "primary",
                    },
                },
                x: 0,
                y: 200,
            },
            {
                series: {
                    userOptions: {
                        bulletChartMeasureType: "target",
                    },
                },
                x: 0,
                y: 300,
                target: 300,
            },
            {
                series: {
                    userOptions: {
                        bulletChartMeasureType: "comparative",
                    },
                },
                x: 0,
                y: 400,
            },
            {
                series: {
                    userOptions: {
                        bulletChartMeasureType: "target",
                    },
                },
                x: 0,
                y: null as number,
                target: 0,
                isNullTarget: true,
            },
        ];

        expect(getDDPointsInParentTick(axis, tick)).toEqual(expectedDDPoints);
    });
});
