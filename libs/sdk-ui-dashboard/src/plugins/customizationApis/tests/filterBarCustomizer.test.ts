// (C) 2022 GoodData Corporation
import { HiddenFilterBar } from "../../../presentation/index.js";
import { DefaultFilterBarCustomizer } from "../filterBarCustomizer.js";
import { TestingDashboardCustomizationLogger } from "./fixtures/TestingDashboardCustomizationLogger.js";
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("filter bar customizer", () => {
    let Customizer: DefaultFilterBarCustomizer;
    let mockWarn: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockWarn = vi.fn();
        Customizer = new DefaultFilterBarCustomizer(
            new TestingDashboardCustomizationLogger({ warn: mockWarn }),
        );
    });

    describe("filter bar rendering mode", () => {
        it("should return undefined if no mode was explicitly set", () => {
            const actual = Customizer.getCustomizerResult();
            expect(actual.FilterBarComponent).toBeUndefined();
        });

        it("should return undefined if mode: default was explicitly set", () => {
            Customizer.setRenderingMode("default");
            const actual = Customizer.getCustomizerResult();
            expect(actual.FilterBarComponent).toBeUndefined();
        });

        it("should return HiddenFilterBar if mode: hidden set using the setter", () => {
            Customizer.setRenderingMode("hidden");
            const actual = Customizer.getCustomizerResult();
            expect(actual.FilterBarComponent).toEqual(HiddenFilterBar);
        });

        it("should use the last provided mode if set multiple times", () => {
            Customizer.setRenderingMode("default");
            Customizer.setRenderingMode("hidden");

            const actual = Customizer.getCustomizerResult();
            expect(actual.FilterBarComponent).toEqual(HiddenFilterBar);
        });

        it("should issue a warning if filter bar rendering mode is set multiple times", () => {
            Customizer.setRenderingMode("default");
            Customizer.setRenderingMode("hidden");

            expect(mockWarn).toHaveBeenCalled();
        });
    });
});
