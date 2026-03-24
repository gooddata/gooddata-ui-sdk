// (C) 2026 GoodData Corporation

import { readFileSync } from "fs";

import { type APIRequestContext, type Download, type Locator, type Page, expect } from "@playwright/test";
import { camelCase } from "lodash-es";

// FeatureHub mock payload — mirrors cypress/support/featureHub.ts
const FEATURE_HUB_RESPONSE = [
    {
        id: "d2f33050-c46b-491e-82a1-17daba57a0a8",
        features: [
            {
                id: "d154cf37-9ffe-4cae-b892-017ff3429a8f",
                key: "enableNewPivotTable",
                l: false,
                version: 42,
                type: "BOOLEAN",
                value: true,
                strategies: [],
            },
            {
                id: "d154cf37-9ffe-4cae-b892-017ff3429a7c",
                key: "dashboardEditModeDevRollout",
                l: false,
                version: 42,
                type: "BOOLEAN",
                value: true,
                strategies: [],
            },
            {
                id: "d154cf37-9ffe-4cae-b892-123678340327",
                key: "enableWidgetIdentifiersRollout",
                l: false,
                version: 42,
                type: "BOOLEAN",
                value: true,
                strategies: [],
            },
            {
                id: "3d6febf7-430f-44df-a537-2436e2e07520",
                key: "enableDateFilterIdentifiersRollout",
                l: false,
                type: "BOOLEAN",
                value: true,
                version: 2,
            },
            {
                id: "64b7b92c-6721-461d-a8fb-52664f6ef219",
                key: "enableNewExecutorFlow",
                l: false,
                version: 4,
                type: "BOOLEAN",
                value: true,
            },
            {
                id: "e5f9bdd6-4f89-46be-84af-37f59548b33b",
                key: "enableExecutionCancelling",
                l: false,
                version: 2,
                type: "BOOLEAN",
                value: true,
                v: "0d2K",
            },
            {
                id: "78538cca-c3db-43a3-ac43-eb385b1ebea8",
                key: "enableEmptyDateValuesFilter",
                l: false,
                version: 13,
                type: "BOOLEAN",
                value: true,
                v: "NsVT",
            },
        ],
    },
];

/**
 * Mock the FeatureHub endpoint to remove external dependency.
 * If needed, call after injectAuthHeader in file-level beforeEach.
 */
export async function mockFeatureHub(page: Page): Promise<void> {
    await page.route("**/features*", (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(FEATURE_HUB_RESPONSE),
        }),
    );
}

/**
 * Navigate to a scenario page, optionally injecting workspace settings.
 */
export async function visit(
    page: Page,
    scenarioName: string,
    workspaceSettings?: Record<string, unknown>,
): Promise<void> {
    const url = `/gooddata-ui-sdk?scenario=${scenarioName}`;

    await page.addInitScript((settings) => {
        const win = window as unknown as Record<string, unknown>;
        win["useSafeWidgetLocalIdentifiersForE2e"] = true;
        if (settings) {
            win["customWorkspaceSettings"] = settings;
        }
    }, workspaceSettings);

    await page.goto(url);
}

/**
 * Enter edit mode on a dashboard: click the edit button, wait for edit mode UI.
 */
export async function enterEditMode(page: Page): Promise<void> {
    const editButton = page.locator(".dash-control-buttons .s-edit_button");
    await expect(editButton).not.toHaveClass(/disabled/);
    await editButton.click();
    await expect(editButton).toBeHidden();
    // Wait for the insight catalog to finish loading
    await expect(page.locator(".gd-visualizations-list .s-isLoading")).toBeHidden();
    await expect(page.locator(".gd-visualizations-list .gd-input-field")).toBeVisible();
}

/**
 * Wait until all elements matching `selector` are hidden (or removed from the DOM).
 */
export async function waitAllHidden(parent: Page | Locator, selector: string): Promise<void> {
    await expect(parent.locator(selector)).toHaveCount(0);
}

/**
 * Wait until the dashboard is fully loaded.
 */
export async function waitDashboardLoaded(page: Page): Promise<void> {
    await expect(page.locator(".catalog-is-loaded .dash-section")).toBeVisible();
    await expect(page.locator(".s-loading-spinner")).toBeHidden();
    await waitAllHidden(page, ".s-loading");
}

/**
 * Wait until a pivot table inside `parentSelector` is fully loaded.
 */
export async function waitTableLoaded(page: Page, parentSelector: string): Promise<void> {
    await waitAllHidden(page, ".s-loading");
    const table = page.locator(`${parentSelector} .gd-pivot-table-next`);
    await expect(table.locator(".ag-center-cols-viewport .ag-row").first()).toBeVisible();
}

/**
 * Assert that a pivot table column contains the expected text values.
 */
export async function assertTableColumnValues(
    page: Page,
    parentSelector: string,
    columnIndex: number,
    expected: string[],
): Promise<void> {
    const colAria = columnIndex + 1;
    const cells = page.locator(
        `${parentSelector} .gd-pivot-table-next .ag-center-cols-viewport ` +
            `[role="gridcell"][aria-colindex="${colAria}"].ag-cell-value`,
    );
    await expect(cells).toHaveText(expected);
}

/**
 * Assert that the pivot table inside `parentSelector` does not exist (no data).
 */
export async function assertTableEmpty(page: Page, parentSelector: string): Promise<void> {
    await expect(page.locator(`${parentSelector} .gd-pivot-table-next`)).toHaveCount(0);
}

/**
 * Resize a column header in a pivot table using mouse drag.
 */
export async function resizeColumn(
    page: Page,
    parentSelector: string,
    groupIndex: number,
    columnIndex: number,
    offsetX: number,
    isColumn: boolean,
): Promise<void> {
    const table = page.locator(`${parentSelector} .gd-pivot-table-next`);
    const headerRows = table.locator('.ag-header-row[role="row"]');
    const targetRow = isColumn ? headerRows.last() : headerRows.nth(groupIndex);
    const ariaColIndex = columnIndex + 1;
    const resizeHandle = targetRow
        .locator(`[role="columnheader"][aria-colindex="${ariaColIndex}"]`)
        .locator(".ag-header-cell-resize");

    const box = await resizeHandle.boundingBox();
    if (!box) {
        throw new Error("Could not find resize handle bounding box");
    }

    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + offsetX, startY);
    await page.mouse.up();
}

/**
 * Wait until a Highcharts-based chart inside `parentSelector` is fully loaded and computed.
 * Use for dashboard widgets that wrap charts in `.gd-visualization-content`.
 */
export async function waitChartLoaded(page: Page, parentSelector: string): Promise<void> {
    const parent = page.locator(parentSelector);
    // Wait for visualization content container to appear first (Cypress find() does this implicitly)
    await expect(parent.locator(".gd-visualization-content").first()).toBeAttached();
    await expect(parent.locator(".gd-visualization-content .s-loading")).toBeHidden();
    await expect(page.locator(".adi-computing-inner")).toBeHidden();
}

/**
 * Wait until a standalone chart finishes loading.
 * Matches Cypress `Chart.waitLoaded()` — use for non-dashboard chart components.
 */
