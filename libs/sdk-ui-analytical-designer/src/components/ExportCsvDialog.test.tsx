// (C) 2026 GoodData Corporation

import { act, fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";

import { hideDialog } from "../actions/dialogs_actions.js";
import {
    type ExportCsvMode,
    exportRaw,
    exportResult,
    showDialogExportCsv,
} from "../actions/export_report_actions.js";
import { setFeatureFlagsItems } from "../actions/featureFlags_actions.js";
import { CSV } from "../constants/export_types.js";
import { createStore } from "../create_store.js";
import { withIntl } from "../utils/with_intl.js";

import { ExportCsvDialog } from "./ExportCsvDialog.js";

// The dialog reads everything it needs from the store, so the tests drive it through a real store:
// state is seeded with the real actions and dispatch is spied on (calling through) to assert on what
// the dialog dispatches.
describe("ExportCsvDialog", () => {
    const DEFAULT_TITLE = "Untitled visualization";

    const Wrapped = withIntl(ExportCsvDialog);

    function renderComponent({
        isExportCsvDialogActive = true,
        mode = "formatted" as ExportCsvMode,
        defaultDelimiter,
    }: {
        isExportCsvDialogActive?: boolean;
        mode?: ExportCsvMode;
        defaultDelimiter?: string;
    } = {}) {
        const { store } = createStore();

        if (defaultDelimiter !== undefined) {
            const settings: IUserWorkspaceSettings = {
                userId: "user-id",
                workspace: "workspace-id",
                locale: "en-US",
                separators: { thousand: ",", decimal: "." },
                exportCsvCustomDelimiter: defaultDelimiter,
            };
            store.dispatch(setFeatureFlagsItems(settings));
        }

        if (isExportCsvDialogActive) {
            store.dispatch(showDialogExportCsv(mode));
        }

        const dispatch = vi.spyOn(store, "dispatch");

        return {
            store,
            dispatch,
            ...render(
                <Provider store={store}>
                    <Wrapped />
                </Provider>,
            ),
        };
    }

    function openDelimiterMenu() {
        fireEvent.click(document.querySelector(".s-csv-delimiter-dropdown")!);
    }

    function selectDelimiterOption(title: string) {
        openDelimiterMenu();
        fireEvent.click(screen.getByText(title));
    }

    function getCustomInput(): HTMLInputElement {
        return document.querySelector(".s-csv-delimiter-custom-input input") as HTMLInputElement;
    }

    function getPreviewChar(optionId: string): HTMLElement | null {
        return document.querySelector(
            `[data-testid="s-csv-delimiter-${optionId}"] .gd-csv-delimiter-picker-preview-char`,
        );
    }

    it("should not show ExportCsvDialog if it is inactive", () => {
        renderComponent({ isExportCsvDialogActive: false });

        expect(document.querySelector(".s-gd-csv-export-dialog")).not.toBeInTheDocument();
    });

    it("should default to inherit when no resolved delimiter is provided", () => {
        renderComponent();

        expect(document.querySelector(".s-csv-delimiter-dropdown")).toHaveTextContent("Inherit");
    });

    it("should default to inherit even when a resolved delimiter is provided", () => {
        renderComponent({ defaultDelimiter: ";" });

        expect(document.querySelector(".s-csv-delimiter-dropdown")).toHaveTextContent("Inherit");
    });

    it("should default to inherit even when the resolved delimiter is custom", () => {
        renderComponent({ defaultDelimiter: "^" });

        expect(document.querySelector(".s-csv-delimiter-dropdown")).toHaveTextContent("Inherit");
        expect(getCustomInput()).not.toBeInTheDocument();
    });

    it("should reset to inherit when reopened, regardless of the resolved delimiter", () => {
        const { store } = renderComponent({ defaultDelimiter: ";" });

        selectDelimiterOption("Custom");
        fireEvent.change(getCustomInput(), { target: { value: "^" } });

        act(() => {
            store.dispatch(hideDialog());
        });
        act(() => {
            store.dispatch(showDialogExportCsv("formatted"));
        });

        expect(document.querySelector(".s-csv-delimiter-dropdown")).toHaveTextContent("Inherit");
    });

    it("should submit without an explicit delimiter when inherit is selected despite a resolved delimiter", () => {
        const { dispatch } = renderComponent({ defaultDelimiter: ";" });

        fireEvent.click(screen.getByText("Export"));

        expect(dispatch).toHaveBeenCalledWith(
            exportResult({
                format: CSV,
                title: DEFAULT_TITLE,
                delimiter: undefined,
            }),
        );
        expect(dispatch).toHaveBeenCalledWith(hideDialog());
    });

    it("should render delimiter previews separately from the label", () => {
        renderComponent();

        openDelimiterMenu();

        expect(screen.getByText("Semicolon")).toBeInTheDocument();
        expect(getPreviewChar("semicolon")).toHaveTextContent(";");
        expect(getPreviewChar("comma")).toHaveTextContent(",");
    });

    it("should submit formatted CSV export with selected preset delimiter", () => {
        const { dispatch } = renderComponent();

        selectDelimiterOption("Semicolon");
        fireEvent.click(screen.getByText("Export"));

        expect(dispatch).toHaveBeenCalledWith(
            exportResult({
                format: CSV,
                title: DEFAULT_TITLE,
                delimiter: ";",
            }),
        );
        expect(dispatch).toHaveBeenCalledWith(hideDialog());
    });

    it("should submit raw CSV export with custom delimiter", () => {
        const { dispatch } = renderComponent({ mode: "raw" });

        selectDelimiterOption("Custom");
        fireEvent.change(getCustomInput(), { target: { value: "^" } });
        fireEvent.click(screen.getByText("Export"));

        expect(dispatch).toHaveBeenCalledWith(exportRaw(DEFAULT_TITLE, { delimiter: "^" }));
        expect(dispatch).toHaveBeenCalledWith(hideDialog());
    });

    it("should validate custom delimiter length", () => {
        renderComponent();

        selectDelimiterOption("Custom");

        const exportButton = screen.getByText("Export").closest("button");
        expect(exportButton).toHaveAttribute("aria-disabled", "true");
        expect(getCustomInput()).toHaveValue("");

        fireEvent.change(getCustomInput(), { target: { value: "abc" } });

        expect(screen.getByText(/Use a single character/)).toBeInTheDocument();
        expect(exportButton).toHaveAttribute("aria-disabled", "true");
    });

    it("should validate unsupported custom delimiter characters", () => {
        renderComponent();

        selectDelimiterOption("Custom");
        fireEvent.change(getCustomInput(), { target: { value: "é" } });

        expect(screen.getByText(/Invalid delimiter/)).toBeInTheDocument();
    });
});
