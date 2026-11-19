// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    DRILL_MENU_HOST_ATTRIBUTE,
    notifyDrillMenuExpandedChange,
    processDrillablePointAccessibility,
    rememberActivatedDrillPoint,
} from "./drillablePointAccessibility.js";

const SVG_NS = "http://www.w3.org/2000/svg";

function createPointElement(): Element {
    const element = document.createElementNS(SVG_NS, "rect");
    element.setAttribute("role", "img");
    return element;
}

function createContainer(isDrillMenuHost: boolean): HTMLElement {
    const container = document.createElement("div");
    if (isDrillMenuHost) {
        const host = document.createElement("div");
        host.setAttribute(DRILL_MENU_HOST_ATTRIBUTE, "true");
        host.appendChild(container);
    }
    return container;
}

function createChart(
    points: Array<{ drilldown?: boolean; isNull?: boolean; element?: Element }>,
    isDrillMenuHost = true,
) {
    return {
        container: createContainer(isDrillMenuHost),
        options: { accessibility: { enabled: true } },
        series: [
            {
                points: points.map(({ element, ...point }) => ({
                    ...point,
                    graphic: element ? { element } : undefined,
                })),
            },
        ],
    };
}

describe("processDrillablePointAccessibility", () => {
    it("exposes drillable points as buttons that open a menu", () => {
        const drillable = createPointElement();
        const chart = createChart([{ drilldown: true, element: drillable }]);

        processDrillablePointAccessibility(chart);

        expect(drillable).toHaveAttribute("role", "button");
        expect(drillable).toHaveAttribute("aria-haspopup", "menu");
        expect(drillable).toHaveAttribute("aria-expanded", "false");
    });

    it("exposes drillable points as plain buttons outside of a drill menu host", () => {
        const drillable = createPointElement();
        const chart = createChart([{ drilldown: true, element: drillable }], false);

        processDrillablePointAccessibility(chart);

        expect(drillable).toHaveAttribute("role", "button");
        expect(drillable).not.toHaveAttribute("aria-haspopup");
        expect(drillable).not.toHaveAttribute("aria-expanded");
    });

    it("leaves points without a drill and null points as images", () => {
        const notDrillable = createPointElement();
        const explicitlyNotDrillable = createPointElement();
        const nullPoint = createPointElement();
        const chart = createChart([
            { element: notDrillable },
            { drilldown: false, element: explicitlyNotDrillable },
            { drilldown: true, isNull: true, element: nullPoint },
        ]);

        processDrillablePointAccessibility(chart);

        [notDrillable, explicitlyNotDrillable, nullPoint].forEach((element) => {
            expect(element).toHaveAttribute("role", "img");
            expect(element).not.toHaveAttribute("aria-haspopup");
            expect(element).not.toHaveAttribute("aria-expanded");
        });
    });

    it("skips points that were not rendered", () => {
        const chart = createChart([{ drilldown: true }]);

        expect(() => processDrillablePointAccessibility(chart)).not.toThrow();
    });

    it("does nothing when the highcharts accessibility is disabled", () => {
        const drillable = createPointElement();
        const chart = createChart([{ drilldown: true, element: drillable }]);
        chart.options.accessibility.enabled = false;

        processDrillablePointAccessibility(chart);

        expect(drillable).toHaveAttribute("role", "img");
        expect(drillable).not.toHaveAttribute("aria-haspopup");
    });

    it("removes the menu attributes from a point that stopped being drillable", () => {
        const element = createPointElement();
        const point = { drilldown: true, element };
        const chart = createChart([point]);
        processDrillablePointAccessibility(chart);

        chart.series[0]!.points[0]!.drilldown = false;
        element.setAttribute("role", "img");
        processDrillablePointAccessibility(chart);

        expect(element).toHaveAttribute("role", "img");
        expect(element).not.toHaveAttribute("aria-haspopup");
        expect(element).not.toHaveAttribute("aria-expanded");
    });
});

describe("drill menu expanded state", () => {
    it("follows the menu of the activated point", () => {
        const first = createPointElement();
        const second = createPointElement();
        const chart = createChart([
            { drilldown: true, element: first },
            { drilldown: true, element: second },
        ]);
        processDrillablePointAccessibility(chart);

        rememberActivatedDrillPoint(chart.container, first);
        notifyDrillMenuExpandedChange(chart.container, true);

        expect(first).toHaveAttribute("aria-expanded", "true");
        expect(second).toHaveAttribute("aria-expanded", "false");

        notifyDrillMenuExpandedChange(chart.container, false);

        expect(first).toHaveAttribute("aria-expanded", "false");
    });

    it("keeps the point expanded when the chart renders while the menu is open", () => {
        const element = createPointElement();
        const chart = createChart([{ drilldown: true, element }]);
        processDrillablePointAccessibility(chart);
        rememberActivatedDrillPoint(chart.container, element);
        notifyDrillMenuExpandedChange(chart.container, true);

        element.setAttribute("role", "img");
        processDrillablePointAccessibility(chart);

        expect(element).toHaveAttribute("role", "button");
        expect(element).toHaveAttribute("aria-expanded", "true");
    });

    it("collapses the previous point when another one is activated", () => {
        const first = createPointElement();
        const second = createPointElement();
        const chart = createChart([
            { drilldown: true, element: first },
            { drilldown: true, element: second },
        ]);
        processDrillablePointAccessibility(chart);
        rememberActivatedDrillPoint(chart.container, first);
        notifyDrillMenuExpandedChange(chart.container, true);

        rememberActivatedDrillPoint(chart.container, second);
        notifyDrillMenuExpandedChange(chart.container, true);

        expect(first).toHaveAttribute("aria-expanded", "false");
        expect(second).toHaveAttribute("aria-expanded", "true");
    });

    it("ignores menu changes of a chart where no point was activated", () => {
        const element = createPointElement();
        const chart = createChart([{ drilldown: true, element }]);
        processDrillablePointAccessibility(chart);

        notifyDrillMenuExpandedChange(chart.container, true);

        expect(element).toHaveAttribute("aria-expanded", "false");
    });

    it("tolerates a missing chart container", () => {
        expect(() => notifyDrillMenuExpandedChange(undefined, true)).not.toThrow();
        expect(() => rememberActivatedDrillPoint(undefined, createPointElement())).not.toThrow();
    });
});