export async function waitStandaloneChartLoaded(page: Page, parentSelector: string): Promise<void> {
    await expect(page.locator(`${parentSelector} .s-loading`)).toHaveCount(0);
}

/**
 * Wait until a standalone visualization component finishes computing.
 * Matches Cypress `Chart.waitComputed()` — use for non-dashboard chart components.
 */
export async function waitChartComputed(page: Page, parentSelector: string): Promise<void> {
    await expect(page.locator(".adi-computing-inner")).toBeHidden();
    await expect(page.locator(`${parentSelector} .visualization-container-measure-wrap`)).toBeVisible();
}

/**
 * Visit a dashboard scenario, then "Save as new" to create a copy.
 */
export async function visitCopyOf(page: Page, scenarioName: string): Promise<void> {
    await visit(page, scenarioName);

    // Open the header options menu and click "Save as new"
    const menuButton = page.locator(".s-header-options-button");
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    await page.locator(".gd-header-menu-overlay .gd-list-item").filter({ hasText: "Save as new" }).click();

    // Confirm the "Save as new" dialog
    await page.locator(".s-create_dashboard").click();
}

/**
 * Build a test-class CSS selector from a human-readable title.
 */
export function simplifyText(text: string): string {
    return text.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
}

export function getTestClassByTitle(title: string, prefix = ""): string {
    return `.s-${prefix}${simplifyText(title)}`;
}

/**
 * Return the CSS selector for a dashboard widget by section and index.
 */
export function widgetSelector(section: number, index: number): string {
    return `.s-dash-item-${section}_${index}`;
}

/**
 * Focus (select) a widget by clicking its selectable overlay.
 */
export async function focusWidget(page: Page, section: number, index: number): Promise<void> {
    await page.locator(`${widgetSelector(section, index)} .is-selectable`).click();
}

/**
 * Open the Interactions tab in the widget configuration bubble.
 */
export async function openInteractions(page: Page): Promise<void> {
    const configBubble = page.locator(".s-gd-configuration-bubble");
    await configBubble.getByText("Interactions").click();
    await expect(configBubble.locator(".s-drill-config-panel")).toBeVisible();
}

/**
 * Remove a drill config item by its display name.
 */
export async function removeDrillConfigItem(page: Page, itemName: string): Promise<void> {
    const selector = getTestClassByTitle(itemName, "drill-config-item-");
    const item = page.locator(selector);
    await expect(item.getByText("Loading…")).toBeHidden();
    await item.locator(".s-drill-config-item-delete").click();
}

/**
 * Save the dashboard and wait for the edit button to become enabled again.
 */
export async function saveDashboard(page: Page): Promise<void> {
    await page.locator(".dash-control-buttons .s-save_button").click();
    await expect(page.locator(".s-edit_button")).not.toHaveClass(/disabled/);
}

/**
 * Assert whether drill config interaction items exist in the configuration bubble.
 */
export async function assertHasInteractionItems(page: Page, expected: boolean): Promise<void> {
    const configBubble = page.locator(".s-gd-configuration-bubble");
    if (expected) {
        await expect(configBubble.locator(".s-drill-config-item").first()).toBeVisible();
    } else {
        await expect(configBubble.locator(".s-drill-config-item")).toBeHidden();
    }
}

/**
 * Assert that a widget shows the "No data for your filter selection" message.
 */
export async function assertWidgetNoDataForFilter(page: Page, widgetSelector: string): Promise<void> {
    await expect(page.locator(widgetSelector).getByText("No data for your filter selection")).toBeVisible();
}

/**
 * Assert whether the dashboard save button is enabled or disabled.
 */
export async function assertSaveButtonEnabled(page: Page, enabled: boolean): Promise<void> {
    const saveButton = page.locator(".s-save_button");
    if (enabled) {
        await expect(saveButton).not.toHaveClass(/disabled/);
    } else {
        await expect(saveButton).toHaveClass(/disabled/);
    }
}

/**
 * Click a Highcharts series point inside a widget.
 * Uses force because Highcharts renders invisible tracker overlays on top of visual series.
 */
export async function clickChartSeriesPoint(
    page: Page,
    parentSelector: string,
    seriesIndex: number,
    pointIndex = 0,
): Promise<void> {
    const point = page
        .locator(`${parentSelector} .highcharts-container`)
        .locator(`.highcharts-series.highcharts-series-${seriesIndex} .highcharts-point`)
        .nth(pointIndex);
    await point.dispatchEvent("mouseover");
    await point.click({ force: true });
}

/**
 * Select cross-filtering from the drill modal picker dropdown.
 */
export async function selectCrossFiltering(page: Page): Promise<void> {
    const crossFilterOption = page.locator(".gd-drill-modal-picker-dropdown .s-cross-filtering");
    await expect(crossFilterOption).toBeVisible();
    await crossFilterOption.click();
}

/**
 * Scroll the pivot table's center viewport to a named position.
 */
export async function scrollTableTo(
    page: Page,
    parentSelector: string,
    position: "center" | "left" | "right",
): Promise<void> {
    const viewport = page.locator(`${parentSelector} .gd-pivot-table-next .ag-center-cols-viewport`);
    const scrollWidth = await viewport.evaluate((el) => el.scrollWidth);
    const clientWidth = await viewport.evaluate((el) => el.clientWidth);
    let scrollLeft: number;
    switch (position) {
        case "left":
            scrollLeft = 0;
            break;
        case "right":
            scrollLeft = scrollWidth - clientWidth;
            break;
        case "center":
        default:
            scrollLeft = (scrollWidth - clientWidth) / 2;
            break;
    }
    await viewport.evaluate((el, left) => {
        el.scrollLeft = left;
    }, scrollLeft);
}

/**
 * Assert a pivot table cell has the expected text value.
 */
export async function expectTableCellValue(
    page: Page,
    parentSelector: string,
    row: number,
    column: number,
    value: string,
): Promise<void> {
    const colAria = column + 1;
    const table = page.locator(`${parentSelector} [data-testid='pivot-table-next']`);
    const cell = table.locator(
        `[row-index="${row}"] [aria-colindex="${colAria}"] [data-testid*="pivot-cell"]`,
    );
    await expect(cell).toHaveText(value);
}

/**
 * Assert the chart data labels inside a widget match the expected values.
 */
export async function expectChartDataLabels(
    page: Page,
    parentSelector: string,
    labels: string[],
): Promise<void> {
    const dataLabels = page.locator(`${parentSelector} .highcharts-container .highcharts-data-label text`);
    await expect(dataLabels).toHaveText(labels);
}

/**
 * Assert a Highcharts series point has a specific CSS class.
 */
export async function expectSeriesPointHasClass(
    page: Page,
    parentSelector: string,
    className: string,
    seriesIndex: number,
    pointIndex = 0,
): Promise<void> {
    const point = page
        .locator(`${parentSelector} .highcharts-container`)
        .locator(`.highcharts-series.highcharts-series-${seriesIndex} .highcharts-point`)
        .nth(pointIndex);
    await expect(point).toHaveClass(new RegExp(className));
}

/**
 * Assert the number of attribute filters (excluding date filters) on the filter bar.
 */
