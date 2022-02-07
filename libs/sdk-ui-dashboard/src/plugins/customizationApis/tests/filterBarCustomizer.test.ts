// (C) 2022 GoodData Corporation
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
        it('should return "default" if no mode was explicitly set', () => {
            const actual = Customizer.getFilterBarCustomizerResult();
            expect(actual.filterBarRenderingMode).toEqual("default");
        });

        it("should return the mode set using the setter", () => {
            Customizer.setFilterBarRenderingMode("hidden");
            const actual = Customizer.getFilterBarCustomizerResult();
            expect(actual.filterBarRenderingMode).toEqual("hidden");
        });

        it("should use the last provided mode if set multiple times", () => {
            Customizer.setFilterBarRenderingMode("default");
            Customizer.setFilterBarRenderingMode("hidden");

            const actual = Customizer.getFilterBarCustomizerResult();
            expect(actual.filterBarRenderingMode).toEqual("hidden");
        });

        it("should issue a warning if filter bar rendering mode is set multiple times", () => {
            Customizer.setFilterBarRenderingMode("default");
            Customizer.setFilterBarRenderingMode("hidden");

            expect(mockWarn).toHaveBeenCalled();
        });
    });
});
