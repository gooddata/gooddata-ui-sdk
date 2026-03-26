// (C) 2026 GoodData Corporation

import { type ComponentProps } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { IntlWrapper } from "../../localization/IntlWrapper.js";
import { ExportCsvDialog } from "../ExportCsvDialog.js";

function renderComponent(customProps: Partial<ComponentProps<typeof ExportCsvDialog>> = {}) {
    const defaultProps = {
        onCancel: () => {},
        onSubmit: () => {},
    };

    return render(
        <IntlWrapper>
            <ExportCsvDialog {...defaultProps} {...customProps} />
        </IntlWrapper>,
    );
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

describe("ExportCsvDialog", () => {
    it("should initialize from the resolved default delimiter", () => {
        renderComponent({ initialDelimiter: ";" });

        expect(document.querySelector(".s-csv-delimiter-dropdown")).toHaveTextContent("Semicolon");
    });

    it("should initialize custom delimiter when the resolved default is custom", () => {
        renderComponent({ initialDelimiter: "^" });

        expect(document.querySelector(".s-csv-delimiter-dropdown")).toHaveTextContent("Custom");
        expect(getCustomInput()).toHaveValue("^");
    });

    it("should default to comma when no resolved delimiter is provided", () => {
        renderComponent();

        expect(document.querySelector(".s-csv-delimiter-dropdown")).toHaveTextContent("Comma");
    });

    it("should render delimiter previews separately from the label", () => {
        renderComponent();

        openDelimiterMenu();

        expect(screen.getByText("Semicolon")).toBeInTheDocument();
        expect(getPreviewChar("comma")).toHaveTextContent(",");
        expect(getPreviewChar("semicolon")).toHaveTextContent(";");
        expect(getPreviewChar("tab")).toHaveTextContent("⇥");
    });

    it("should submit formatted CSV export with the selected delimiter", () => {
        const onSubmit = vi.fn();
        renderComponent({ onSubmit });

        selectDelimiterOption("Semicolon");
        fireEvent.click(screen.getByText("Export"));

        expect(onSubmit).toHaveBeenCalledWith({ delimiter: ";" });
    });

    it("should validate custom delimiter length", () => {
        renderComponent();

        selectDelimiterOption("Custom");
        fireEvent.change(getCustomInput(), { target: { value: "abc" } });

        expect(screen.getByText("Use a single character")).toBeInTheDocument();
        expect(screen.getByText("Export").closest("button")).toHaveAttribute("aria-disabled", "true");
    });

    it("should validate unsupported custom delimiter characters", () => {
        renderComponent();

        selectDelimiterOption("Custom");
        fireEvent.change(getCustomInput(), { target: { value: "é" } });

        expect(screen.getByText("This character isn't supported")).toBeInTheDocument();
    });
});
