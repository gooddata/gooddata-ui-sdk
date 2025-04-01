// (C) 2025 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";

export const AttachmentsWrapper: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    return (
        <fieldset className="gd-input-component gd-notifications-channels-attachments s-notifications-channels-attachments">
            <legend className="gd-label">
                <FormattedMessage id="dialogs.schedule.email.attachments.label" />
            </legend>
            {children}
        </fieldset>
    );
};
