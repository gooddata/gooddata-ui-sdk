// (C) 2022 GoodData Corporation
import { DashboardCustomizationLogger } from "../customizationLogging";
import { DefaultFilterBarCustomizer } from "../filterBarCustomizer";

describe("filter bar customizer", () => {
    let Customizer: DefaultFilterBarCustomizer;

    beforeEach(() => {
        Customizer = new DefaultFilterBarCustomizer(new DashboardCustomizationLogger());
    });

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
});
