// (C) 2025 GoodData Corporation

import { type ReactNode } from "react";

import { FormattedMessage } from "react-intl";

export function AttachmentsWrapper({ children }: { children: ReactNode }) {
    return (
        <fieldset className="gd-input-component gd-notifications-channels-attachments s-notifications-channels-attachments">
            <legend className="gd-label">
                <FormattedMessage id="dialogs.schedule.email.attachments.label" />
            </legend>
            {children}
        </fieldset>
    );
}
