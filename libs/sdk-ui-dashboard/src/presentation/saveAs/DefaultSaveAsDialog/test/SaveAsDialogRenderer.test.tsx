// (C) 2020-2022 GoodData Corporation
import React from "react";
import { describe, it, expect, vi } from "vitest";
import noop from "lodash/noop.js";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import defaultUserEvent from "@testing-library/user-event";
import { defaultImport } from "default-import";

import { ISaveAsDialogRendererOwnProps, SaveAsDialogRenderer } from "../SaveAsDialogRenderer.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const userEvent = defaultImport(defaultUserEvent);

describe("Test SaveAsNewDashboardDialog: ", () => {
    const defaultProps: ISaveAsDialogRendererOwnProps = {
        dashboardTitle: "ABC Title",
        isDashboardLoaded: true,
        isDashboardSaving: false,
        isKpiWidgetEnabled: true,
        isScheduleEmailsEnabled: true,
        locale: "en-US",
        onCancel: noop,
        onSubmit: noop,
        isInEditMode: false,
    };

    function renderComponent(props = defaultProps) {
        return render(<SaveAsDialogRenderer {...props} />);
    }

    it("Should render correctly", () => {
        renderComponent();

        expect(screen.getByText("Save dashboard as new")).toBeInTheDocument();
        expect(screen.getByDisplayValue(`Copy of ${defaultProps.dashboardTitle}`)).toBeInTheDocument();
        expect(screen.getByText("Alerts and email schedules will not be duplicated")).toBeInTheDocument();
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

    it("Should not render note if neither isKpiWidgetEnabled nor isScheduleEmailsEnabled are true", () => {
        renderComponent({
            ...defaultProps,
            isKpiWidgetEnabled: false,
            isScheduleEmailsEnabled: false,
        });

        expect(
            screen.queryByText("Alerts and email schedules will not be duplicated"),
        ).not.toBeInTheDocument();
    });
});
