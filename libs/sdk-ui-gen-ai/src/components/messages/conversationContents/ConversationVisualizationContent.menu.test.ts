// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IWhatIfRenderableScenario } from "../../../whatIf/whatIfMapping.js";

import { getVisibleVisualisationMenuItemIds } from "./ConversationVisualizationContent.js";

describe("getVisibleVisualisationMenuItemIds", () => {
    const baselineScenario = { isBaseline: true } as IWhatIfRenderableScenario;
    const nonBaselineScenario = { isBaseline: false } as IWhatIfRenderableScenario;

    it("should fallback to default menu items", () => {
        expect(
            getVisibleVisualisationMenuItemIds({
                scenario: baselineScenario,
                isVisualisationSaved: true,
            }),
        ).toEqual(["button-save", "button-open", "button-copy"]);
    });

    it("should include save, open and copy for saved baseline visualizations", () => {
        expect(
            getVisibleVisualisationMenuItemIds({
                scenario: baselineScenario,
                isVisualisationSaved: true,
                menuItems: {
                    save: true,
                    openInAnalyze: true,
                    copyLink: true,
                },
            }),
        ).toEqual(["button-save", "button-open", "button-copy"]);
    });

    it("should not include copy for unsaved visualizations", () => {
        expect(
            getVisibleVisualisationMenuItemIds({
                scenario: baselineScenario,
                isVisualisationSaved: false,
                menuItems: {
                    save: true,
                    openInAnalyze: true,
                    copyLink: true,
                },
            }),
        ).toEqual(["button-save", "button-open"]);
    });

    it("should respect disabled menu items", () => {
        expect(
            getVisibleVisualisationMenuItemIds({
                scenario: baselineScenario,
                isVisualisationSaved: true,
                menuItems: {
                    save: false,
                    openInAnalyze: true,
                    copyLink: false,
                },
            }),
        ).toEqual(["button-open"]);
    });

    it("should hide the menu when all menu items are disabled", () => {
        expect(
            getVisibleVisualisationMenuItemIds({
                scenario: baselineScenario,
                isVisualisationSaved: true,
                menuItems: {
                    save: false,
                    openInAnalyze: false,
                    copyLink: false,
                },
            }),
        ).toEqual([]);
    });

    it("should hide the menu for non-baseline scenarios", () => {
        expect(
            getVisibleVisualisationMenuItemIds({
                scenario: nonBaselineScenario,
                isVisualisationSaved: true,
                menuItems: {
                    save: true,
                    openInAnalyze: true,
                    copyLink: true,
                },
            }),
        ).toEqual([]);
    });
});
