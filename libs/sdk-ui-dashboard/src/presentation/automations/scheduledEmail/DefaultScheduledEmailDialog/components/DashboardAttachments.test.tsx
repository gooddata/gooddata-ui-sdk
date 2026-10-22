// (C) 2026 GoodData Corporation

import { type ComponentProps, useState } from "react";

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { IntlWrapper } from "../../../../localization/IntlWrapper.js";

import { DashboardAttachments } from "./Attachments/DashboardAttachments.js";

function renderComponent(customProps: Partial<ComponentProps<typeof DashboardAttachments>> = {}) {
    const defaultProps: ComponentProps<typeof DashboardAttachments> = {
        selectedAttachments: [],
        isCrossFiltering: false,
        onDashboardAttachmentsChange: () => {},
        xlsxSettings: {},
        onXlsxSettingsChange: () => {},
        isSlidesExportEnabled: true,
    };

    function StatefulAttachments() {
        const props = { ...defaultProps, ...customProps };
        const [selectedAttachments, setSelectedAttachments] = useState(props.selectedAttachments);
        return (
            <IntlWrapper>
                <DashboardAttachments
                    {...props}
                    selectedAttachments={selectedAttachments}
                    onDashboardAttachmentsChange={(attachments, filters) => {
                        setSelectedAttachments(attachments);
                        props.onDashboardAttachmentsChange(attachments, filters);
                    }}
                />
            </IntlWrapper>
        );
    }

    return render(<StatefulAttachments />);
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
    it("leaves the genuinely empty selection to the dialog validation message", () => {
        renderComponent({ selectedAttachments: [] });

        expect(screen.queryByText("No attachments to display.")).not.toBeInTheDocument();
    });

    it.each([{ hidden: "PDF_SLIDES" as const }, { hidden: "PPTX" as const }])(
        "focuses Add and announces the empty list while preserving $hidden",
        async (options) => {
            const user = userEvent.setup();
            const onDashboardAttachmentsChange = vi.fn();
            renderComponent({
                isSlidesExportEnabled: false,
                isCrossFiltering: true,
                ...options,
                selectedAttachments: [options.hidden, "PDF"],
                onDashboardAttachmentsChange,
            });

            const deleteButton = screen.getByRole("button", { name: "Delete PDF attachment" });
            deleteButton.focus();
            await user.keyboard("{Enter}");

            await waitFor(() =>
                expect(screen.getByRole("button", { name: "Add attachments" })).toHaveFocus(),
            );
            expect(
                screen.getByText("No attachments to display.").closest('[role="status"]'),
            ).toBeInTheDocument();
            expect(
                screen.getByText(/Cross-filtering will not be applied in the scheduled export/),
            ).toBeInTheDocument();
            expect(onDashboardAttachmentsChange).toHaveBeenCalledWith([options.hidden], undefined);
            expect(screen.queryByRole("button", { name: "Delete PDF attachment" })).not.toBeInTheDocument();
        },
    );

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