export async function expectAttributeFilterCount(page: Page, count: number): Promise<void> {
    await expect(page.locator(".dash-filters-attribute:not(.dash-filters-date)")).toHaveCount(count);
}

/**
 * Assert attribute filters have the expected names and subtitle values.
 */
export async function expectAttributeFiltersWithValue(
    page: Page,
    filters: ReadonlyArray<[string, string]>,
): Promise<void> {
    const titles = page.locator(".dash-filters-visible .s-attribute-filter-button-title");
    await expect(titles).toHaveCount(filters.length);

    for (const [name, subtitle] of filters) {
        const testClass = getTestClassByTitle(name);
        await expect(
            page.locator(
                `.dash-filters-attribute ${testClass}.s-attribute-filter .s-attribute-filter-button-subtitle`,
            ),
        ).toHaveText(subtitle);
    }
}

/**
 * Assert that an attribute filter element has finished loading.
 */
export async function expectAttributeFilterLoaded(page: Page, name: string): Promise<void> {
    const testClass = getTestClassByTitle(name);
    await expect(page.locator(`.dash-filters-attribute ${testClass}`)).toHaveClass(/gd-is-loaded/);
}

/**
 * Wait for the insight catalog to finish any loading spinner.
 */
export async function waitForCatalogReload(page: Page): Promise<void> {
    await expect(page.locator(".gd-visualizations-list .s-isLoading")).toBeHidden();
}

/**
 * Assert the dashboard is currently in edit mode (save button exists).
 */
export async function assertInEditMode(page: Page): Promise<void> {
    await expect(page.locator(".s-save_button")).toBeVisible();
}

/**
 * Toggle the dashboard header options menu.
 */
export async function toggleDashboardMenu(page: Page): Promise<void> {
    const menuButton = page.locator(".s-header-options-button");
    await expect(menuButton).toBeVisible();
    await menuButton.click();
}

/**
 * Assert that a specific option is visible in the dashboard header menu overlay.
 */
export async function assertMenuHasOption(page: Page, optionLabel: string): Promise<void> {
    await expect(
        page.locator(".gd-header-menu-overlay .gd-list-item").filter({ hasText: optionLabel }),
    ).toBeVisible();
}

/**
 * Save the current dashboard as a new copy with the given name.
 */
export async function saveAsNew(page: Page, dashboardName: string): Promise<void> {
    await page.locator(".s-save_as_new").click();
    await expect(page.locator(".save-as-new-dialog")).toBeVisible();
    await page.locator(".dashboard-title input").fill(dashboardName);
    await page.locator(".s-create_dashboard").click();
}

/**
 * Convert a CamelCase insight title to space-separated words.
 * e.g. "ComboChart" → "Combo chart"
 */
function splitCamelCaseToWords(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\s./g, (match) => match.toLowerCase());
}

/**
 * Get the CSS selector for an insight in the catalog from its CamelCase title.
 * e.g. "ComboChart" → ".s-combo_chart"
 */
