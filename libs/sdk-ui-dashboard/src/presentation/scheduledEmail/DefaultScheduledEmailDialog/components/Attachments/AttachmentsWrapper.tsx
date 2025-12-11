// (C) 2025 GoodData Corporation

import { ReactNode } from "react";

import { FormattedMessage } from "react-intl";

import { AUTOMATION_ATTACHMENTS_GROUP_LABEL_ID } from "../../../../constants/automations.js";

export function AttachmentsWrapper({ children }: { children: ReactNode }) {
    return (
        <fieldset className="gd-input-component gd-notifications-channels-attachments s-notifications-channels-attachments">
            <div className="gd-label" id={AUTOMATION_ATTACHMENTS_GROUP_LABEL_ID}>
                <FormattedMessage id="dialogs.schedule.email.attachments.label" />
            </div>
            {children}
        </fieldset>
    );
}
