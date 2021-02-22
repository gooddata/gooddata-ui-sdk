// (C) 2019-2020 GoodData Corporation
import React from "react";
import { mount, ReactWrapper } from "enzyme";
import noop from "lodash/noop";
import { uriRef } from "@gooddata/sdk-model";
import { IScheduledMail } from "@gooddata/sdk-backend-spi";

import { RecipientsSelect } from "../RecipientsSelect/RecipientsSelect";
import {
    ScheduledMailDialogRenderer,
    IScheduledMailDialogRendererProps,
} from "../ScheduledMailDialogRenderer";
import { DateTime } from "../DateTime";
import { getUserTimezone, ITimezone } from "../../utils/timezone";
import { useWorkspaceUsers } from "../../../hooks/internal";
import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider";

jest.mock("../../../hooks/internal/useWorkspaceUsers", () => ({
    useWorkspaceUsers: (): ReturnType<typeof useWorkspaceUsers> => ({
        status: "success",
        result: [],
        error: undefined,
    }),
}));

describe("ScheduledMailDialogRenderer", () => {
    const SUBJECT_REGEX = /^ - (0[1-9]|[1][012])-(0[1-9]|[12][0-9]|3[01])-(19|20)\d\d$/;
    const DATE_FORMART_REGEX = /^(19|20)\d\d-(0[1-9]|[1][012])-(0[1-9]|[12][0-9]|3[01])$/;
    const dashboard = uriRef("/dashboard");

    function renderComponent(customProps: Partial<IScheduledMailDialogRendererProps> = {}) {
        const defaultProps = {
            onCancel: noop,
            onSubmit: noop,
            dashboard,
            dashboardTitle: "",
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
            workspace: "project",
            ...customProps,
        };

        return mount(
            <InternalIntlWrapper>
                <ScheduledMailDialogRenderer {...defaultProps} />
            </InternalIntlWrapper>,
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

    function userEntersSubject(wrapper: ReactWrapper, subject: string) {
        const input: ReactWrapper = wrapper.find(".s-gd-schedule-email-dialog-subject input");
        input.getDOMNode().setAttribute("value", subject);
        input.simulate("change");
    }

    it("should render component", () => {
        const component = renderComponent();
        expect(component).toExist();
    });

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

    it("should trigger onSubmit on click Export", () => {
        const onSubmit = jest.fn();
        const wrapper = renderComponent({ onSubmit });

        clickButtonSchedule(wrapper);

        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it("should format date to platform format before saving", () => {
        const onSubmit = jest.fn();
        const wrapper = renderComponent({ onSubmit });

        clickButtonSchedule(wrapper);
        const actualScheduleEmailObject: IScheduledMail = onSubmit.mock.calls[0][0];
        const startDate: string = actualScheduleEmailObject.when.startDate;
        expect(DATE_FORMART_REGEX.test(startDate)).toBe(true);
    });

    it("should saving schedule email with kpiDashboardAttachment", () => {
        const onSubmit = jest.fn();
        const wrapper = renderComponent({ onSubmit });

        clickButtonSchedule(wrapper);

        const actualScheduleEmailObject: IScheduledMail = onSubmit.mock.calls[0][0];
        const attachments = actualScheduleEmailObject.attachments;
        expect(attachments).toEqual([
            {
                format: "pdf",
                dashboard,
            },
        ]);
    });

    it("should saving schedule email with summary message", () => {
        const onSubmit = jest.fn();
        const wrapper = renderComponent({ onSubmit });
        selectTime(wrapper, "02", "00", "am");

        clickButtonSchedule(wrapper);
        const actualScheduleEmailObject: IScheduledMail = onSubmit.mock.calls[0][0];
        const summary = actualScheduleEmailObject.description;
        expect(summary).toBe("Daily at 2:00 AM");
    });

    it("should save schedule email with new subject", () => {
        const onSubmit = jest.fn();
        const wrapper = renderComponent({ onSubmit });

        userEntersSubject(wrapper, "new subject");
        clickButtonSchedule(wrapper);
        const actualScheduleEmailObject: IScheduledMail = onSubmit.mock.calls[0][0];
        const actualSubject = actualScheduleEmailObject.subject;
        expect(actualSubject).toBe("new subject");
    });

    it("should save schedule email with default subject", () => {
        const onSubmit = jest.fn();
        const wrapper = renderComponent({ onSubmit });

        userEntersSubject(wrapper, "");
        clickButtonSchedule(wrapper);
        const actualScheduleEmailObject: IScheduledMail = onSubmit.mock.calls[0][0];
        const actualSubject = actualScheduleEmailObject.subject;
        expect(SUBJECT_REGEX.test(actualSubject)).toBe(true);
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
        expect(valueInput.length).toBeLessThan(255);
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
        expect(valueInput.length).toBe(255);
    });
});
