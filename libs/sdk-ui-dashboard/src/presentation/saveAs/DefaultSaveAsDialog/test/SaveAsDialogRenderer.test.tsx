// (C) 2020-2025 GoodData Corporation

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ISaveAsDialogRendererOwnProps, SaveAsDialogRenderer } from "../SaveAsDialogRenderer.js";

describe("Test SaveAsNewDashboardDialog: ", () => {
    const defaultProps: ISaveAsDialogRendererOwnProps = {
        dashboardTitle: "ABC Title",
        isDashboardLoaded: true,
        isDashboardSaving: false,
        isKpiWidgetEnabled: true,
        locale: "en-US",
        onCancel: () => {},
        onSubmit: () => {},
        isInEditMode: false,
    };

    function renderComponent(props = defaultProps) {
        return render(<SaveAsDialogRenderer {...props} />);
    }

    it("Should render correctly", () => {
        renderComponent();

        expect(screen.getByText("Save dashboard as new")).toBeInTheDocument();
        expect(screen.getByDisplayValue(`Copy of ${defaultProps.dashboardTitle}`)).toBeInTheDocument();
    });

    it("Should display the default title in the title textbox", () => {
        renderComponent();

        expect(screen.getByDisplayValue(`Copy of ${defaultProps.dashboardTitle}`)).toBeInTheDocument();
    });

    it("Should get default title when focusing out the input with empty value", async () => {
        renderComponent();

        await userEvent.clear(screen.getByDisplayValue(`Copy of ${defaultProps.dashboardTitle}`));

        expect(screen.queryByDisplayValue(`Copy of ${defaultProps.dashboardTitle}`)).not.toBeInTheDocument();

        fireEvent.blur(screen.getByPlaceholderText(`Copy of ${defaultProps.dashboardTitle}`));
        await waitFor(() => {
            expect(screen.getByDisplayValue(`Copy of ${defaultProps.dashboardTitle}`)).toBeInTheDocument();
        });
    });

    it("Should allow save as new dashboard when the title is not empty and the page is ready", async () => {
        const onSubmit = vi.fn();
        renderComponent({ ...defaultProps, onSubmit });

        await userEvent.click(screen.getByText("Create dashboard"));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalled();
        });
    });

    it("Should not allow save as new dashboard when the title is empty and the page is not ready", async () => {
        const onSubmit = vi.fn();
        const { rerender } = renderComponent({
            ...defaultProps,
            onSubmit,
        });

        await userEvent.clear(screen.getByDisplayValue(`Copy of ${defaultProps.dashboardTitle}`));

        rerender(<SaveAsDialogRenderer {...defaultProps} isDashboardSaving={true} />);

        await userEvent.click(screen.getByText("Create dashboard"));

        await waitFor(() => {
            expect(onSubmit).not.toHaveBeenCalled();
        });
    });

    it("Should not render note if isKpiWidgetEnabled is not true", () => {
        renderComponent({
            ...defaultProps,
            isKpiWidgetEnabled: false,
        });

        expect(
            screen.queryByText("Alerts and email schedules will not be duplicated"),
        ).not.toBeInTheDocument();
    });
});
