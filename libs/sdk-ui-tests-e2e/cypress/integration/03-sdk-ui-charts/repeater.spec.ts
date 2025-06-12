// (C) 2024-2025 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { Repeater } from "../../tools/repeater";

describe("Repeater", { tags: ["checklist_integrated_tiger"] }, () => {
    it(`Should render apply full customize configurations`, () => {
        Navigation.visit("visualizations/repeater/repeater-full-configs");
        const repeater = new Repeater();
        repeater
            .hasHeaderCellsAmount(5)
            .hasRowHeight("85px")
            .hasVerticalAlign(1, "middle")
            .hasTextWrapping(1, "wrap")
            .hasImageSize(0, "fill")
            .isImageInCell(5)
            .isPlaceholderImageInCell(0)
            .isHyperlinkInCell(1, "Show more when clicking")
            .hasChartInCell(2, "column", 2)
            .hasChartInCell(3, "line", 5)
            .hasContentInCell(4, ".61")
            .hasColor(2, 0, "rgb(241, 134, 0)")
            .hasColor(3, 0, "rgb(181, 60, 51)");
    });

    it(`Should render insightView Repeater`, () => {
        Navigation.visit("visualizations/repeater/repeater-insight-view");
        const repeater = new Repeater();
        repeater
            .hasHeaderCellsAmount(5)
            .hasHeaderLabel(["Product", "Product", "Amount [BOP]", "Avg. Amount", "Probability"])
            .hasRowHeight("85px")
            .hasVerticalAlign(1, "middle")
            .hasTextWrapping(1, "wrap")
            .hasImageSize(0, "fill")
            .hasContentInCell(1, "(empty value)")
            .isHyperlinkInCell(6, "Show more when clicking")
            .hasChartInCell(2, "column", 2)
            .hasChartInCell(3, "line", 5)
            .hasContentInCell(9, ".61")
            .hasColor(2, 0, "rgb(241, 134, 0)")
            .hasColor(3, 0, "rgb(181, 60, 51)");
    });

    it(`Should render Dashboard Repeater`, { tags: ["checklist_integrated_tiger_releng"] }, () => {
        Navigation.visit("visualizations/repeater/repeater-dashboard");
        const repeater = new Repeater();
        repeater
            .hasHeaderCellsAmount(5)
            .hasHeaderLabel(["Product", "Product", "Amount [BOP]", "Avg. Amount", "Probability"])
            .hasRowHeight("85px")
            .hasVerticalAlign(1, "middle")
            .hasTextWrapping(1, "wrap")
            .hasImageSize(0, "fill")
            .hasContentInCell(1, "(empty value)")
            .isHyperlinkInCell(6, "Show more when clicking")
            .isImageInCell(10)
            .hasChartInCell(2, "column", 2)
            .hasChartInCell(3, "line", 5)
            .hasContentInCell(9, ".61")
            .hasColor(2, 0, "rgb(241, 134, 0)")
            .hasColor(3, 0, "rgb(181, 60, 51)");
    });

    it(`Should render Repeater doesn't have any metric`, () => {
        Navigation.visit("visualizations/repeater/repeater-no-metric");
        const repeater = new Repeater();
        repeater.hasHeaderCellsAmount(1).hasHeaderLabel(["Product Image"]);
    });

    it(`Should show error when Repeater has no Column`, () => {
        Navigation.visit("visualizations/repeater/repeater-no-column");
        const repeater = new Repeater();
        repeater.shouldShowErorrMessage(
            "Sorry, we can't display this visualizationContact your administrator.",
        );
    });
});