function getInsightSelectorFromTitle(insightTitle: string): string {
    const reconstructed = insightTitle.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`).slice(1);
    return `.s-${reconstructed}`;
}

/**
 * Perform an HTML5 drag-and-drop using real mouse events.
 * Uses Playwright mouse actions so the browser fires real, trusted DnD events
 * that react-dnd's HTML5 backend can process.
 * Drags from sourceSelector's parentElement to targetSelector.
 */
async function htmlDragAndDropFromParent(
    page: Page,
    sourceSelector: string,
    targetSelector: string,
): Promise<void> {
    // Wait for source element and get its parent's bounding box
    await page.locator(sourceSelector).waitFor({ state: "attached" });
    const sourceBBox = await page.evaluate((src) => {
        const child = document.querySelector(src);
        const parent = child?.parentElement;
        if (!parent) throw new Error(`DnD source parent not found: ${src}`);
        const rect = parent.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    }, sourceSelector);

    const srcX = sourceBBox.x + sourceBBox.width / 2;
    const srcY = sourceBBox.y + sourceBBox.height / 2;

    // Initiate drag: hover, press, then small movement to trigger native dragstart
    await page.mouse.move(srcX, srcY);
    await page.mouse.down();
    await page.mouse.move(srcX + 10, srcY + 10, { steps: 3 });

    // Wait for target to appear (drop zones render during active drag)
    await page.locator(targetSelector).waitFor({ state: "visible" });

    // Move to target center and release to trigger drop
    const targetBBox = await page.locator(targetSelector).boundingBox();
    if (!targetBBox) throw new Error(`DnD target not visible: ${targetSelector}`);
    const tgtX = targetBBox.x + targetBBox.width / 2;
    const tgtY = targetBBox.y + targetBBox.height / 2;
    await page.mouse.move(tgtX, tgtY, { steps: 5 });
    await page.mouse.up();
}

/**
 * Search for an insight in the catalog by its CamelCase title.
 */
async function searchInsightInCatalog(page: Page, insightTitle: string): Promise<void> {
    const searchInput = page.locator(".gd-visualizations-list .gd-input-field");
    await searchInput.clear();
    await waitForCatalogReload(page);
    await searchInput.pressSequentially(splitCamelCaseToWords(insightTitle));
    await waitForCatalogReload(page);
}

/**
 * Clear the insight catalog search field.
 */
async function clearCatalogSearch(page: Page): Promise<void> {
    const searchInput = page.locator(".gd-visualizations-list .gd-input-field");
    await searchInput.clear();
    await waitForCatalogReload(page);
}

/**
 * Search for an insight in the catalog and drag it above a dashboard row
 * to create a new section.
 */
export async function addInsightAboveRow(page: Page, insightTitle: string, rowIndex: number): Promise<void> {
    await searchInsightInCatalog(page, insightTitle);
    const insightSelector = `.gd-visualizations-list ${getInsightSelectorFromTitle(insightTitle)}`;
    const targetSelector = `.gd-grid-layout__section:nth-child(${rowIndex + 1}) .row-hotspot`;
    await htmlDragAndDropFromParent(page, insightSelector, targetSelector);
    await clearCatalogSearch(page);
}

/**
 * Search for an insight in the catalog and drop it before or after a widget
 * in the same row.
 */
export async function addInsightAtWidget(
    page: Page,
    insightTitle: string,
    widgetIndex: number,
    position: "prev" | "next",
): Promise<void> {
    await searchInsightInCatalog(page, insightTitle);
    const insightSelector = `.gd-visualizations-list ${getInsightSelectorFromTitle(insightTitle)}`;
    const dropzoneSelector = `.s-dropzone-${position}`;

    await page.locator(insightSelector).waitFor({ state: "attached" });
    await page.evaluate(
        async ({ src, dropzone, idx }) => {
            const sourceChild = document.querySelector(src);
            const source = sourceChild?.parentElement;
            if (!source) throw new Error(`DnD source parent not found: ${src}`);
            const dt = new DataTransfer();
            source.dispatchEvent(new DragEvent("dragstart", { dataTransfer: dt, bubbles: true }));
            await new Promise((resolve) => setTimeout(resolve, 300));
            const targets = document.querySelectorAll(dropzone);
            const target = targets[idx];
            if (!target) throw new Error(`DnD target not found: ${dropzone} at index ${idx}`);
            target.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true }));
            source.dispatchEvent(new DragEvent("dragend", { dataTransfer: dt, bubbles: true }));
        },
        { src: insightSelector, dropzone: dropzoneSelector, idx: widgetIndex },
    );
    await clearCatalogSearch(page);
}

/**
 * Search for an insight in the catalog and drop it at the last drop position
 * on the dashboard, creating a new section at the end.
 */
export async function addInsightLast(page: Page, insightTitle: string): Promise<void> {
    await searchInsightInCatalog(page, insightTitle);
    const insightSelector = `.gd-visualizations-list ${getInsightSelectorFromTitle(insightTitle)}`;
    const targetSelector = `.s-last-drop-position`;
    await htmlDragAndDropFromParent(page, insightSelector, targetSelector);
    await clearCatalogSearch(page);
}

/**
 * Initiate a drag from a catalog insight to a row hotspot without dropping.
 * Dispatches dragstart + dragenter so the UI shows drop-zone feedback.
 */
export async function dragInsightAboveRow(page: Page, insightTitle: string, rowIndex: number): Promise<void> {
    await searchInsightInCatalog(page, insightTitle);
    const insightSelector = `.gd-visualizations-list ${getInsightSelectorFromTitle(insightTitle)}`;
    const targetSelector = `.gd-grid-layout__section:nth-child(${rowIndex + 1}) .row-hotspot`;
    await page.locator(insightSelector).waitFor({ state: "attached" });
    await page.evaluate(
        async ({ src, tgt }) => {
            const sourceChild = document.querySelector(src);
            const source = sourceChild?.parentElement;
            if (!source) throw new Error(`DnD source parent not found: ${src}`);
            const dt = new DataTransfer();
            source.dispatchEvent(new DragEvent("dragstart", { dataTransfer: dt, bubbles: true }));
            await new Promise((resolve) => setTimeout(resolve, 300));
            const target = document.querySelector(tgt);
            if (!target) throw new Error(`DnD target not found: ${tgt}`);
            target.dispatchEvent(new DragEvent("dragenter", { dataTransfer: dt, bubbles: true }));
        },
        { src: insightSelector, tgt: targetSelector },
    );
    await clearCatalogSearch(page);
}

/**
 * Initiate a drag from a catalog insight to a widget dropzone without dropping.
 * Dispatches dragstart + dragenter so the UI shows drop-zone feedback.
 */
export async function dragInsightAtWidget(
    page: Page,
    insightTitle: string,
    widgetIndex: number,
    position: "prev" | "next",
): Promise<void> {
    await searchInsightInCatalog(page, insightTitle);
    const insightSelector = `.gd-visualizations-list ${getInsightSelectorFromTitle(insightTitle)}`;
    const dropzoneSelector = `.s-dropzone-${position}`;
    await page.locator(insightSelector).waitFor({ state: "attached" });
    await page.evaluate(
        async ({ src, dropzone, idx }) => {
            const sourceChild = document.querySelector(src);
            const source = sourceChild?.parentElement;
            if (!source) throw new Error(`DnD source parent not found: ${src}`);
            const dt = new DataTransfer();
            source.dispatchEvent(new DragEvent("dragstart", { dataTransfer: dt, bubbles: true }));
            await new Promise((resolve) => setTimeout(resolve, 300));
            const targets = document.querySelectorAll(dropzone);
            const target = targets[idx];
            if (!target) throw new Error(`DnD target not found: ${dropzone} at index ${idx}`);
            target.dispatchEvent(new DragEvent("dragenter", { dataTransfer: dt, bubbles: true }));
        },
        { src: insightSelector, dropzone: dropzoneSelector, idx: widgetIndex },
    );
    await clearCatalogSearch(page);
}

/**
 * Cancel an in-progress drag by dispatching dragleave on the cancel button.
 */
export async function cancelDrag(page: Page): Promise<void> {
    await page.evaluate(() => {
        const cancelButton = document.querySelector(".s-cancel_button");
        if (!cancelButton) throw new Error("Cancel button not found");
        cancelButton.dispatchEvent(new DragEvent("dragleave", { bubbles: true }));
    });
}

/**
 * Reset all filters on the filter bar to their default values.
 */
export async function resetAllFilters(page: Page): Promise<void> {
    await page.locator(".dash-filters-reset").click();
}

// ── Attribute filter dropdown helpers ───────────────────────────────

export function filterDropdown(page: Page): Locator {
    return page.locator(".overlay.dropdown-body");
}

export async function openAttributeFilter(page: Page, name: string): Promise<void> {
    const testClass = getTestClassByTitle(name);
    const filter = page.locator(`.dash-filters-attribute ${testClass}`);
    await expect(filter).toHaveClass(/gd-is-loaded/);
    await filter.click();
    await expect(filter).toHaveClass(/gd-is-active/);
}

export async function waitFilterElementsLoaded(page: Page): Promise<void> {
    await expect(filterDropdown(page).locator(".s-isLoading")).toHaveCount(0);
}

export async function clearAllFilterValues(page: Page): Promise<void> {
    const dropdown = filterDropdown(page);
    const checkbox = dropdown.locator(".s-select-all-checkbox");
    const state = await checkbox.getAttribute("aria-checked");
    if (state === "false") {
        return;
    }
    if (state === "mixed") {
        // partial → click once to select all, then again to deselect all
        await checkbox.click();
        await waitFilterElementsLoaded(page);
    }
    // "true" or was "mixed" (now "true") → click to deselect all
    await checkbox.click();
    await waitFilterElementsLoaded(page);
}

export async function searchAndSelectFilterItem(page: Page, value: string): Promise<void> {
    const dropdown = filterDropdown(page);
    const searchField = dropdown.locator(".gd-input-search .gd-input-field");
    await searchField.clear();
    await searchField.fill(value);
    await dropdown.locator(`.s-attribute-filter-list-item-${camelCase(value)}`).click();
}

/**
 * Clears all values and directly clicks the item — no search involved.
 * Mirrors Cypress selectAttributesWithoutApply.
 */
export async function selectAttributeWithoutSearch(page: Page, name: string): Promise<void> {
    await clearAllFilterValues(page);
    const dropdown = filterDropdown(page);
    await dropdown.locator(`.s-attribute-filter-list-item-${camelCase(name)}`).click();
}

export async function selectAttributeValues(page: Page, attributes: string[]): Promise<void> {
    await clearAllFilterValues(page);
    for (const attr of attributes) {
        await searchAndSelectFilterItem(page, attr);
    }
}

export async function applyAttributeFilter(page: Page): Promise<void> {
    await filterDropdown(page).locator(".s-apply").click();
}

export async function hasFilterListSize(page: Page, size: number): Promise<void> {
    await expect(filterDropdown(page).locator(".s-list-search-selection-size")).toHaveText(`(${size})`);
}

export async function selectFilterConfiguration(page: Page): Promise<void> {
    await filterDropdown(page).locator(".s-configuration-button").click();
}

export async function configureLimitingParentFilterDependency(
    page: Page,
    parentFilterName: string,
): Promise<void> {
    await selectFilterConfiguration(page);
    await page.locator(".s-add").click();
    await page.locator(".s-add-limit-dashboard_filter").click();
    await page.locator(getTestClassByTitle(parentFilterName, "dashboard-filter-")).click();
    await expect(page.locator(".s-gd-configuration-bubble")).toBeHidden();
    await filterDropdown(page).locator(".s-apply").click();
}

export async function configureLimitingMetricDependency(page: Page, metricName: string): Promise<void> {
    await selectFilterConfiguration(page);
    await page.locator(".s-add").click();
    const popup = page.locator(".attribute-filter__limit__popup");
    await popup.locator(".s-add-limit-metric").click();
    const list = popup.locator(".attribute-filter__limit__popup__list--searchable");
    await list.locator(`.attribute-filter__limit__popup__item[title='${metricName}']`).click();
    await filterDropdown(page).locator(".s-apply").click();
}

export async function searchMetricDependency(page: Page, metricName: string): Promise<void> {
    await page.locator(".s-add").click();
    const popup = page.locator(".attribute-filter__limit__popup");
    await popup.locator(".s-add-limit-metric").click();
    const searchField = popup.locator(
        ".attribute-filter__limit__popup__list--searchable .gd-input-search input",
    );
    await searchField.clear();
    await searchField.fill(metricName);
}

export async function assertNoDataMetricDependency(page: Page): Promise<void> {
    await expect(page.locator(".attribute-filter__limit__popup__no-data")).toBeAttached();
    await page
        .locator(
            "[data-id='s-configuration-panel-header-close-button']," +
                " [data-id='s-submenu-header-close-button']",
        )
        .click();
}

export async function selectMetricDependency(page: Page, metricName: string): Promise<void> {
    const popup = page.locator(".attribute-filter__limit__popup");
    const list = popup.locator(".attribute-filter__limit__popup__list--searchable");
    await list.locator(`.attribute-filter__limit__popup__item[title='${metricName}']`).click();
    await filterDropdown(page).locator(".s-apply").click();
}

export async function closeAttributeFilter(page: Page, name: string): Promise<void> {
    const testClass = getTestClassByTitle(name);
    const filter = page.locator(`.dash-filters-attribute ${testClass}`);
    await filter.click();
    await expect(filter).not.toHaveClass(/gd-is-active/);
}

export async function assertFilterSubtitle(page: Page, name: string, subtitle: string): Promise<void> {
    const testClass = getTestClassByTitle(name);
    await expect(
        page.locator(`.dash-filters-attribute ${testClass} .s-attribute-filter-button-subtitle`),
    ).toHaveText(subtitle);
}

export async function assertSelectedValueList(page: Page, values: string[]): Promise<void> {
    const dropdown = filterDropdown(page);
    if (values.length === 0) {
        await expect(dropdown.locator(".s-isLoading")).toBeHidden();
        await expect(
            dropdown.locator(
                ".s-attribute-filter-list-item.s-attribute-filter-list-item-selected .input-label-text",
            ),
        ).toHaveCount(0);
    } else {
        await expect(
            dropdown.locator(
                ".s-attribute-filter-list-item.s-attribute-filter-list-item-selected .input-label-text",
            ),
        ).toHaveText(values);
    }
}

export async function assertValueList(page: Page, values: string[]): Promise<void> {
    const dropdown = filterDropdown(page);
    if (values.length === 0) {
        await expect(dropdown.locator(".s-isLoading")).toBeHidden();
        await expect(dropdown.locator(".s-attribute-filter-list-item .input-label-text")).toHaveCount(0);
    } else {
        await expect(dropdown.locator(".s-attribute-filter-list-item .input-label-text")).toHaveText(values);
    }
}

export async function assertShowAllElementValuesVisible(page: Page, visible: boolean): Promise<void> {
    const el = filterDropdown(page).locator(".s-attribute-filter-status-show-all");
    if (visible) {
        await expect(el).toBeVisible();
    } else {
        await expect(el).toBeHidden();
    }
}

export async function assertElementsListStatus(page: Page, text: string): Promise<void> {
    await expect(filterDropdown(page).locator(".s-list-status-bar")).toContainText(text);
}

export async function clearFilterSearch(page: Page): Promise<void> {
    const searchField = filterDropdown(page).locator(".gd-input-search .gd-input-field");
    await searchField.clear();
}

export async function showAllElementValues(page: Page): Promise<void> {
    await filterDropdown(page).locator(".s-attribute-filter-status-show-all .s-action-show-all").click();
    await waitFilterElementsLoaded(page);
}

export async function assertIrrelevantElementValuesVisible(page: Page, visible: boolean): Promise<void> {
    const el = filterDropdown(page).locator(".s-attribute-filter-status-irrelevant-message");
    if (visible) {
        await expect(el).toBeVisible();
    } else {
        await expect(el).toBeHidden();
    }
}

export async function assertNoRelevantMessage(page: Page): Promise<void> {
    await expect(filterDropdown(page).locator(".gd-attribute-filter-empty-filtered-result__next")).toHaveText(
        "No relevant values",
    );
}

export async function clearIrrelevantElementValues(page: Page): Promise<void> {
    await filterDropdown(page)
        .locator(".s-attribute-filter-status-irrelevant-message .s-action-clear")
        .click();
    await waitFilterElementsLoaded(page);
}

export type FilterByType = "normal" | "aggregated";

export async function deleteFilterValuesBy(
    page: Page,
    filterName: string,
    filterType: FilterByType = "normal",
): Promise<void> {
    await selectFilterConfiguration(page);
    const titleClass =
        filterType === "normal"
            ? "attribute-filter__limit__item__title"
            : "attribute-filter__limit__item__title--aggregated";
    const titleEl = page.locator(`.${titleClass}[title='${filterName}']`);
    await titleEl.hover();
    await page.locator(`.${titleClass}[title='${filterName}'] + .s-filter-limit-delete`).click();
    await filterDropdown(page).locator(".s-apply").click();
}

// ── Date filter helpers ──────────────────────────────────────────────

/**
 * Open a date filter dropdown by its title.
 */
export async function openDateFilter(page: Page, title = "Date range"): Promise<void> {
    const testClass = getTestClassByTitle(title, "date-filter-button-");
    await page.locator(`.s-date-filter-button${testClass}`).click();
}

/**
 * Click an option inside the open date filter dropdown body.
 */
export async function selectDateFilterOption(page: Page, optionSelector: string): Promise<void> {
    await page.locator(`.s-extended-date-filters-body ${optionSelector}`).click();
}

/**
 * Type a date into the "from" range picker input and press Enter.
 */
export async function typeIntoDateRangeFrom(page: Page, value: string): Promise<void> {
    const input = page.locator(
        ".s-date-range-picker .s-date-range-picker-from .s-date-range-picker-input-field",
    );
    await input.clear();
    await input.fill(value);
    await input.press("Enter");
}

/**
 * Type a date into the "to" range picker input and press Enter.
 */
export async function typeIntoDateRangeTo(page: Page, value: string): Promise<void> {
    const input = page.locator(
        ".s-date-range-picker .s-date-range-picker-to .s-date-range-picker-input-field",
    );
    await input.clear();
    await input.fill(value);
    await input.press("Enter");
}

// ── Attribute filter date dependency helpers ─────────────────────────

/**
 * Configure a limiting date filter dependency. Assumes the configuration panel is already open.
 */
export async function configureLimitingDateFilterDependency(
    page: Page,
    parentFilterName: string,
    dateType: string,
): Promise<void> {
    await page.locator(".s-add").click();
    await page.locator(".s-add-limit-dashboard_filter").click();

    if (dateType === "Date range") {
        await page.locator(getTestClassByTitle(dateType, "dashboard-filter-")).click();
        await page.locator(`.date-filter__limit__popup__item.s-${parentFilterName}`).click();
    } else {
        await page.locator(`.s-dashboard-filter-${parentFilterName}`).click();
    }

    await filterDropdown(page).locator(".s-apply").click();
}

/**
 * Assert whether a specific date filter is enabled or disabled in the add-limit dialog.
 * Opens and closes the add-limit dialog internally.
 */
export async function assertSpecificDateFilterVisible(
    page: Page,
    parentFilterName: string,
    visible: boolean,
): Promise<void> {
    await page.locator(".s-add").click();
    await page.locator(".s-add-limit-dashboard_filter").click();

    const el = page.locator(`.s-dashboard-filter-${parentFilterName}`);
    if (visible) {
        await expect(el).not.toHaveClass(/is-disabled/);
    } else {
        await expect(el).toHaveClass(/is-disabled/);
    }

    await page.locator(".configuration-panel-header-title.clickable").click();
}

/**
 * Assert whether a common (Date range) date filter is enabled or disabled in the add-limit dialog.
 * Opens and closes the add-limit dialog internally.
 */
export async function assertCommonDateFilterVisible(
    page: Page,
    parentFilterName: string,
    visible: boolean,
): Promise<void> {
    await page.locator(".s-add").click();
    await page.locator(".s-add-limit-dashboard_filter").click();
    await page.locator(getTestClassByTitle("Date range", "dashboard-filter-")).click();

    const el = page.locator(`.date-filter__limit__popup__item.s-${parentFilterName}`);
    if (visible) {
        await expect(el).not.toHaveClass(/is-disabled/);
    } else {
        await expect(el).toHaveClass(/is-disabled/);
    }

    await page.locator(".configuration-panel-header-title.clickable").click();
}

/**
 * Close the attribute filter configuration panel without saving (cancel).
 */
export async function closeFilterConfiguration(page: Page): Promise<void> {
    await filterDropdown(page).locator(".s-cancel").click();
}

// ── Headline helpers ────────────────────────────────────────────────

export async function waitHeadlineLoaded(page: Page, selector: string): Promise<void> {
    await expect(page.locator(`${selector} .s-loading`)).toHaveCount(0);
}

export async function assertHeadlineValue(page: Page, selector: string, value: string): Promise<void> {
    await expect(page.locator(`${selector} .s-headline-primary-item .s-headline-value`)).toHaveText(value);
}

export async function assertHeadlineEmpty(page: Page): Promise<void> {
    await expect(page.locator(".visualization-empty")).toBeAttached();
}

/**
 * Wait until all dashboard items have finished loading.
 */
export async function waitItemLoaded(page: Page): Promise<void> {
    await expect(page.locator(".gd-grid-layout__container--root .dash-item.type-loading")).toHaveCount(0);
}

/**
 * Assert a dashboard widget has a specific grid column span width.
 */
export async function assertWidgetWidth(
    page: Page,
    section: number,
    index: number,
    expectedWidth: number,
): Promise<void> {
    const widget = page.locator(`.gd-grid-layout__item:has(${widgetSelector(section, index)})`);
    await expect(widget).toHaveClass(new RegExp(`gd-grid-layout__item--span-${expectedWidth}`));
}

/**
 * Resize a dashboard widget's width by dragging the resizer hotspot
 * to a resize bullet target.
 */
export async function resizeWidgetWidthTo(
    page: Page,
    section: number,
    index: number,
    bulletIndex: number,
): Promise<void> {
    const sel = widgetSelector(section, index);
    await page.evaluate(
        async ({ widgetSel, bullet }) => {
            const widget = document.querySelector(widgetSel);
            if (!widget) throw new Error(`Widget not found: ${widgetSel}`);
            const container = widget.closest(".gd-fluidlayout-column-container");
            if (!container) throw new Error("Container not found");
            const hotspot = container.querySelector(".s-dash-width-resizer-hotspot");
            if (!hotspot) throw new Error("Resizer hotspot not found");

            const hRect = hotspot.getBoundingClientRect();
            const dt = new DataTransfer();

            // Dispatch dragstart with hotspot center coordinates so the DnD monitor
            // records the correct initial client offset.
            hotspot.dispatchEvent(
                new DragEvent("dragstart", {
                    dataTransfer: dt,
                    bubbles: true,
                    clientX: hRect.x + hRect.width / 2,
                    clientY: hRect.y + hRect.height / 2,
                }),
            );

            await new Promise((resolve) => setTimeout(resolve, 300));

            const target = document.querySelector(`.s-resize-bullet-${bullet}`);
            if (!target) throw new Error(`Resize bullet not found: .s-resize-bullet-${bullet}`);
            const tRect = target.getBoundingClientRect();

            // Dispatch drop with bullet center coordinates so the DnD monitor
            // computes the correct offset difference for the resize calculation.
            target.dispatchEvent(
                new DragEvent("drop", {
                    dataTransfer: dt,
                    bubbles: true,
                    clientX: tRect.x + tRect.width / 2,
                    clientY: tRect.y + tRect.height / 2,
                }),
            );

            hotspot.dispatchEvent(new DragEvent("dragend", { dataTransfer: dt, bubbles: true }));
        },
        { widgetSel: sel, bullet: bulletIndex },
    );
}

// ── Drill interaction helpers ───────────────────────────────────────

export type InteractionType = "measure" | "attribute";

/**
 * Add a drill interaction by clicking "Add Interaction" and selecting an item.
 */
export async function addInteraction(page: Page, itemName: string, itemType: InteractionType): Promise<void> {
    const itemSelector = `.s-drill-${itemType}-selector-item`;
    const configBubble = page.locator(".s-gd-configuration-bubble");
    await configBubble.locator(".s-drill-config-panel .s-add_interaction").click();
    await page
        .locator(`.s-drill-item-selector-dropdown ${itemSelector}`)
        .filter({ hasText: itemName })
        .click();
}

/**
 * Choose a drill action type for a drill config item (e.g. "Drill into URL").
 */
export async function chooseDrillAction(page: Page, itemName: string, drillType: string): Promise<void> {
    const selector = getTestClassByTitle(itemName, "drill-config-item-");
    const item = page.locator(selector);
    await expect(item.getByText("Loading…")).toBeHidden();
    await item.locator(".s-drill-config-panel-target-button").click();
    await page.locator(".s-drill-config-panel-target-type-open").getByText(drillType).click();
}

/**
 * Open the custom URL editor for a drill config item.
 */
export async function openCustomUrlEditor(page: Page, itemName: string): Promise<void> {
    const selector = getTestClassByTitle(itemName, "drill-config-item-");
    const item = page.locator(selector);
    await expect(item.getByText("Loading…")).toBeHidden();
    await item.hover();
    await item.locator(".s-drill-to-url-button").click();
    await page.locator(".s-drill-to-custom-url-button").click();
}

/**
 * Assert the custom URL dialog contains an item with the given title.
 */
export async function assertCustomUrlDialogHasItem(page: Page, title: string): Promise<void> {
    const dialog = page.locator(".s-gd-drill-custom-url-editor");
    await expect(dialog.locator(".gd-list-item").filter({ hasText: title }).first()).toBeVisible();
}

/**
 * Close the custom URL dialog via the cancel button.
 */
export async function closeCustomURLDialog(page: Page): Promise<void> {
    await page.locator(".s-dialog-cancel-button").click();
}

/**
 * Close the widget configuration bubble.
 */
export async function closeWidgetConfiguration(page: Page): Promise<void> {
    const configBubble = page.locator(".s-gd-configuration-bubble");
    await configBubble
        .locator(
            "[data-id='s-configuration-panel-header-close-button']," +
                " [data-id='s-submenu-header-close-button']",
        )
        .click();
    await expect(configBubble).toBeHidden();
}

/**
 * Assert the date filters on the filter bar match the expected names in order.
 */
export async function assertDateFilters(page: Page, names: string[]): Promise<void> {
    const dateFilters = page.locator(".dash-filters-date");
    await expect(dateFilters).toHaveCount(names.length);
    for (let i = 0; i < names.length; i++) {
        await expect(page.locator(".dash-filters-date .s-date-filter-title").nth(i)).toHaveText(names[i]);
    }
}

/**
 * Add a new date filter to the filter bar by dragging the "add filter" button,
 * switching to date datasets, searching for the given name, and selecting it.
 */
export async function addDateFilter(page: Page, name: string): Promise<void> {
    const filterSelect = page.locator(".s-attribute_select");
    await expect(filterSelect).toBeHidden();

    // Drag the "add attribute filter" button onto the filter dropzone
    await page.evaluate(async () => {
        const source = document.querySelector(".s-add-attribute-filter");
        if (!source) throw new Error("Add attribute filter button not found");
        const dt = new DataTransfer();
        source.dispatchEvent(new DragEvent("dragstart", { dataTransfer: dt, bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 300));
        const target = document.querySelector(".s-attr-filter-dropzone-box");
        if (!target) throw new Error("Attribute dropzone not found");
        target.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true }));
        source.dispatchEvent(new DragEvent("dragend", { dataTransfer: dt, bubbles: true }));
    });

    await expect(filterSelect).toBeVisible();

    // Switch to date datasets tab
    await page.locator(".s-datedatasets").click();

    // Search for the date dataset and select it (dropdown renders as portal in .overlay.dropdown-body)
    const dropdown = page.locator(".overlay.dropdown-body");
    const searchField = dropdown.locator(".gd-list-searchfield .gd-input-field");
    await searchField.clear();
    await searchField.fill(name);
    await page.locator(`.attributes-list ${getTestClassByTitle(name)}`).click();

    await expect(filterSelect).toBeHidden();
}

/**
 * Add a new attribute filter to the filter bar by dragging the "add filter" button,
 * searching for the given name, and selecting it.
 */
export async function addAttributeFilter(page: Page, name: string): Promise<void> {
    const filterSelect = page.locator(".s-attribute_select");
    await expect(filterSelect).toBeHidden();

    // Drag the "add attribute filter" button onto the filter dropzone
    await page.evaluate(async () => {
        const source = document.querySelector(".s-add-attribute-filter");
        if (!source) throw new Error("Add attribute filter button not found");
        const dt = new DataTransfer();
        source.dispatchEvent(new DragEvent("dragstart", { dataTransfer: dt, bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 300));
        const target = document.querySelector(".s-attr-filter-dropzone-box");
        if (!target) throw new Error("Attribute dropzone not found");
        target.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true }));
        source.dispatchEvent(new DragEvent("dragend", { dataTransfer: dt, bubbles: true }));
    });

    await expect(filterSelect).toBeVisible();

    // Search for the attribute and select it (dropdown renders as portal in .overlay.dropdown-body)
    const dropdown = page.locator(".overlay.dropdown-body");
    const searchField = dropdown.locator(".gd-list-searchfield .gd-input-field");
    await searchField.clear();
    await searchField.fill(name);
    await page.locator(`.attributes-list ${getTestClassByTitle(name)}`).click();

    await expect(filterSelect).toBeHidden();
}

/**
 * Remove an attribute filter from the filter bar by dragging it to the delete dropzone.
 */
export async function removeAttributeFilter(page: Page, name: string): Promise<void> {
    const testClass = getTestClassByTitle(name);
    await page.evaluate(async (selector) => {
        const source = document.querySelector(`.dash-filters-attribute ${selector}`);
        if (!source) throw new Error(`Attribute filter not found: ${selector}`);
        const dt = new DataTransfer();
        source.dispatchEvent(new DragEvent("dragstart", { dataTransfer: dt, bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 300));
        const target = document.querySelector(".gd-dropzone-delete");
        if (!target) throw new Error("Delete dropzone not found");
        target.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true }));
        source.dispatchEvent(new DragEvent("dragend", { dataTransfer: dt, bubbles: true }));
    }, testClass);
}

/**
 * Remove a date filter by dragging it to the delete drop zone.
 */
export async function removeDateFilter(page: Page, index: number): Promise<void> {
    await page.evaluate(async (idx) => {
        const titles = document.querySelectorAll(".s-date-filter-title");
        const source = titles[idx];
        if (!source) throw new Error(`Date filter title at index ${idx} not found`);
        const dt = new DataTransfer();
        source.dispatchEvent(new DragEvent("dragstart", { dataTransfer: dt, bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 200));
        const dropzone = document.querySelector(".gd-dropzone-delete");
        if (!dropzone) throw new Error("Delete dropzone not found");
        dropzone.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true }));
        source.dispatchEvent(new DragEvent("dragend", { dataTransfer: dt, bubbles: true }));
    }, index);
}

/**
 * Cancel edit mode by clicking the cancel button in the top bar.
 */
export async function cancelEditMode(page: Page): Promise<void> {
    await page.locator(".s-top-bar .s-cancel").click();
}

/**
 * Discard unsaved changes by clicking the discard button in the confirmation dialog.
 */
export async function discardChanges(page: Page): Promise<void> {
    await page.locator(".s-discard_changes").click();
}

// ── Warning message helpers ──────────────────────────────────────────

/**
 * Assert whether a warning message exists in the dashboard messages area.
 */
export async function assertWarningMessage(page: Page, exists: boolean): Promise<void> {
    const warning = page.locator(".gd-messages .s-message.warning");
    if (exists) {
        await expect(warning).toBeAttached();
    } else {
        await expect(warning).not.toBeAttached();
    }
}

/**
 * Click "Show more" link in the warning message.
 */
export async function clickWarningShowMore(page: Page): Promise<void> {
    const warning = page.locator(".gd-messages .s-message.warning");
    await warning.locator(".s-message-text-showmorelink").click();
}

/**
 * Assert that the bold text inside the warning message matches the given insight name.
 */
export async function assertInsightNameIsBolder(page: Page, insightName: string): Promise<void> {
    const warning = page.locator(".gd-messages .s-message.warning");
    await expect(warning.locator(".s-message-text-content b")).toHaveText(insightName);
}

// ── Widget editing helpers ──────────────────────────────────────────

/**
 * Set a widget title by clicking the headline element and typing a new title.
 */
export async function setWidgetTitle(page: Page, parentSelector: string, title: string): Promise<void> {
    const headline = page.locator(`${parentSelector} .s-headline`);
    await headline.click();
    const textarea = headline.locator("textarea");
    await textarea.fill(title);
    await textarea.press("Enter");
}

/**
 * Remove a widget from the dashboard using the delete button in the config panel.
 */
export async function removeWidgetFromDashboard(page: Page): Promise<void> {
    await page.locator(".s-delete-insight-item").click();
}

// ── Export helpers ───────────────────────────────────────────────────

/**
 * Parse a downloaded PDF file and assert its text content contains the expected string.
 */
export async function expectPdfContent(pdfBuffer: Buffer, expected: string): Promise<void> {
    const pdfParseModule = (await import("pdf-parse")) as Record<string, unknown>;
    const pdfParse = (pdfParseModule["default"] ?? pdfParseModule) as (
        buf: Buffer,
    ) => Promise<{ text: string }>;
    const data = await pdfParse(pdfBuffer);
    const actual = JSON.stringify(data.text).replace(/\n/g, "");
    const normalised = JSON.stringify(expected).replace(/"/g, "");
    if (!actual.includes(normalised)) {
        throw new Error(`PDF should contain "${normalised}" but text was: ${actual.substring(0, 500)}`);
    }
}

/**
 * Wait for a file download triggered by an export action,
 * then verify the filename and optionally the PDF content.
 */
export async function expectExportedPDF(
    page: Page,
    download: Download,
    expectedFilename: string,
    expectedContent?: string,
): Promise<void> {
    // Verify success message
    await expect(page.locator(".gd-messages .s-message.success")).toContainText("Export successful.");

    // Verify filename
    expect(download.suggestedFilename()).toBe(expectedFilename);

    // Optionally verify PDF content
    if (expectedContent) {
        const filePath = await download.path();
        if (!filePath) throw new Error("Download path is null");
        const pdfBuffer = readFileSync(filePath);
        await expectPdfContent(pdfBuffer, expectedContent);
    }
}

// ── Environment helpers ─────────────────────────────────────────────

export function getWorkspaceId(): string {
    return process.env["TEST_WORKSPACE_ID"] || "";
}

export function getAuthToken(): string {
    return process.env["TIGER_API_TOKEN"] || "";
}

export function generateUUID(length = 10): string {
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const data: string[] = [];
    for (let i = 0; i < length; i++) {
        data.push(possible.charAt(Math.floor(Math.random() * possible.length)));
    }
    return data.join("");
}

// ── Backend API helpers ─────────────────────────────────────────────

export async function setEarlyAccess(
    request: APIRequestContext,
    workspaceId: string,
    value = "develop",
): Promise<void> {
    await request.patch(`/api/v1/entities/workspaces/${workspaceId}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
        data: {
            data: {
                id: workspaceId,
                type: "workspace",
                attributes: { earlyAccess: value },
            },
        },
    });
}

