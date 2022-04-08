// (C) 2019-2022 GoodData Corporation
import React from "react";
import { mount, ReactWrapper } from "enzyme";
import noop from "lodash/noop";
import { uriRef } from "@gooddata/sdk-model";

import { RecipientsSelect } from "../RecipientsSelect/RecipientsSelect";
import {
    ScheduledMailDialogRenderer,
    IScheduledMailDialogRendererOwnProps,
} from "../ScheduledMailDialogRenderer";
import { DateTime } from "../DateTime";
import { getUserTimezone, ITimezone } from "../../utils/timezone";
import { useWorkspaceUsers } from "../../useWorkspaceUsers";
import { IntlWrapper } from "../../../../localization/IntlWrapper";
import { newInsightWidget } from "@gooddata/sdk-backend-base";

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

        return mount(
            <IntlWrapper>
                <ScheduledMailDialogRenderer {...defaultProps} />
            </IntlWrapper>,
        );
    }

    function clickButtonCancel(wrapper: ReactWrapper) {
        wrapper.find("button.s-cancel").simulate("click");
    }

    function clickButtonSchedule(wrapper: ReactWrapper) {
        wrapper.find("button.s-schedule").simulate("click");
    }

    function selectTime(wrapper: ReactWrapper, hour: string, minute: string, subfix: string) {
        wrapper.find(".gd-schedule-email-dialog-datetime-time button").simulate("click");
        wrapper.find(`.s-${hour}_${minute}_${subfix}`).simulate("click");
    }

    function selectRepeatPeriod(wrapper: ReactWrapper, period: string) {
        wrapper.find(".s-gd-schedule-email-dialog-repeat-type button").simulate("click");
        wrapper.find(`.s-${period}`).simulate("click");
    }

    function userEntersSubject(wrapper: ReactWrapper, subject: string) {
        const input: ReactWrapper = wrapper.find(".s-gd-schedule-email-dialog-subject input");
        input.getDOMNode().setAttribute("value", subject);
        input.simulate("change");
    }

    it("should render timezone", () => {
        const component = renderComponent();
        const dateTimeComponent = component.find(DateTime);
        expect(dateTimeComponent).toExist();

        const timezone: ITimezone = getUserTimezone();
        expect(dateTimeComponent.find(".s-gd-schedule-email-dialog-datetime-timezone").text()).toBe(
            timezone.title,
        );
    });

    it("should trigger onCancel on click Cancel", () => {
        const onCancel = jest.fn();
        const wrapper = renderComponent({ onCancel });

        clickButtonCancel(wrapper);

        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("should generate scheduled mail with default values", () => {
        const onSubmit = jest.fn();
        jest.useFakeTimers().setSystemTime(new Date("2022-01-02 12:13").getTime());

        const wrapper = renderComponent({ onSubmit });

        clickButtonSchedule(wrapper);

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

        jest.useRealTimers();
    });

    it("should generate scheduled mail with changed values", () => {
        jest.useFakeTimers().setSystemTime(new Date("2022-01-02 12:13").getTime());
        const onSubmit = jest.fn();
        const wrapper = renderComponent({ onSubmit });

        selectTime(wrapper, "02", "00", "am");
        selectRepeatPeriod(wrapper, "weekly_on_sunday");
        userEntersSubject(wrapper, "new subject");
        clickButtonSchedule(wrapper);

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

    it("should render recipient component in schedule email dialog", () => {
        const component = renderComponent();
        expect(component.find(RecipientsSelect)).toHaveLength(1);
    });

    it("should render subject in schedule email dialog", () => {
        const onSubmit = jest.fn();
        const wrapper = renderComponent({ onSubmit, dashboardTitle: "test" });
        const subjectInput = wrapper.find(".s-gd-schedule-email-dialog-subject input");
        const valueInput = subjectInput.prop("placeholder");
        expect(valueInput?.length).toBeLessThan(255);
    });

    it("should render subject in schedule email dialog with long text", () => {
        const onSubmit = jest.fn();
        const wrapper = renderComponent({
            onSubmit,
            dashboardTitle:
                "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        });
        const subjectInput = wrapper.find(".s-gd-schedule-email-dialog-subject input");
        const valueInput = subjectInput.prop("placeholder");
        expect(valueInput?.length).toBe(255);
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
            const wrapper = renderComponent({
                enableWidgetExportScheduling: false,
                defaultAttachment: widgetRef2,
                dashboardInsightWidgets: [insightWidget1, insightWidget2],
            });

            expect(wrapper.find(".s-gd-dashboard-attachment")).not.toExist();
        });

        it("should not render default csv attachment selected when default attachment is not provided", () => {
            const wrapper = renderComponent({
                enableWidgetExportScheduling: true,
                dashboardInsightWidgets: [insightWidget1, insightWidget2],
            });

            expect(wrapper.find(".s-gd-dashboard-attachment").text()).toEqual("pdfDashboard title");
        });

        it("should not render default csv attachment selected when default attachment is not valid", () => {
            const wrapper = renderComponent({
                enableWidgetExportScheduling: true,
                defaultAttachment: uriRef("invalidWidgetUri"),
                dashboardInsightWidgets: [insightWidget1, insightWidget2],
            });

            expect(wrapper.find(".s-gd-dashboard-attachment").text()).toEqual("pdfDashboard title");
        });

        it("should render default csv attachment selected when provided", () => {
            const wrapper = renderComponent({
                enableWidgetExportScheduling: true,
                defaultAttachment: widgetRef2,
                dashboardInsightWidgets: [insightWidget1, insightWidget2],
            });

            expect(wrapper.find(".s-gd-dashboard-attachment").text()).toEqual("csvWidget 2");
        });
    });
});
