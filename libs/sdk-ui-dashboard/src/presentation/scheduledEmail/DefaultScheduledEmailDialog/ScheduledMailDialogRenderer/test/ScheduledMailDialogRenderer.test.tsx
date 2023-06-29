// (C) 2019-2022 GoodData Corporation
import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import noop from "lodash/noop.js";
import { uriRef } from "@gooddata/sdk-model";
import { newInsightWidget } from "@gooddata/sdk-backend-base";
import { vi, describe, it, expect } from "vitest";

import {
    ScheduledMailDialogRenderer,
    IScheduledMailDialogRendererOwnProps,
} from "../ScheduledMailDialogRenderer.js";

import { getUserTimezone, ITimezone } from "../../utils/timezone.js";
import { useWorkspaceUsers } from "../../useWorkspaceUsers.js";
import { IntlWrapper } from "../../../../localization/IntlWrapper.js";

vi.mock("../../useWorkspaceUsers.js", () => ({
    useWorkspaceUsers: (): ReturnType<typeof useWorkspaceUsers> => ({
        status: "success",
        result: [],
        error: undefined,
    }),
}));

describe("ScheduledMailDialogRenderer", () => {
    const dashboard = uriRef("/dashboard");

    function renderComponent(customProps: Partial<IScheduledMailDialogRendererOwnProps> = {}) {
        const defaultProps: IScheduledMailDialogRendererOwnProps = {
            users: [],
            onCancel: noop,
            onSubmit: noop,
            dashboard,
            dashboardTitle: "Dashboard title",
            dashboardInsightWidgets: [],
            hasDefaultFilters: true,
            currentUser: {
                login: "user@gooddata.com",
                ref: uriRef("/gdc/user"),
                email: "user@gooddata.com",
                firstName: "John",
                lastName: "Doe",
            },
            dateFormat: "MM/dd/yyyy",
            enableKPIDashboardScheduleRecipients: true,
            canListUsersInProject: true,
            locale: "en-US",
            ...customProps,
        };

        return render(
            <IntlWrapper>
                <ScheduledMailDialogRenderer {...defaultProps} />
            </IntlWrapper>,
        );
    }

    it("should render timezone", () => {
        renderComponent();
        expect(screen.getByText("First occurrence:")).toBeInTheDocument();

        const timezone: ITimezone = getUserTimezone();
        expect(screen.getByText(timezone.title)).toBeInTheDocument();
    });

    it("should trigger onCancel on click Cancel", () => {
        const onCancel = vi.fn();
        renderComponent({ onCancel });
        fireEvent.click(screen.getByText("Cancel"));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("should generate scheduled mail with default values", () => {
        vi.useFakeTimers().setSystemTime(new Date("2022-01-02 12:13").getTime());

        const onSubmit = vi.fn();

        renderComponent({ onSubmit });

        fireEvent.click(screen.getByText("Schedule"));

        expect(onSubmit.mock.calls[0][0]).toMatchObject({
            bcc: [],
            body: "Hello,\n\nYour scheduled email is ready. You can download the dashboard in attachments.",
            description: "Daily at 12:30 PM",
            subject: "Dashboard title",
            title: "Dashboard title",
            to: ["user@gooddata.com"],
            unlisted: true,
            when: {
                recurrence: "0:0:0:1*12:30:0",
                startDate: "2022-01-02",
            },
            attachments: [
                {
                    format: "pdf",
                    dashboard,
                },
            ],
        });

        vi.useRealTimers();
    });

    it("should generate scheduled mail with changed values", () => {
        vi.useFakeTimers().setSystemTime(new Date("2022-01-02 12:13").getTime());

        const onSubmit = vi.fn();
        renderComponent({ onSubmit });

        fireEvent.click(screen.getByText("12:30 PM"));
        fireEvent.click(screen.getByText("02:00 AM"));
        fireEvent.click(screen.getByText("Daily"));
        fireEvent.click(screen.getByText("Weekly on Sunday"));
        fireEvent.change(screen.getByPlaceholderText("Dashboard title"), {
            target: { value: "new subject" },
        });
        fireEvent.click(screen.getByText("Schedule"));

        expect(onSubmit.mock.calls[0][0]).toMatchObject({
            bcc: [],
            body: "Hello,\n\nYour scheduled email is ready. You can download the dashboard in attachments.",
            description: "Weekly on Sunday at 2:00 AM",
            subject: "new subject",
            title: "new subject",
            to: ["user@gooddata.com"],
            unlisted: true,
            when: {
                recurrence: "0:0:1*7:2:0:0",
                startDate: "2022-01-02",
            },
            attachments: [
                {
                    format: "pdf",
                    dashboard,
                },
            ],
        });

        vi.useRealTimers();
    });

    it("should render subject in schedule email dialog", () => {
        const onSubmit = vi.fn();
        renderComponent({ onSubmit, dashboardTitle: "test" });
        expect(screen.getByPlaceholderText("test")).toBeInTheDocument();
    });

    describe("default attachment", () => {
        const widgetUri1 = "/widget/uri1";
        const widgetUri2 = "/widget/uri2";
        const widgetRef1 = uriRef(widgetUri1);
        const widgetRef2 = uriRef(widgetUri2);
        const insightWidget1 = newInsightWidget(uriRef("/insight/uri1"), (w) =>
            w.title("Widget 1").ref(widgetRef1).uri(widgetUri1),
        );
        const insightWidget2 = newInsightWidget(uriRef("/insight/uri2"), (w) =>
            w.title("Widget 2").ref(widgetRef2).uri(widgetUri2),
        );

        it("should not render default csv attachment selected when FF is false", () => {
            renderComponent({
                enableWidgetExportScheduling: false,
                defaultAttachment: widgetRef2,
                dashboardInsightWidgets: [insightWidget1, insightWidget2],
            });

            expect(screen.queryByLabelText("dashboard-attachment")).not.toBeInTheDocument();
        });

        it("should not render default csv attachment selected when default attachment is not provided", () => {
            renderComponent({
                enableWidgetExportScheduling: true,
                dashboardInsightWidgets: [insightWidget1, insightWidget2],
            });

            const attachment = screen.getByLabelText("dashboard-attachment");
            expect(within(attachment).getByText("pdf")).toBeInTheDocument();
            expect(within(attachment).getByText("Dashboard title")).toBeInTheDocument();
        });

        it("should not render default csv attachment selected when default attachment is not valid", () => {
            renderComponent({
                enableWidgetExportScheduling: true,
                defaultAttachment: uriRef("invalidWidgetUri"),
                dashboardInsightWidgets: [insightWidget1, insightWidget2],
            });

            const attachment = screen.getByLabelText("dashboard-attachment");
            expect(within(attachment).getByText("pdf")).toBeInTheDocument();
            expect(within(attachment).getByText("Dashboard title")).toBeInTheDocument();
        });

        it("should render default csv attachment selected when provided", () => {
            renderComponent({
                enableWidgetExportScheduling: true,
                defaultAttachment: widgetRef2,
                dashboardInsightWidgets: [insightWidget1, insightWidget2],
            });

            const attachment = screen.getByLabelText("dashboard-attachment");
            expect(within(attachment).getByText("csv")).toBeInTheDocument();
            expect(within(attachment).getByText("Widget 2")).toBeInTheDocument();
        });
    });
});
