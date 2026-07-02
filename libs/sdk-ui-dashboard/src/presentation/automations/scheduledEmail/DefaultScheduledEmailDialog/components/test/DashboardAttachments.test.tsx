// (C) 2026 GoodData Corporation

import { type ComponentProps } from "react";

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { IntlWrapper } from "../../../../../localization/IntlWrapper.js";
import { DashboardAttachments } from "../Attachments/DashboardAttachments.js";

function renderComponent(customProps: Partial<ComponentProps<typeof DashboardAttachments>> = {}) {
    const defaultProps: ComponentProps<typeof DashboardAttachments> = {
        selectedAttachments: [],
        isCrossFiltering: false,
        onDashboardAttachmentsChange: () => {},
        xlsxSettings: {},
        onXlsxSettingsChange: () => {},
        isSlidesExportEnabled: true,
    };

    return render(
        <IntlWrapper>
            <DashboardAttachments {...defaultProps} {...customProps} />
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

describe("DashboardAttachments", () => {
    it("does not offer slide deck formats when slide exports are disabled", () => {
        renderComponent({ isSlidesExportEnabled: false });

        openAddAttachments();

        expect(screen.getByText("Snapshot (.pdf)")).toBeInTheDocument();
        expect(screen.queryByText("Slide Deck (.pdf)")).not.toBeInTheDocument();
        expect(screen.queryByText("Slide Deck (.pptx)")).not.toBeInTheDocument();
    });

    it("keeps an already-selected slide attachment when adding another format while slides are disabled", () => {
        const onDashboardAttachmentsChange = vi.fn();
        renderComponent({
            isSlidesExportEnabled: false,
            selectedAttachments: ["PDF_SLIDES"],
            onDashboardAttachmentsChange,
        });

        openAddAttachments();
        toggleFormat("Snapshot (.pdf)");
        fireEvent.click(screen.getByText("Save"));

        expect(onDashboardAttachmentsChange).toHaveBeenCalledWith(["PDF", "PDF_SLIDES"], undefined);
    });

    it("does not surface an existing gated-off slide deck as a chip", () => {
        renderComponent({
            isSlidesExportEnabled: false,
            selectedAttachments: ["PDF_SLIDES", "PDF"],
        });

        expect(screen.queryByText("Slide Deck (.pdf)")).not.toBeInTheDocument();
        expect(screen.getByText("Snapshot (.pdf)")).toBeInTheDocument();
    });
});
