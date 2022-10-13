// (C) 2019-2022 GoodData Corporation
import React from "react";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import noop from "lodash/noop";
import { IUser, uriRef } from "@gooddata/sdk-model";
import { newInsightWidget } from "@gooddata/sdk-backend-base";

import {
    ScheduledMailDialogRenderer,
    IScheduledMailDialogRendererOwnProps,
} from "../ScheduledMailDialogRenderer";

import { getUserTimezone, ITimezone } from "../../utils/timezone";
import { useWorkspaceUsers } from "../../useWorkspaceUsers";
import { IntlWrapper } from "../../../../localization/IntlWrapper";

jest.mock("../../useWorkspaceUsers", () => ({
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

    it("should trigger onCancel on click Cancel", async () => {
        const onCancel = jest.fn();
        renderComponent({ onCancel });
        await userEvent.click(screen.getByText("Cancel"));
        await waitFor(() => {
            expect(onCancel).toHaveBeenCalledTimes(1);
        });
    });

    it("should generate scheduled mail with default values", async () => {
        const user = userEvent.setup({
            advanceTimers: () => jest.runOnlyPendingTimers(),
        });
        const onSubmit = jest.fn();
        jest.useFakeTimers().setSystemTime(new Date("2022-01-02 12:13").getTime());

        renderComponent({ onSubmit });

        await user.click(screen.getByText("Schedule"));

        await waitFor(() => {
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
        });

        jest.useRealTimers();
    });

    it("should generate scheduled mail with changed values", async () => {
        const user = userEvent.setup({
            advanceTimers: () => jest.runOnlyPendingTimers(),
        });
        jest.useFakeTimers().setSystemTime(new Date("2022-01-02 12:13").getTime());
        const onSubmit = jest.fn();
        const currentUser: IUser = {
            login: "login.email@gooddata.com",
            ref: uriRef("/gdc/user"),
            email: "user@gooddata.com",
            firstName: "John",
            lastName: "Doe",
        };
        renderComponent({ onSubmit, currentUser });

        await user.click(screen.getByText("12:30 PM"));
        await user.click(screen.getByText("02:00 AM"));
        await user.click(screen.getByText("Daily"));
        await user.click(screen.getByText("Weekly on Sunday"));
        await user.type(screen.getByPlaceholderText("Dashboard title"), "new subject");
        await user.click(screen.getByText("Schedule"));

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
        jest.useRealTimers();
    });

    it("should render subject in schedule email dialog", () => {
        const onSubmit = jest.fn();
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
