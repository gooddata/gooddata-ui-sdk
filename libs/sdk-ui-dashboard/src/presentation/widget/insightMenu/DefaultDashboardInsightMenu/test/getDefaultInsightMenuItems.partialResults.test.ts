// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { createIntlMock } from "@gooddata/sdk-ui";

import {
    type IInsightMenuGroup,
    type IInsightMenuItem,
    type IInsightMenuItemButton,
    isIInsightMenuSubmenu,
} from "../../types.js";
import { getDefaultInsightMenuItems } from "../getDefaultInsightMenuItems.js";
import { type IUseInsightMenuConfig } from "../types.js";

const intl = createIntlMock();

const noop = () => {};

const baseConfig: IUseInsightMenuConfig = {
    exportXLSXDisabled: false,
    exportCSVDisabled: false,
    exportCSVRawDisabled: false,
    isExporting: false,
    scheduleExportDisabled: true,
    scheduleExportManagementDisabled: true,
    exportPdfPresentationDisabled: false,
    exportPowerPointPresentationDisabled: false,
    exportPngImageDisabled: false,
    exportPdfTabularDisabled: false,
    onExportXLSX: noop,
    onExportCSV: noop,
    onExportRawCSV: noop,
    onScheduleExport: noop,
    onScheduleManagementExport: noop,
    onAlertingManagementOpen: noop,
    onExportPowerPointPresentation: noop,
    onExportPdfPresentation: noop,
    onExportPngImage: noop,
    onExportPdfTabular: noop,
    isExportRawVisible: true,
    isExportVisible: true,
    isExportPngImageVisible: true,
    isExportPdfTabularVisible: true,
    isScheduleExportVisible: false,
    isScheduleExportManagementVisible: false,
    isDataError: false,
    isAlertingVisible: false,
    isAlertManagementVisible: false,
    alertingDisabled: false,
    canCreateAutomation: false,
};

function getDataExportItems(menuItems: IInsightMenuItem[]): Record<string, IInsightMenuItemButton> {
    const exportsSubmenu = menuItems.find((item) => isIInsightMenuSubmenu(item) && item.itemId === "Exports");
    if (!exportsSubmenu || !isIInsightMenuSubmenu(exportsSubmenu)) {
        throw new Error("Exports submenu not found");
    }
    const group = exportsSubmenu.items?.find(
        (item): item is IInsightMenuGroup => item.type === "group" && item.itemId === "ExportGroup",
    );
    if (!group) {
        throw new Error("Export group not found");
    }
    return Object.fromEntries(
        group.items
            .filter((item): item is IInsightMenuItemButton => item.type === "button")
            .map((item) => [item.itemId, item]),
    );
}

describe("getDefaultInsightMenuItems - partial results", () => {
    it("disables formatted exports (XLSX, PDF, formatted CSV) with a tooltip, but not raw CSV, when the execution hit a limit", () => {
        const items = getDefaultInsightMenuItems(intl, baseConfig, {
            id: "widget",
            isLoading: false,
            limitBreaks: [{ limitType: "rowCount", limit: 1000, value: 1500 }],
        });

        const exportItems = getDataExportItems(items);
        // createIntlMock echoes the message id rather than resolving the localized text.
        const expectedTooltip = "options.menu.export.partialResults.exportDisabled";

        expect(exportItems["ExportXLSX"].disabled).toBe(true);
        expect(exportItems["ExportXLSX"].tooltip).toBe(expectedTooltip);
        expect(exportItems["ExportPDFFormatted"].disabled).toBe(true);
        expect(exportItems["ExportPDFFormatted"].tooltip).toBe(expectedTooltip);
        expect(exportItems["ExportCSVFormatted"].disabled).toBe(true);
        expect(exportItems["ExportCSVFormatted"].tooltip).toBe(expectedTooltip);
        // Raw CSV runs a separate full execution, so it stays enabled.
        expect(exportItems["ExportCSVRaw"].disabled).toBe(false);
        expect(exportItems["ExportCSVRaw"].tooltip).toBeUndefined();
    });

    it("keeps formatted exports enabled when the execution has no limit breaks", () => {
        const items = getDefaultInsightMenuItems(intl, baseConfig, {
            id: "widget",
            isLoading: false,
            limitBreaks: [],
        });

        const exportItems = getDataExportItems(items);

        expect(exportItems["ExportXLSX"].disabled).toBe(false);
        expect(exportItems["ExportPDFFormatted"].disabled).toBe(false);
        expect(exportItems["ExportCSVFormatted"].disabled).toBe(false);
        expect(exportItems["ExportCSVRaw"].disabled).toBe(false);
    });

    it("disables the XLSX/CSV quick-export bubbles with a tooltip when raw exports are off and the execution hit a limit", () => {
        const items = getDefaultInsightMenuItems(
            intl,
            { ...baseConfig, isExportRawVisible: false },
            {
                id: "widget",
                isLoading: false,
                limitBreaks: [{ limitType: "rowCount", limit: 1000, value: 1500 }],
            },
        );

        const bubbles = Object.fromEntries(
            items
                .filter((item): item is IInsightMenuItemButton => item.type === "button")
                .map((item) => [item.itemId, item]),
        );
        const expectedTooltip = "options.menu.export.partialResults.exportDisabled";

        expect(bubbles["ExportXLSXBubble"].disabled).toBe(true);
        expect(bubbles["ExportXLSXBubble"].tooltip).toBe(expectedTooltip);
        expect(bubbles["ExportCSVBubble"].disabled).toBe(true);
        expect(bubbles["ExportCSVBubble"].tooltip).toBe(expectedTooltip);
    });

    it("prioritizes the export-in-progress tooltip over the limit-break message on formatted exports", () => {
        const items = getDefaultInsightMenuItems(
            intl,
            { ...baseConfig, isExporting: true },
            {
                id: "widget",
                isLoading: false,
                limitBreaks: [{ limitType: "rowCount", limit: 1000, value: 1500 }],
            },
        );

        const exportItems = getDataExportItems(items);
        const inProgressTooltip = "options.menu.export.in.progress";

        expect(exportItems["ExportXLSX"].disabled).toBe(true);
        expect(exportItems["ExportXLSX"].tooltip).toBe(inProgressTooltip);
        expect(exportItems["ExportPDFFormatted"].tooltip).toBe(inProgressTooltip);
        expect(exportItems["ExportCSVFormatted"].tooltip).toBe(inProgressTooltip);
    });

    it("shows the same disabled-reason tooltip as the submenu on the bubbles when disabled for another reason", () => {
        const items = getDefaultInsightMenuItems(
            intl,
            {
                ...baseConfig,
                isExportRawVisible: false,
                isExporting: true,
                exportXLSXDisabled: true,
                exportCSVDisabled: true,
            },
            { id: "widget", isLoading: false },
        );

        const bubbles = Object.fromEntries(
            items
                .filter((item): item is IInsightMenuItemButton => item.type === "button")
                .map((item) => [item.itemId, item]),
        );
        // getExportTooltipId returns the export-in-progress reason (echoed as id by createIntlMock), not the
        // generic loading/error fallback.
        const expectedReasonTooltip = "options.menu.export.in.progress";

        expect(bubbles["ExportXLSXBubble"].disabled).toBe(true);
        expect(bubbles["ExportXLSXBubble"].tooltip).toBe(expectedReasonTooltip);
        expect(bubbles["ExportCSVBubble"].disabled).toBe(true);
        expect(bubbles["ExportCSVBubble"].tooltip).toBe(expectedReasonTooltip);
    });
});
