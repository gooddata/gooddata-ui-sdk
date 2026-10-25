// (C) 2007-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { hideDialog } from "../actions/dialogs_actions.js";
import { exportResult } from "../actions/export_report_actions.js";
import { XLSX } from "../constants/export_types.js";
import { isActiveFiltersByDefault, isCellMergedByDefault } from "../selectors/feature_flag_selector.js";
import { VisualizationPropertiesSelectors } from "../selectors/visualization_properties_selector.js";
import { getReportTitle } from "../services/report_service.js";
import { getShowExportDialog } from "../store/dialogs/dialogs_selectors.js";
import { withIntl } from "../utils/with_intl.js";

import { ExportDialog } from "./ExportDialog.js";

// the fake clock is installed and uninstalled per test so it does not leak into other test files
beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

vi.hoisted(() => {
    vi.resetModules();
});

const useSelectorMock = vi.hoisted(() => vi.fn());
const dispatchMock = vi.hoisted(() => vi.fn());

vi.mock("react-redux", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("react-redux");
    return {
        ...actual,
        useSelector: (selector: unknown) => useSelectorMock(selector),
        useDispatch: () => dispatchMock,
    };
});

describe("ExportDialog", () => {
    const DEFAULT_TITLE = "Untitled visualization";

    interface ISelectorValues {
        activeFiltersByDefault?: boolean;
        cellMergedByDefault?: boolean;
        currentReportTitle?: string;
        isExportDialogActive?: boolean;
    }

    function setSelectorValues({
        activeFiltersByDefault = false,
        cellMergedByDefault = false,
        currentReportTitle = "",
        isExportDialogActive = true,
    }: ISelectorValues = {}) {
        useSelectorMock.mockImplementation((selector: unknown) => {
            if (selector === isActiveFiltersByDefault) {
                return activeFiltersByDefault;
            }
            if (selector === isCellMergedByDefault) {
                return cellMergedByDefault;
            }
            if (selector === getReportTitle) {
                return currentReportTitle;
            }
            if (selector === getShowExportDialog) {
                return isExportDialogActive;
            }
            if (selector === VisualizationPropertiesSelectors.getGrandTotalsPosition) {
                return undefined;
            }
            return undefined;
        });
    }

    function renderComponent(selectorValues: ISelectorValues = {}) {
        setSelectorValues(selectorValues);
        const Wrapped = withIntl(ExportDialog);
        return render(<Wrapped />);
    }

    beforeEach(() => {
        useSelectorMock.mockReset();
        dispatchMock.mockReset();
    });

    it("should not show ExportDialog if isExportDialogActive is false", () => {
        renderComponent({ isExportDialogActive: false });

        expect(document.querySelector(".gd-export-dialog")).not.toBeInTheDocument();
    });

    it("should trigger hideDialog on click Cancel", () => {
        const { getByText } = renderComponent();

        fireEvent.click(getByText("Cancel"));

        expect(dispatchMock).toHaveBeenCalledTimes(1);
        expect(dispatchMock).toHaveBeenCalledWith(hideDialog());
    });

    it("should trigger exportResult and hideDialog on click Export", () => {
        const { getByText } = renderComponent();

        fireEvent.click(getByText("Export"));

        expect(dispatchMock).toHaveBeenCalledTimes(2);
        expect(dispatchMock).toHaveBeenCalledWith(
            exportResult({
                format: XLSX,
                includeFilterContext: false,
                showFilters: false,
                mergeHeaders: false,
                title: DEFAULT_TITLE,
            }),
        );
        expect(dispatchMock).toHaveBeenCalledWith(hideDialog());
    });

    it('should check "Keep attribute cells merged" checkbox', () => {
        const { getByText } = renderComponent({ cellMergedByDefault: true });

        fireEvent.click(getByText("Export"));

        expect(dispatchMock).toHaveBeenCalledWith(
            exportResult({
                format: XLSX,
                includeFilterContext: false,
                showFilters: false,
                mergeHeaders: true,
                title: DEFAULT_TITLE,
            }),
        );
    });

    it('should uncheck "Keep attribute cells merged" checkbox', () => {
        const { getByText } = renderComponent({ cellMergedByDefault: false });

        fireEvent.click(getByText("Export"));

        expect(dispatchMock).toHaveBeenCalledWith(
            exportResult({
                format: XLSX,
                includeFilterContext: false,
                showFilters: false,
                mergeHeaders: false,
                title: DEFAULT_TITLE,
            }),
        );
    });

    it('should check "Include applied filters" checkbox', () => {
        const { getByText } = renderComponent({ activeFiltersByDefault: true });

        fireEvent.click(getByText("Export"));

        expect(dispatchMock).toHaveBeenCalledWith(
            exportResult({
                format: XLSX,
                includeFilterContext: false,
                showFilters: false,
                mergeHeaders: false,
                title: DEFAULT_TITLE,
            }),
        );
    });

    it('should uncheck "Include applied filters" checkbox', () => {
        const { getByText } = renderComponent({ activeFiltersByDefault: false });

        fireEvent.click(getByText("Export"));

        expect(dispatchMock).toHaveBeenCalledWith(
            exportResult({
                format: XLSX,
                includeFilterContext: false,
                showFilters: false,
                mergeHeaders: false,
                title: DEFAULT_TITLE,
            }),
        );
    });

    it("should trigger exportResult with default title on click Export", () => {
        const { getByText } = renderComponent();

        fireEvent.click(getByText("Export"));

        expect(dispatchMock).toHaveBeenCalledWith(
            exportResult({
                format: XLSX,
                includeFilterContext: false,
                showFilters: false,
                mergeHeaders: false,
                title: DEFAULT_TITLE,
            }),
        );
    });

    it("should trigger exportResult with provided title on click Export", () => {
        const currentReportTitle = "Custom Title";
        const { getByText } = renderComponent({ currentReportTitle });

        fireEvent.click(getByText("Export"));

        expect(dispatchMock).toHaveBeenCalledWith(
            exportResult({
                format: XLSX,
                includeFilterContext: false,
                showFilters: false,
                mergeHeaders: false,
                title: currentReportTitle,
            }),
        );
    });
});
