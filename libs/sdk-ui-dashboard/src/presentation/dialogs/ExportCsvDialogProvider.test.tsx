// (C) 2026 GoodData Corporation

import { useState } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
    ExportCsvDialogContextProvider,
    useExportCsvDialogContext,
} from "../dashboardContexts/ExportCsvDialogContext.js";
import { IntlWrapper } from "../localization/IntlWrapper.js";

import { ExportCsvDialogProvider } from "./ExportCsvDialogProvider.js";

const TRIGGER_ID = "export-trigger";

function ExportMenu({ onSubmit }: { onSubmit: () => void }) {
    const { openDialog } = useExportCsvDialogContext();
    const [isMenuOpen, setIsMenuOpen] = useState(true);

    return (
        <>
            <button id={TRIGGER_ID}>More actions</button>
            {isMenuOpen ? (
                <button
                    onClick={() => {
                        // the menu item is unmounted when the menu closes, so focus cannot return to it
                        setIsMenuOpen(false);
                        openDialog({ onSubmit }, TRIGGER_ID);
                    }}
                >
                    Raw (.csv)
                </button>
            ) : null}
        </>
    );
}

function renderComponent(onSubmit = vi.fn()) {
    render(
        <IntlWrapper>
            <ExportCsvDialogContextProvider>
                <ExportMenu onSubmit={onSubmit} />
                <ExportCsvDialogProvider />
            </ExportCsvDialogContextProvider>
        </IntlWrapper>,
    );

    const menuItem = screen.getByText("Raw (.csv)");
    menuItem.focus();
    fireEvent.click(menuItem);
}

describe("ExportCsvDialogProvider", () => {
    it("should return focus to the export trigger after the dialog is submitted", async () => {
        const onSubmit = vi.fn();
        renderComponent(onSubmit);

        fireEvent.click(screen.getByText("Export"));

        expect(onSubmit).toHaveBeenCalledTimes(1);
        await waitFor(() => expect(document.getElementById(TRIGGER_ID)).toHaveFocus());
    });

    it("should return focus to the export trigger after the dialog is cancelled", async () => {
        renderComponent();

        fireEvent.click(screen.getByText("Cancel"));

        await waitFor(() => expect(document.getElementById(TRIGGER_ID)).toHaveFocus());
        expect(document.activeElement).not.toBe(document.body);
    });
});
