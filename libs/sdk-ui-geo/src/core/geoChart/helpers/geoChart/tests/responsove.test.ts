// (C) 2021 GoodData Corporation
import {
    getPushpinColorLegendSize,
    getPushpinColorLegendTitle,
    getPushpinSizeLegendTitle,
    isSmallPushpinSizeLegend,
    shouldRenderCircleLegendInsidePopUp,
} from "../responsive.js";
import { describe, it, expect } from "vitest";

describe("responsive", () => {
    describe("getPushpinColorLegendSize", () => {
        it("should return large size if responsive flag is responsive", () => {
            expect(getPushpinColorLegendSize(1000, undefined, false)).toBe("large");
        });

        it("should return small size if responsive flag is autoPositionWithPopup and container is small", () => {
            expect(getPushpinColorLegendSize(200, undefined, "autoPositionWithPopup")).toBe("small");
        });

        it("should return large size if responsive flag is autoPositionWithPopup and container is large", () => {
            expect(getPushpinColorLegendSize(1000, undefined, "autoPositionWithPopup")).toBe("large");
        });

        it("should return medium size if responsive flag is true and isFluidLegend as well", () => {
            expect(getPushpinColorLegendSize(1000, true, true)).toBe("medium");
        });
    });

    describe("getPushpinColorLegendTitle", () => {
        it("should return correct title if responsive is autoPositionWithPopup", () => {
            expect(getPushpinColorLegendTitle("title.1", 1000, "autoPositionWithPopup")).toBe("title.1");
        });

        it("should return undefined if responsive is autoPositionWithPopup but container is small", () => {
            expect(getPushpinColorLegendTitle("title.1", 200, "autoPositionWithPopup")).toBe(undefined);
        });

        it("should return undefined if responsive is not autoPositionWithPopup", () => {
            expect(getPushpinColorLegendTitle("title.1", 200, false)).toBe(undefined);
        });
    });

    describe("isSmallPushpinSizeLegend", () => {
        it("should return true if container is small and responsive is autoPositionWithPopup", () => {
            expect(isSmallPushpinSizeLegend(200, false, "autoPositionWithPopup")).toBe(true);
        });

        it("should return false if container is large and responsive is autoPositionWithPopup", () => {
            expect(isSmallPushpinSizeLegend(1000, false, "autoPositionWithPopup")).toBe(false);
        });

        it("should return false if ignoreSmallSize is true", () => {
            expect(isSmallPushpinSizeLegend(200, true, "autoPositionWithPopup")).toBe(false);
        });
    });

    describe("getPushpinSizeLegendTitle", () => {
        it("should return correct title if responsive is autoPositionWithPopup and container is large", () => {
            expect(getPushpinSizeLegendTitle("title.1", 1000, false)).toBe("title.1");
        });

        it("should return undefined if ignoreMeasureName is true", () => {
            expect(getPushpinSizeLegendTitle("title.1", 1000, true)).toBe(undefined);
        });

        it("should return undefined if container is small", () => {
            expect(getPushpinSizeLegendTitle("title.1", 200, false)).toBe(undefined);
        });
    });

    describe("shouldRenderCircleLegendInsidePopUp", () => {
        it("should return true if container is small and Pop Up legend should render", () => {
            expect(shouldRenderCircleLegendInsidePopUp(300, true)).toBe(true);
        });

        it("should return false if container is big but Pop Up legend should render", () => {
            expect(shouldRenderCircleLegendInsidePopUp(1000, true)).toBe(false);
        });

        it("should return false if container is small but Pop Up legend should not render", () => {
            expect(shouldRenderCircleLegendInsidePopUp(1000, true)).toBe(false);
        });
    });
});
