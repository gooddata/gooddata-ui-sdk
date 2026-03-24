// (C) 2023-2026 GoodData Corporation

import { expect, test } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/e2e-utils";

import { API_TOKEN, describe } from "../config.js";
import {
    assertSaveButtonEnabled,
    enterEditMode,
    expectChartDataLabels,
    focusWidget,
    mockFeatureHub,
    saveDashboard,
    visit,
    waitChartLoaded,
    waitForCatalogReload,
    widgetSelector,
} from "../helpers.js";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
    await mockFeatureHub(page);
});

describe("Insights on dashboard", "insightOnDashboard", () => {
    test(
        "should disable save button if having no change",
        { tag: ["@pre-merge-isolated"] },
        async ({ page }) => {
            await visit(page, "dashboard/insight");
            await enterEditMode(page);

            await waitChartLoaded(page, ".s-dash-item-0_0");
            await assertSaveButtonEnabled(page, false);
        },
    );

    test("has insight placeholder title", { tag: ["@pre-merge-isolated"] }, async ({ page }) => {
        await visit(page, "dashboard/insight");
        await enterEditMode(page);

        const widgetEl = page.locator(".s-dash-item-0_0");
        await waitChartLoaded(page, ".s-dash-item-0_0");

        const headline = widgetEl.locator(".s-headline");
        const titleText = await headline.textContent();

        await headline.click();
        const textarea = headline.locator("textarea");
        await expect(textarea).toHaveAttribute("placeholder", titleText!);
    });

    test("shows a message if there is no data match", { tag: ["@pre-merge-isolated"] }, async ({ page }) => {
        await visit(page, "dashboard/insight");
        await enterEditMode(page);

        await waitForCatalogReload(page);
        const searchInput = page.locator(".gd-visualizations-list .gd-input-field");
        await searchInput.fill('<a href="http://www.w3schools.com">Go!</a>');
        await waitForCatalogReload(page);

        await expect(
            page.locator(".gd-visualizations-list .s-visualization-list-no-data-message"),
        ).toContainText("No visualization matched.");

        await searchInput.clear();
        await waitForCatalogReload(page);
    });

    test(
        "Should show no data message if insight has no data",
        { tag: ["@pre-merge-isolated"] },
        async ({ page }) => {
            await visit(page, "dashboard/insight");
            await enterEditMode(page);

            // Open date filter
            const dateFilterButton = page.locator(".s-date-filter-button.s-date-filter-button-date_range");
            await dateFilterButton.click();

            // Select "this-week" relative preset and apply
            const dateFilterBody = page.locator(".s-extended-date-filters-body");
            const preset = dateFilterBody.locator(".s-relative-preset-this-week");
            await preset.scrollIntoViewIfNeeded();
            await preset.click();
            await dateFilterBody.locator(".s-date-filter-apply").click();

            // Wait for chart to finish loading and assert no data message
            const widget = page.locator(".s-dash-item-0_0");
            await expect(widget.locator(".s-loading")).toBeHidden();
            await expect(widget).toContainText("No data for your filter selection");
        },
    );

    test("(SEPARATE) can rename an existing insight", { tag: ["@pre-merge-isolated"] }, async ({ page }) => {
        await visit(page, "dashboard/insight");
        await enterEditMode(page);

        const widgetEl = page.locator(".s-dash-item-0_0");
        await waitChartLoaded(page, ".s-dash-item-0_0");

        const widgetNames = ["Renamed-Test-Insight", "新年快樂", "<button>hello</button>"];

        for (const name of widgetNames) {
            const headline = widgetEl.locator(".s-headline");
            await headline.click();
            const textarea = headline.locator("textarea");
            await textarea.fill(name);
            await textarea.press("Enter");
            await expect(headline).toHaveText(name);
        }

        await saveDashboard(page);
        await waitChartLoaded(page, ".s-dash-item-0_0");
        await expect(widgetEl.locator(".s-headline")).toHaveText("<button>hello</button>");
    });

    test.describe("Date filtering on insight", () => {
        test.beforeEach(async ({ page }) => {
            await visit(page, "dashboard/dashboard-date-filtering-on-insight-scenario");
            await enterEditMode(page);
        });

        test(
            "remember last setting after selecting another insight",
            { tag: ["@pre-merge-integrated"] },
            async ({ page }) => {
                const DATASET_CREATED = "Created";
                const widget0 = widgetSelector(0, 0);
                const widget1 = widgetSelector(0, 1);
                const configBubble = page.locator(".s-gd-configuration-bubble");

                // Wait for chart loaded on first widget
                await waitChartLoaded(page, widget0);

                // Open widget 0 config bubble
                await page.locator(widget0).click();
                await expect(configBubble).toBeVisible();

                // Open Configuration tab
                await configBubble.getByText("Configuration").click();
                await expect(configBubble.locator(".s-viz-filters-headline")).toBeVisible();

                // Select "Created" date dataset
                const dateDatasetBtn = configBubble.locator(".s-date-dataset-button");
                await expect(dateDatasetBtn).not.toContainText("Loading");
                await dateDatasetBtn.scrollIntoViewIfNeeded();
                await dateDatasetBtn.click();
                await page
                    .locator(".configuration-dropdown.dataSets-list .gd-list-item")
                    .filter({ hasText: DATASET_CREATED })
                    .click();

                // Assert second widget title and focus it
                await expect(page.locator(`${widget1} .s-headline`)).toHaveText(
                    "Column with two measures by date",
                );
                await focusWidget(page, 0, 1);

                // Open second widget config bubble
                await page.locator(widget1).click();
                await expect(configBubble).toBeVisible();

                // Focus back to first widget
                await focusWidget(page, 0, 0);

                // Re-open first widget config bubble
                await page.locator(widget0).click();
                await expect(configBubble).toBeVisible();

                // Open Configuration tab again
                await configBubble.getByText("Configuration").click();
                await expect(configBubble.locator(".s-viz-filters-headline")).toBeVisible();

                // Verify "Created" dataset is still selected
                const dateDatasetBtn2 = configBubble.locator(".s-date-dataset-button");
                await expect(dateDatasetBtn2).not.toContainText("Loading");
                await dateDatasetBtn2.scrollIntoViewIfNeeded();
                await dateDatasetBtn2.click();
                await expect(
                    page
                        .locator(".configuration-dropdown.dataSets-list .gd-list-item")
                        .filter({ hasText: DATASET_CREATED }),
                ).toHaveClass(/is-selected/);
            },
        );

        test("change filter on added insight", { tag: ["@pre-merge-integrated"] }, async ({ page }) => {
            const DATASET_CREATED = "Created";
            const widget0 = widgetSelector(0, 0);
            const configBubble = page.locator(".s-gd-configuration-bubble");

            // Wait for chart loaded on first widget
            await waitChartLoaded(page, widget0);

            // Open widget 0 config bubble
            await page.locator(widget0).click();
            await expect(configBubble).toBeVisible();

            // Open Configuration tab
            await configBubble.getByText("Configuration").click();
            await expect(configBubble.locator(".s-viz-filters-headline")).toBeVisible();

            // Select "Created" date dataset
            const dateDatasetBtn = configBubble.locator(".s-date-dataset-button");
            await expect(dateDatasetBtn).not.toContainText("Loading");
            await dateDatasetBtn.scrollIntoViewIfNeeded();
            await dateDatasetBtn.click();
            await page
                .locator(".configuration-dropdown.dataSets-list .gd-list-item")
                .filter({ hasText: DATASET_CREATED })
                .click();

            // Wait for chart to reload and verify data labels
            await waitChartLoaded(page, widget0);
            await expectChartDataLabels(page, widget0, ["$4,108,360.80", "$2,267,528.48", "$3,461,373.87"]);
        });
    });
});
