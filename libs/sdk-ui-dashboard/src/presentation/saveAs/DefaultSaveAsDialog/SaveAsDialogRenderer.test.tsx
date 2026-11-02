// (C) 2020-2026 GoodData Corporation

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { type ISaveAsDialogRendererOwnProps, SaveAsDialogRenderer } from "./SaveAsDialogRenderer.js";

describe("Test SaveAsNewDashboardDialog:", () => {
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

        rerender(<SaveAsDialogRenderer {...defaultProps} isDashboardSaving />);

        await userEvent.click(screen.getByText("Create dashboard"));

        await waitFor(() => {
            expect(onSubmit).not.toHaveBeenCalled();
        });
    });

    describe("long titles", () => {
        const prefix = "Copy of ";
        const maxTitleLength = 255 - prefix.length;

        it("Should not shorten a title that fits the limit with the prefix", () => {
            const dashboardTitle = "a".repeat(maxTitleLength);
            renderComponent({ ...defaultProps, dashboardTitle });

            expect(screen.getByDisplayValue(`${prefix}${dashboardTitle}`)).toBeInTheDocument();
        });

        it("Should shorten a 255 character title so the prefilled title has 255 characters", () => {
            const dashboardTitle = "a".repeat(maxTitleLength) + "b".repeat(255 - maxTitleLength);
            renderComponent({ ...defaultProps, dashboardTitle });

            const expected = `${prefix}${"a".repeat(maxTitleLength)}`;
            expect(screen.getByDisplayValue(expected)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(expected)).toBeInTheDocument();
        });

        it("Should submit the shortened title", async () => {
            const onSubmit = vi.fn();
            renderComponent({ ...defaultProps, dashboardTitle: "a".repeat(255), onSubmit });

            await userEvent.click(screen.getByText("Create dashboard"));

            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledWith(`${prefix}${"a".repeat(maxTitleLength)}`, true, true);
            });
        });

        it("Should keep the whole localized text in a locale where the title goes first", async () => {
            // ja-JP puts the title before the localized text; read that text from the rendered dialog
            const { unmount } = renderComponent({ ...defaultProps, dashboardTitle: "§", locale: "ja-JP" });
            const shortTitle = (await screen.findByPlaceholderText(/§/)).getAttribute("placeholder") ?? "";
            unmount();

            renderComponent({ ...defaultProps, dashboardTitle: "a".repeat(255), locale: "ja-JP" });

            const expected = shortTitle.replace("§", "a".repeat(255 - (shortTitle.length - 1)));
            expect(expected).toHaveLength(255);
            expect(await screen.findByDisplayValue(expected)).toBeInTheDocument();
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
