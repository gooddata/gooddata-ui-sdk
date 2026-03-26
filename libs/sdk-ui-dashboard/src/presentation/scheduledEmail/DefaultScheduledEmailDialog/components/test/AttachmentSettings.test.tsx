// (C) 2026 GoodData Corporation

import { type ComponentProps, useState } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type IExportDefinitionVisualizationObjectSettings } from "@gooddata/sdk-model";

import { IntlWrapper } from "../../../../localization/IntlWrapper.js";
import { AttachmentSettings } from "../Attachments/AttachmentSettings.js";

function renderComponent(customProps: Partial<ComponentProps<typeof AttachmentSettings>> = {}) {
    const defaultProps: ComponentProps<typeof AttachmentSettings> = {
        type: "CSV",
        settings: {},
        onSettingsChange: () => {},
    };

    return render(
        <IntlWrapper>
            <AttachmentSettings {...defaultProps} {...customProps} />
        </IntlWrapper>,
    );
}

function openSettings() {
    fireEvent.click(screen.getByLabelText("CSV options"));
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

describe("AttachmentSettings", () => {
    it("should default CSV settings to comma", () => {
        renderComponent();

        openSettings();

        expect(document.querySelector(".s-csv-delimiter-dropdown")).toHaveTextContent("Comma");
    });

    it("should prefill existing custom CSV delimiter", () => {
        renderComponent({ settings: { delimiter: "^" } });

        openSettings();

        expect(document.querySelector(".s-csv-delimiter-dropdown")).toHaveTextContent("Custom");
        expect(getCustomInput()).toHaveValue("^");
    });

    it("should render delimiter previews separately from the label", () => {
        renderComponent();

        openSettings();
        openDelimiterMenu();

        expect(screen.getByText("Semicolon")).toBeInTheDocument();
        expect(getPreviewChar("comma")).toHaveTextContent(",");
        expect(getPreviewChar("semicolon")).toHaveTextContent(";");
        expect(getPreviewChar("tab")).toHaveTextContent("⇥");
    });

    it("should reopen with the saved custom delimiter", () => {
        function Wrapper() {
            const [settings, setSettings] = useState<IExportDefinitionVisualizationObjectSettings>({});

            return <AttachmentSettings type="CSV" settings={settings} onSettingsChange={setSettings} />;
        }

        render(
            <IntlWrapper>
                <Wrapper />
            </IntlWrapper>,
        );

        openSettings();
        selectDelimiterOption("Custom");
        fireEvent.change(getCustomInput(), { target: { value: "^" } });
        fireEvent.click(screen.getByText("Save"));

        openSettings();

        expect(document.querySelector(".s-csv-delimiter-dropdown")).toHaveTextContent("Custom");
        expect(getCustomInput()).toHaveValue("^");
    });
});
