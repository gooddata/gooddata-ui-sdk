// (C) 2019-2024 GoodData Corporation
import React, { useState } from "react";
import noop from "lodash/noop.js";
import { useIntl } from "react-intl";
import {
    ConfirmDialogBase,
    Overlay,
    ContentDivider,
    Button,
    EditableLabel,
    Hyperlink,
    RecurrenceForm,
    normalizeTime,
    Alignment,
} from "@gooddata/sdk-ui-kit";
import { Textarea } from "./components/Textarea.js";
import { Input } from "./components/Input.js";
import { Attachments } from "./components/Attachments/Attachments.js";
import { RecipientsSelect } from "./components/RecipientsSelect/RecipientsSelect.js";
import { IntlWrapper } from "../../localization/index.js";
import { DestinationSelect } from "./components/DestinationSelect/DestinationSelect.js";
import {
    selectLocale,
    useDashboardSelector,
    selectDateFormat,
    selectWeekStart,
    selectEnableScheduling,
    selectDashboardTitle,
    selectDashboardId,
    selectEntitlementMaxAutomationRecipients,
} from "../../../model/index.js";
import { IScheduledEmailDialogProps } from "../types.js";
import { invariant } from "ts-invariant";
import { getDefaultCronExpression, useEditScheduledEmail } from "./hooks/useEditScheduledEmail.js";
import { useSaveScheduledEmailToBackend } from "./hooks/useSaveScheduledEmailToBackend.js";
import isEqual from "lodash/isEqual.js";
import { isExportDefinitionDashboardContent } from "@gooddata/sdk-model";
import { getTimezoneByIdentifier, TIMEZONE_DEFAULT } from "./utils/timezone.js";
import { DASHBOARD_TITLE_MAX_LENGTH } from "../../constants/index.js";
import parseISO from "date-fns/parseISO/index.js";

const MAX_MESSAGE_LENGTH = 200;
const MAX_SUBJECT_LENGTH = 200;

