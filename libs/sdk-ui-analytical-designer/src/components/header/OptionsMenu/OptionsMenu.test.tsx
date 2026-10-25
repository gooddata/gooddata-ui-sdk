// (C) 2007-2026 GoodData Corporation

import { type ComponentProps } from "react";

import { fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { withIntl } from "../../../utils/with_intl.js";

import { OptionsMenuBase } from "./OptionsMenu.js";

// the fake clock is installed and uninstalled per test so it does not leak into other test files
beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

describe("OptionsMenu", () => {
    const BUTTON_EXPORT_CSV = ".s-gd-export-menu-export-csv";
    const BUTTON_EXPORT_CSV_RAW = ".gd-export-options-csv-raw";
    const BUTTON_EXPORT_XLSX = ".s-gd-export-menu-export-xlsx";
    const BUTTON_EXPORT_PDF = ".s-gd-export-menu-export-pdf";

    const Wrapped = withIntl(OptionsMenuBase);

    function renderComponent(customProps: Partial<ComponentProps<typeof Wrapped>> = {}) {
        const hiddenActions: string[] = [];
        const defaultProps: ComponentProps<typeof Wrapped> = {
            showDialogExportCsv: vi.fn(),
            showDialogExportReport: vi.fn(),
            showDialogExportPdf: vi.fn(),
            openInAnalyticalDesigner: vi.fn(),
            isExportCSVDisabled: false,
            isExportXLSXDisabled: false,
            isShowOptionsMenu: true,
            onOpenAsReport: vi.fn(),
            toggleOptionsMenu: vi.fn(),
            isExportVisible: true,
            hiddenActions,
            exportToCsvSupported: true,
            exportToXlsxSupported: true,
            isEnableTimezoneChange: false,
            // the state props the component used to receive as undefined — kept falsy
            isOpenAsReportDisabled: false,
            isExportRawCSVDisabled: false,
            isExportPDFDisabled: false,
            exportToPdfSupported: false,
            isEditFromKD: false,
            enableRawExports: false,
            hasPartialDataLimitBreaks: false,
            isAccessibilityModeEnabled: false,
        };
        const props = { ...defaultProps, ...customProps };
        return render(<Wrapped {...props} />);
    }

    function clickButtonExportCSV() {
        const item = document.querySelector(BUTTON_EXPORT_CSV);
        fireEvent.click(item);
    }
    function clickButtonExportXLSX() {
        const item = document.querySelector(BUTTON_EXPORT_XLSX);
        fireEvent.click(item);
    }
    function clickButtonExportCSVRaw() {
        const item = document.querySelector(BUTTON_EXPORT_CSV_RAW);
        fireEvent.click(item);
    }

    it("should not show OptionsMenu if isShowOptionsMenu is false", () => {
        renderComponent({ isShowOptionsMenu: false });

        expect(document.querySelector(".s-gd-export-menu-overlay")).toBeFalsy();
    });

    describe("Export CSV", () => {
        it("should hide option Export CSV", () => {
            renderComponent({
                isExportVisible: false,
            });

            expect(document.querySelectorAll(".s-gd-export-menu-export-csv")).toHaveLength(0);
        });

        it("should open CSV dialog on click button Export CSV", () => {
            const showDialogExportCsv = vi.fn();
            renderComponent({
                showDialogExportCsv,
            });

            clickButtonExportCSV();

            expect(showDialogExportCsv).toHaveBeenCalledWith("formatted");
        });

        it("should open raw CSV dialog on click button Export CSV Raw", () => {
            const showDialogExportCsv = vi.fn();
            renderComponent({
                showDialogExportCsv,
                enableRawExports: true,
            });

            clickButtonExportCSVRaw();

            expect(showDialogExportCsv).toHaveBeenCalledWith("raw");
        });
    });

    describe("Export XLSX", () => {
        it("should trigger showDialogExportReport on click button Export XLSX", () => {
            const showDialogExportReport = vi.fn();
            renderComponent({
                showDialogExportReport,
                isExportXLSXDisabled: false,
            });

            clickButtonExportXLSX();

            expect(showDialogExportReport).toHaveBeenCalledTimes(1);
        });

        it("should hide option Export XLSX", () => {
            renderComponent({
                isExportVisible: false,
            });

            expect(document.querySelectorAll(".s-gd-export-menu-export-xlsx")).toHaveLength(0);
        });
    });

    describe("Partial data warnings", () => {
        it("should disable formatted exports only and provide partial result tooltip", () => {
            renderComponent({
                enableRawExports: true,
                exportToPdfSupported: true,
                hasPartialDataLimitBreaks: true,
            });

            expect(document.querySelector(BUTTON_EXPORT_XLSX)).toHaveClass("is-disabled");
            expect(document.querySelector(BUTTON_EXPORT_PDF)).toHaveClass("is-disabled");
            expect(document.querySelector(BUTTON_EXPORT_CSV)).toHaveClass("is-disabled");
            expect(document.querySelector(BUTTON_EXPORT_CSV_RAW)).not.toHaveClass("is-disabled");

            const formattedCsvTrigger = document
                .querySelector(BUTTON_EXPORT_CSV)
                ?.closest(".s-gd-bubble-trigger-options-menu-item");
            expect(formattedCsvTrigger).toBeTruthy();
        });
    });

    describe("open in analytical designer", () => {
        it("should render option open in analytical designer", () => {
            renderComponent({
                isEditFromKD: true,
            });

            expect(document.querySelector(".s-open-in-analytical-designer")).toBeDefined();
        });

        it("should hide option open in analytical designer if not from AD overlay", () => {
            renderComponent({
                isEditFromKD: false,
            });

            expect(document.querySelectorAll(".s-open-in-analytical-designer")).toHaveLength(0);
        });

        it("should hide option open in analytical designer if hideAction include openInAnalyticalDesigner", () => {
            renderComponent({
                isEditFromKD: true,
                hiddenActions: ["openInAnalyticalDesigner"],
            });

            expect(document.querySelectorAll(".s-open-in-analytical-designer")).toHaveLength(0);
        });
    });

    describe("change timezone", () => {
        it("should hide the timezone option when timezone change is not allowed", () => {
            renderComponent();

            expect(document.querySelectorAll(".s-options-menu-timezone")).toHaveLength(0);
        });

        it("should render the timezone option when timezone change is allowed", () => {
            renderComponent({
                isEnableTimezoneChange: true,
            });

            expect(document.querySelector(".s-options-menu-timezone")).toBeTruthy();
        });
    });
});
