// (C) 2019-2024 GoodData Corporation
import * as React from "react";
import { FormattedMessage } from "react-intl";

export interface IAttachmentsProps {
    dashboardTitle: string;
    dashboardSelected: boolean;
    onAttachmentsSelectionChanged(dashboardSelected: boolean): void;
}

const AttachmentItem: React.FC<{ format: string; children?: React.ReactNode }> = ({ format, children }) => (
    <div aria-label="dashboard-attachment" className="gd-dashboard-attachment s-gd-dashboard-attachment">
        <span className="gd-dashboard-attachment-format">{format}</span>
        <span className="gd-dashboard-attachment-name">{children}</span>
    </div>
);

export const Attachments = (props: IAttachmentsProps) => {
    const { dashboardTitle, dashboardSelected, onAttachmentsSelectionChanged } = props;

    return (
        <div className="gd-input-component gd-schedule-email-attachments s-schedule-email-attachments">
            <label className="gd-label">
                <FormattedMessage id="dialogs.schedule.email.attachments.label" />
            </label>
            <div className="gd-dashboard-attachment-list">
                <div className="gd-dashboard-attachment-list-content">
                    <label className="gd-schedule-mail-attachment-checkbox input-checkbox-label">
                        <input
                            type="checkbox"
                            className="input-checkbox"
                            checked={props.dashboardSelected}
                            onChange={() => onAttachmentsSelectionChanged(!dashboardSelected)}
                        />
                        <span className="input-label-text" />
                        <AttachmentItem format="pdf">
                            <span className="shortened-name">{dashboardTitle}</span>
                        </AttachmentItem>
                    </label>
                </div>
            </div>
        </div>
    );
};
