// (C) 2026 GoodData Corporation

import { type ComponentProps } from "react";

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { IntlWrapper } from "../../../../../localization/IntlWrapper.js";
import { WidgetAttachments } from "../Attachments/WidgetAttachments.js";

function renderComponent(customProps: Partial<ComponentProps<typeof WidgetAttachments>> = {}) {
    const defaultProps: ComponentProps<typeof WidgetAttachments> = {
        selectedAttachments: [],
        onWidgetAttachmentsChange: () => {},
        xlsxSettings: {},
        onXlsxSettingsChange: () => {},
        pdfSettings: {},
        onPdfSettingsChange: () => {},
        csvSettings: {},
        onCsvSettingsChange: () => {},
        csvRawSettings: {},
        onCsvRawSettingsChange: () => {},
        isSlidesExportEnabled: true,
    };

    return render(
        <IntlWrapper>
            <WidgetAttachments {...defaultProps} {...customProps} />
        </IntlWrapper>,
    );
}

function openAddAttachments() {
    fireEvent.click(screen.getByTestId("add_attachments"));
}

function toggleFormat(label: string) {
    // Scope to the picker's checkbox list so we hit the checkbox, not a matching chip label.
    const picker = document.querySelector(".gd-attachment-types-content") as HTMLElement;
    fireEvent.click(within(picker).getByText(label).closest("label")!.querySelector("input")!);
}

describe("WidgetAttachments", () => {
    it("does not offer slide (single slide) formats when slide exports are disabled", () => {
        renderComponent({ isSlidesExportEnabled: false });

        openAddAttachments();

        expect(screen.getByText("Snapshot (.png)")).toBeInTheDocument();
        expect(screen.queryByText("Single Slide (.pdf)")).not.toBeInTheDocument();
        expect(screen.queryByText("Single Slide (.pptx)")).not.toBeInTheDocument();
    });

    it("keeps an already-selected slide attachment when adding another format while slides are disabled", () => {
        const onWidgetAttachmentsChange = vi.fn();
        renderComponent({
            isSlidesExportEnabled: false,
            selectedAttachments: ["PPTX"],
            onWidgetAttachmentsChange,
        });

        openAddAttachments();
        toggleFormat("Snapshot (.png)");
        fireEvent.click(screen.getByText("Save"));

        expect(onWidgetAttachmentsChange).toHaveBeenCalledWith(["PNG", "PPTX"]);
    });

    it("does not surface an existing gated-off slide as a chip", () => {
        renderComponent({
            isSlidesExportEnabled: false,
            selectedAttachments: ["PPTX", "PNG"],
        });

        expect(screen.queryByText("Single Slide (.pptx)")).not.toBeInTheDocument();
        expect(screen.getByText("Snapshot (.png)")).toBeInTheDocument();
    });
});
