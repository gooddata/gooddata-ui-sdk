// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { IntlWrapper } from "../localization/IntlWrapper.js";

import { DefaultDeleteDialog } from "./DefaultDeleteDialog.js";
import { type IDeleteDialogProps } from "./types.js";

const DASHBOARD_TITLE = "My dashboard";

const PLAIN_MESSAGE = `The dashboard ${DASHBOARD_TITLE} will be permanently deleted.`;

function objectsMessage(objects: string) {
    return `The dashboard ${DASHBOARD_TITLE} and ${objects} associated with it will be permanently deleted.`;
}

function renderComponent(props: Partial<IDeleteDialogProps> = {}) {
    const defaultProps: IDeleteDialogProps = {
        isVisible: true,
        dashboardTitle: DASHBOARD_TITLE,
        showAlertsMessage: false,
        showSchedulesMessage: false,
        onCancel: () => {},
        onDelete: () => {},
    };

    return render(
        <IntlWrapper>
            <DefaultDeleteDialog {...defaultProps} {...props} />
        </IntlWrapper>,
    );
}

function getDialog(): HTMLElement {
    return document.querySelector(".s-delete_dashboard_dialog") as HTMLElement;
}

describe("DefaultDeleteDialog", () => {
    it("should render nothing when not visible", () => {
        renderComponent({ isVisible: false });

        expect(screen.queryByText("Delete dashboard?")).not.toBeInTheDocument();
    });

    it("should only announce the dashboard itself when nothing else is deleted with it", () => {
        // MC-4607: drilling used to be claimed unconditionally, so deleting a dashboard with
        // nothing associated still promised to delete something.
        renderComponent();

        expect(getDialog()).toHaveTextContent(PLAIN_MESSAGE);
    });

    it.each([
        ["alerts", { showAlertsMessage: true }],
        ["scheduled exports", { showSchedulesMessage: true }],
        ["alerts, scheduled exports", { showAlertsMessage: true, showSchedulesMessage: true }],
    ])("should name %s as deleted along with the dashboard", (objects, props) => {
        renderComponent(props);

        expect(getDialog()).toHaveTextContent(objectsMessage(objects));
    });

    it.each([
        ["nothing else is deleted", {}],
        ["other objects are deleted", { showAlertsMessage: true }],
    ])("should emphasize the dashboard name when %s", (_label, props) => {
        renderComponent(props);

        expect(getDialog().querySelector("strong")).toHaveTextContent(DASHBOARD_TITLE);
    });

    it.each([
        ["nothing else is deleted", {}],
        ["other objects are deleted", { showAlertsMessage: true, showSchedulesMessage: true }],
    ])("should never mention drilling when %s", (_label, props) => {
        renderComponent(props);

        expect(getDialog().textContent).not.toMatch(/drill/i);
    });

    it("should delete on submit", () => {
        const onDelete = vi.fn();
        renderComponent({ onDelete });

        fireEvent.click(screen.getByText("Delete"));

        expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it("should cancel on cancel", () => {
        const onCancel = vi.fn();
        renderComponent({ onCancel });

        fireEvent.click(screen.getByText("Cancel"));

        expect(onCancel).toHaveBeenCalledTimes(1);
    });
});
