// (C) 2026 GoodData Corporation

import { afterEach, describe, expect, it, vi } from "vitest";

import { inlineFontSize, resolveInlineFontSize } from "./inlineFontSize.js";

const SVG_NS = "http://www.w3.org/2000/svg";

function createHighchartsMock() {
    const proceed = vi.fn(() => "computed");
    const Highcharts = {
        SVGElement: { prototype: { getStyle: proceed } as Record<string, any> },
        wrap(obj: any, method: string, fn: (...args: any[]) => unknown) {
            const original = obj[method];
            obj[method] = function (this: unknown, ...args: unknown[]) {
                return fn.call(this, original, ...args);
            };
        },
    };
    inlineFontSize(Highcharts);
    return { getStyle: Highcharts.SVGElement.prototype["getStyle"], proceed };
}

function createSvgElement(name: string, fontSize?: string, parent?: Element) {
    const element = document.createElementNS(SVG_NS, name);
    if (fontSize) {
        element.style.fontSize = fontSize;
    }
    parent?.appendChild(element);
    return element;
}

/** svg (16px computed) > g (groupFontSize) > text (textFontSize) > tspan */
function createChartText(textFontSize?: string, groupFontSize?: string) {
    const svg = createSvgElement("svg");
    document.body.appendChild(svg);
    vi.spyOn(window, "getComputedStyle").mockImplementation(
        () => ({ getPropertyValue: () => "16px" }) as unknown as CSSStyleDeclaration,
    );
    const group = createSvgElement("g", groupFontSize, svg);
    const text = createSvgElement("text", textFontSize, group);
    const tspan = createSvgElement("tspan", undefined, text);
    return { svg, text, tspan };
}

afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
});

describe("resolveInlineFontSize", () => {
    it("should use an inline px font size as is", () => {
        expect(resolveInlineFontSize(createChartText("11px").text)).toBe(11);
    });

    it("should multiply em and % font sizes up to the svg root", () => {
        expect(resolveInlineFontSize(createChartText("0.75em", "50%").tspan)).toBe(6);
    });

    it("should read the computed font size of the svg root only once", () => {
        const { svg, text } = createChartText("0.75em");

        resolveInlineFontSize(text);
        resolveInlineFontSize(text);

        expect(window.getComputedStyle).toHaveBeenCalledTimes(1);
        expect(window.getComputedStyle).toHaveBeenCalledWith(svg);
    });

    it("should not resolve a detached element", () => {
        expect(resolveInlineFontSize(createSvgElement("text", "0.7em"))).toBeUndefined();
    });

    it("should not resolve unsupported units", () => {
        expect(resolveInlineFontSize(createChartText("1rem").text)).toBeUndefined();
    });
});

describe("inlineFontSize", () => {
    it("should return the resolved font size of a wrapper without calling the original", () => {
        const { getStyle, proceed } = createHighchartsMock();
        const wrapper = { element: createChartText("0.7em").text, renderer: { styledMode: false } };

        expect(getStyle.call(wrapper, "font-size")).toBe("11.2px");
        expect(proceed).not.toHaveBeenCalled();
    });

    it("should return the resolved font size of a DOM node (fontMetrics path)", () => {
        const { getStyle, proceed } = createHighchartsMock();

        expect(getStyle.call(createChartText("13px").tspan, "font-size")).toBe("13px");
        expect(proceed).not.toHaveBeenCalled();
    });

    it.each([
        ["a detached element", () => ({ element: createSvgElement("text", "11px") }), "font-size"],
        ["another property", () => ({ element: createChartText("11px").text }), "stroke-width"],
        [
            "styled mode",
            () => ({ element: createChartText("11px").text, renderer: { styledMode: true } }),
            "font-size",
        ],
    ])("should call the original getStyle for %s", (_, createWrapper, prop) => {
        const { getStyle, proceed } = createHighchartsMock();

        expect(getStyle.call(createWrapper(), prop)).toBe("computed");
        expect(proceed).toHaveBeenCalledWith(prop);
    });
});
