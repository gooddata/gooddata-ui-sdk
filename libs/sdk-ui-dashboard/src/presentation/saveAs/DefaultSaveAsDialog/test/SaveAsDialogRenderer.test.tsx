// (C) 2020-2022 GoodData Corporation
import React from "react";
import noop from "lodash/noop";
import { waitFor, screen, fireEvent } from "@testing-library/react";

import { ISaveAsDialogRendererOwnProps, SaveAsDialogRenderer } from "../SaveAsDialogRenderer";

import { setupComponent } from "../../../../tests/testHelper";

// const SaveAsNewDashboardDialog = "s-dialog";

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
    };

    function renderComponent(props = defaultProps) {
        return setupComponent(<SaveAsDialogRenderer {...props} />);
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
        const { user } = renderComponent();

        await user.clear(screen.getByDisplayValue(`Copy of ${defaultProps.dashboardTitle}`));

        expect(screen.queryByDisplayValue(`Copy of ${defaultProps.dashboardTitle}`)).not.toBeInTheDocument();

        fireEvent.blur(screen.getByPlaceholderText(`Copy of ${defaultProps.dashboardTitle}`));
        await waitFor(() => {
            expect(screen.getByDisplayValue(`Copy of ${defaultProps.dashboardTitle}`)).toBeInTheDocument();
        });
    });

    it("Should allow save as new dashboard when the title is not empty and the page is ready", async () => {
        const onSubmit = jest.fn();
        const { user } = renderComponent({ ...defaultProps, onSubmit });

        await user.click(screen.getByText("Create dashboard"));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalled();
        });
    });

    it("Should not allow save as new dashboard when the title is empty and the page is not ready", async () => {
        const onSubmit = jest.fn();
        const { user, rerender } = renderComponent({
            ...defaultProps,
            onSubmit,
        });

        await user.clear(screen.getByDisplayValue(`Copy of ${defaultProps.dashboardTitle}`));

        rerender(<SaveAsDialogRenderer {...defaultProps} isDashboardSaving={true} />);

        await user.click(screen.getByText("Create dashboard"));

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
