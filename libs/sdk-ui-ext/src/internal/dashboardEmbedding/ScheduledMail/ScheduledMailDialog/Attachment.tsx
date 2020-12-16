// (C) 2019-2020 GoodData Corporation
import * as React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";

import { isMobileView } from "../utils/responsive";

interface IAttachmentOwnProps {
    className?: string;
    label: string;
    fileName: string;
}

export type IAttachmentProps = IAttachmentOwnProps & WrappedComponentProps;

const RenderAttachment = (props: IAttachmentProps) => {
    const { className = "", fileName, intl, label } = props;
    const classNames = `gd-input-component gd-attachment-component ${className}`;

    const nameOfAttachment = isMobileView() ? "PDF" : fileName;
    const textFilters = intl.formatMessage({ id: "dialogs.schedule.email.attachment.filter" });

    return (
        <div className={classNames}>
            <label className="gd-label">{label}</label>
            <span>{`${nameOfAttachment} ${textFilters}`}</span>
        </div>
    );
};

export const Attachment = injectIntl(RenderAttachment);