export function ScheduledMailDialogRenderer(props: IScheduledEmailDialogProps) {
    const { onCancel, isVisible, editSchedule, users, webhooks } = props;
    const intl = useIntl();
    const dashboardId = useDashboardSelector(selectDashboardId);
    const locale = useDashboardSelector(selectLocale);
    const dashboardTitle = useDashboardSelector(selectDashboardTitle);
    const dateFormat = useDashboardSelector(selectDateFormat);
    const weekStart = useDashboardSelector(selectWeekStart);
    const enableKPIDashboardSchedule = useDashboardSelector(selectEnableScheduling);
    const maxAutomationsRecipientsEntitlement = useDashboardSelector(
        selectEntitlementMaxAutomationRecipients,
    );
    const maxAutomationsRecipients = parseInt(maxAutomationsRecipientsEntitlement?.value ?? "0", 10);

    const { alignPoints, onAlign } = useScheduledEmailDialogAlignment();
    const {
        automation,
        originalAutomation,
        onAttachmentsChange,
        onDestinationChange,
        onMessageChange,
        onRecipientsChange,
        onRecurrenceChange,
        onSubjectChange,
        onTitleChange,
    } = useEditScheduledEmail(props);
    const { handleSaveScheduledEmail, isSavingScheduledEmail } = useSaveScheduledEmailToBackend(
        automation,
        props,
    );

    const isDashboardExportSelected =
        automation.exportDefinitions?.some((exportDefinition) => {
            if (isExportDefinitionDashboardContent(exportDefinition.requestPayload.content)) {
                return exportDefinition.requestPayload.content.dashboard === dashboardId;
            }

            return false;
        }) ?? false;

    const isValid = (automation.recipients?.length ?? 0) <= maxAutomationsRecipients;
    const isSubmitDisabled = !isValid || (editSchedule && isEqual(originalAutomation, automation));

    const startDate = parseISO(
        automation.schedule?.firstRun ?? normalizeTime(new Date(), undefined, 60).toISOString(),
    );

    // trigger the invariant only if the user tries to open the dialog
    if (isVisible) {
        invariant(
            enableKPIDashboardSchedule,
            "Feature flag enableKPIDashboardSchedule must be enabled to make ScheduledMailDialog work properly.",
        );
    }

    if (!isVisible) {
        return null;
    }

    return (
        <Overlay
            alignPoints={alignPoints}
            className="gd-schedule-email-dialog-overlay"
            isModal={true}
            positionType="fixed"
            onAlign={onAlign}
        >
            <ConfirmDialogBase
                className="gd-schedule-email-dialog s-gd-schedule-email-dialog"
                isPositive={true}
                cancelButtonText={intl.formatMessage({ id: "cancel" })}
                submitButtonText={
                    editSchedule
                        ? intl.formatMessage({ id: `dialogs.schedule.email.save` })
                        : intl.formatMessage({ id: `dialogs.schedule.email.create` })
                }
                showProgressIndicator={isSavingScheduledEmail}
                footerLeftRenderer={() => (
                    <div className="gd-schedule-email-dialog-footer-link">
                        <Hyperlink
                            text={intl.formatMessage({ id: "dialogs.schedule.email.footer.title" })}
                            href=""
                            iconClass="gd-icon-circle-question"
                        />
                    </div>
                )}
                isSubmitDisabled={isSubmitDisabled || isSavingScheduledEmail}
                submitOnEnterKey={false}
                onCancel={onCancel}
                onSubmit={handleSaveScheduledEmail}
                headline={undefined}
                headerLeftButtonRenderer={() => (
                    <div className="gd-schedule-email-dialog-header">
                        <Button
                            className="gd-button-primary gd-button-icon-only gd-icon-navigateleft s-schedule-email-dialog-button"
                            onClick={onCancel}
                        />
                        <EditableLabel
                            value={automation.title ?? ""}
                            onSubmit={noop}
                            onChange={onTitleChange}
                            maxRows={1}
                            maxLength={40}
                            className="gd-schedule-email-dialog-title s-gd-schedule-email-dialog-title"
                            autofocus={!automation.title}
                            placeholder={intl.formatMessage({
                                id: "dialogs.schedule.email.title.placeholder",
                            })}
                        />
                    </div>
                )}
            >
                <div className="gd-schedule-mail-dialog-content-wrapper">
                    <ContentDivider className="gd-divider-with-margin gd-divider-full-row" />
                    <RecurrenceForm
                        startDate={startDate}
                        cronExpression={automation.schedule?.cron ?? getDefaultCronExpression(startDate)}
                        timezone={
                            (getTimezoneByIdentifier(automation.schedule?.timezone) ?? TIMEZONE_DEFAULT).title
                        }
                        dateFormat={dateFormat ?? "MM/dd/yyyy"}
                        locale={locale}
                        weekStart={weekStart}
                        onChange={onRecurrenceChange}
                    />
                    <ContentDivider className="gd-divider-with-margin" />
                    <DestinationSelect
                        webhooks={webhooks}
                        selectedItemId={automation.webhook}
                        onChange={onDestinationChange}
                    />
                    <ContentDivider className="gd-divider-with-margin" />
                    <RecipientsSelect
                        users={users}
                        value={automation.recipients ?? []}
                        originalValue={originalAutomation.recipients || []}
                        onChange={onRecipientsChange}
                        allowEmptySelection
                        maxRecipients={maxAutomationsRecipients}
                    />
                    <Input
                        className="gd-schedule-email-dialog-subject s-gd-schedule-email-dialog-subject"
                        label={intl.formatMessage({ id: "dialogs.schedule.email.subject.label" })}
                        maxlength={MAX_SUBJECT_LENGTH}
                        placeholder={
                            dashboardTitle.length > DASHBOARD_TITLE_MAX_LENGTH
                                ? dashboardTitle.substring(0, DASHBOARD_TITLE_MAX_LENGTH)
                                : dashboardTitle
                        }
                        value={automation.details?.subject ?? ""}
                        onChange={onSubjectChange}
                    />
                    <Textarea
                        className="gd-schedule-email-dialog-message s-gd-schedule-email-dialog-message"
                        label={intl.formatMessage({ id: "dialogs.schedule.email.message.label" })}
                        maxlength={MAX_MESSAGE_LENGTH}
                        placeholder={intl.formatMessage({
                            id: "dialogs.schedule.email.message.placeholder",
                        })}
                        rows={3}
                        onChange={onMessageChange}
                        value={automation.details?.message ?? ""}
                    />
                    <Attachments
                        dashboardTitle={dashboardTitle}
                        dashboardSelected={isDashboardExportSelected}
                        onAttachmentsSelectionChanged={onAttachmentsChange}
                    />
                    <ContentDivider className="gd-divider-with-margin gd-divider-full-row" />
                </div>
            </ConfirmDialogBase>
        </Overlay>
    );
}

/**
 * @alpha
 */
export const DefaultScheduledEmailDialog: React.FC<IScheduledEmailDialogProps> = (props) => {
    const locale = useDashboardSelector(selectLocale);

    return (
        <IntlWrapper locale={locale}>
            <ScheduledMailDialogRenderer {...props} />
        </IntlWrapper>
    );
};

export function useScheduledEmailDialogAlignment() {
    const [alignState, setAlignState] = useState("cc cc");
    const alignPoints = [
        {
            align: alignState,
        },
    ];
    const onAlign = (alignment: Alignment) => {
        if (alignment.top < 0) {
            setAlignState("tc tc");
        } else {
            setAlignState("cc cc");
        }
    };

    return { alignPoints, onAlign };
}