export async function createTestGroup(request: APIRequestContext, id: string): Promise<void> {
    await request.post("/api/v1/entities/userGroups", {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
        data: {
            data: { id, type: "userGroup", attributes: {} },
        },
    });
}

export async function deleteTestGroup(request: APIRequestContext, id: string): Promise<void> {
    await request.delete(`/api/v1/entities/userGroups/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
        failOnStatusCode: false,
    });
}

export async function createTestUser(
    request: APIRequestContext,
    id: string,
    groups: string[],
): Promise<void> {
    await request.post("/api/v1/entities/users", {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
        data: {
            data: {
                id,
                type: "user",
                attributes: { authenticationId: `authId_${id}` },
                relationships: {
                    userGroups: {
                        data: groups.map((g) => ({ id: g, type: "userGroup" })),
                    },
                },
            },
        },
    });
}

export async function deleteTestUser(request: APIRequestContext, id: string): Promise<void> {
    await request.delete(`/api/v1/entities/users/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
        failOnStatusCode: false,
    });
}

export async function assignUserPermissionToWorkspace(
    request: APIRequestContext,
    workspaceId: string,
    permissions: Array<{ user: string; permission: string }>,
): Promise<void> {
    await request.put(`/api/v1/layout/workspaces/${workspaceId}/permissions`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
        data: {
            permissions: permissions.map(({ user, permission }) => ({
                assignee: { id: user, type: "user" },
                name: permission,
            })),
        },
    });
}

