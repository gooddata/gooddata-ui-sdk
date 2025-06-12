// (C) 2020 GoodData Corporation
import { IRegion } from "../../typings/domUtilities.js";
import { region, removeFromDom } from "../domUtilities.js";
import { describe, it, expect } from "vitest";

interface IConfig {
    height: number;
    left: number;
    top: number;
    width: number;
}

describe("region", () => {
    const createMockElement = (config: IConfig, parentItemRegion?: IRegion): HTMLElement => {
        return {
            offsetHeight: config.height,
            offsetWidth: config.width,
            getBoundingClientRect() {
                return {
                    top: config.top + (parentItemRegion?.top ?? 0),
                    left: config.left + (parentItemRegion?.left ?? 0),
                };
            },
        } as HTMLElement;
    };

    const createMockForHiddenElement = (
        config: IConfig,
        boundingRect: { width: number; height: number },
    ): HTMLElement => {
        return {
            offsetHeight: config.height,
            offsetWidth: config.width,
            getBoundingClientRect() {
                return {
                    top: config.top,
                    left: config.left,
                    width: boundingRect.width || config.width,
                    height: boundingRect.height || config.height,
                };
            },
        } as HTMLElement;
    };

    function createMockWindow() {
        return {
            pageXOffset: 50,
            pageYOffset: 100,
        } as Window & typeof globalThis;
    }

    it("should get node region", () => {
        const t1 = createMockElement({
            left: 40,
            top: 60,
            width: 200,
            height: 40,
        });

        const t1reg = region(t1);
        expect(t1reg).toEqual({
            left: 40,
            top: 60,
            width: 200,
            height: 40,
            bottom: 100,
            right: 240,
        });

        const t2 = createMockElement(
            {
                left: 5,
                top: 10,
                width: 100,
                height: 20,
            },
            t1reg,
        );

        const t2reg = region(t2);
        expect(t2reg).toEqual({
            left: 45,
            top: 70,
            width: 100,
            height: 20,
            bottom: 90,
            right: 145,
        });
    });

    it("should get node region from boundingRect when width/height is zero", () => {
        const element = createMockForHiddenElement(
            {
                left: 40,
                top: 60,
                width: 0,
                height: 0,
            },
            {
                width: 200,
                height: 40,
            },
        );

        const elementRegion = region(element);
        expect(elementRegion).toEqual({
            left: 40,
            top: 60,
            width: 200,
            height: 40,
            bottom: 100,
            right: 240,
        });
    });

    it("should get node region with window offset", () => {
        const t = createMockElement({
            left: 40,
            top: 60,
            width: 200,
            height: 40,
        });

        const treg = region(t, false, createMockWindow());
        expect(treg).toEqual({
            left: 90,
            top: 160,
            width: 200,
            height: 40,
            bottom: 200,
            right: 290,
        });
    });

    it("should get node region without window offset", () => {
        const t = createMockElement({
            left: 40,
            top: 60,
            width: 200,
            height: 40,
        });

        const treg = region(t, true, createMockWindow());
        expect(treg).toEqual({
            left: 40,
            top: 60,
            width: 200,
            height: 40,
            bottom: 100,
            right: 240,
        });
    });
});

describe("removeFromDom", () => {
    it("should not fail with falsy argument", () => {
        expect(() => removeFromDom(null)).not.toThrow();
    });

    it("should not fail when element is not in DOM", () => {
        const elem = document.createElement("div");
        expect(() => removeFromDom(elem)).not.toThrow();
    });

    it("should properly remove the element from DOM", () => {
        const elem = document.createElement("div");
        document.body.appendChild(elem);
        expect(document.body.children).toContain(elem);
        removeFromDom(elem);
        expect(document.body.children).not.toContain(elem);
    });
});
