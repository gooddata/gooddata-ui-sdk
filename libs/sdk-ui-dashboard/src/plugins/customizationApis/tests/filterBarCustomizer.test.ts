// (C) 2022 GoodData Corporation
import { DefaultFilterBar, HiddenFilterBar } from "../../../presentation";
import { DefaultFilterBarCustomizer } from "../filterBarCustomizer";
import { TestingDashboardCustomizationLogger } from "./fixtures/TestingDashboardCustomizationLogger";

describe("filter bar customizer", () => {
    let Customizer: DefaultFilterBarCustomizer;
    let mockWarn: ReturnType<typeof jest.fn>;

    beforeEach(() => {
        mockWarn = jest.fn();
        Customizer = new DefaultFilterBarCustomizer(
            new TestingDashboardCustomizationLogger({ warn: mockWarn }),
        );
    });

    describe("filter bar rendering mode", () => {
        it("should return DefaultFilterBar if no mode was explicitly set", () => {
            const actual = Customizer.getCustomizerResult();
            expect(actual.FilterBarComponent).toEqual(DefaultFilterBar);
        });

        it("should return DefaultFilterBar if mode: default was explicitly set", () => {
            Customizer.setRenderingMode("default");
            const actual = Customizer.getCustomizerResult();
            expect(actual.FilterBarComponent).toEqual(DefaultFilterBar);
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