export async function assignUserPermissionToDashboard(
    request: APIRequestContext,
    workspaceId: string,
    dashboardId: string,
    userId: string,
    permission: string,
): Promise<void> {
    await request.post(
        `/api/v1/actions/workspaces/${workspaceId}/analyticalDashboards/${dashboardId}/managePermissions`,
        {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
            data: [
                {
                    assigneeIdentifier: { id: userId, type: "user" },
                    permissions: [permission],
                },
            ],
        },
    );
}

export async function assignGroupPermissionToDashboard(
    request: APIRequestContext,
    workspaceId: string,
    dashboardId: string,
    groupId: string,
    permission: string,
): Promise<void> {
    await request.post(
        `/api/v1/actions/workspaces/${workspaceId}/analyticalDashboards/${dashboardId}/managePermissions`,
        {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
            data: [
                {
                    assigneeIdentifier: { id: groupId, type: "userGroup" },
                    permissions: [permission],
                },
            ],
        },
    );
}

/**
 * Assign a rule-based permission (e.g. allWorkspaceUsers) to a dashboard.
 * Matches Cypress `DashboardAccess.assignRulePermissionToDashboard`.
 */
export async function assignRulePermissionToDashboard(
    request: APIRequestContext,
    workspaceId: string,
    dashboardId: string,
    permission?: string,
): Promise<void> {
    await request.post(
        `/api/v1/actions/workspaces/${workspaceId}/analyticalDashboards/${dashboardId}/managePermissions`,
        {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
            data: [
                {
                    assigneeRule: { type: "allWorkspaceUsers" },
                    permissions: permission ? [permission] : [],
                },
            ],
        },
    );
}

/**
 * Switch the page context to act as a specific user by intercepting API
 * requests and injecting the user's bearer token.
 */
export async function switchToUser(page: Page, request: APIRequestContext, userId: string): Promise<void> {
    const response = await request.post(`/api/v1/entities/users/${userId}/apiTokens`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
        data: { data: { id: userId, type: "apiToken", attributes: {} } },
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    const bearerToken = body.data.attributes.bearerToken;

    await page.route("/api/**", (route) => {
        route.continue({
            headers: {
                ...route.request().headers(),
                authorization: `Bearer ${bearerToken}`,
            },
        });
    });
}
