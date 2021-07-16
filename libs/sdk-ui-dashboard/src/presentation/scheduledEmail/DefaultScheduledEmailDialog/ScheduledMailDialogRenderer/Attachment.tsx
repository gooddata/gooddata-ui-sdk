// (C) 2019-2020 GoodData Corporation
import * as React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { Icon } from "@gooddata/sdk-ui-kit";
import { ITheme } from "@gooddata/sdk-backend-spi";
import { withTheme } from "@gooddata/sdk-ui-theme-provider";

import { isMobileView } from "../utils/responsive";

interface IAttachmentOwnProps {
    className?: string;
    label: string;
    fileName: string;
    theme?: ITheme;
}

export type IAttachmentProps = IAttachmentOwnProps & WrappedComponentProps;

const RenderAttachment = (props: IAttachmentProps) => {
    const { className = "", fileName, intl, label, theme } = props;
    const classNames = `gd-input-component gd-attachment-component ${className}`;

    const nameOfAttachment = isMobileView() ? "PDF" : fileName;
    const textFilters = intl.formatMessage({ id: "dialogs.schedule.email.attachment.filter" });

    return (
        <div className={classNames}>
            <label className="gd-label">{label}</label>
            <span className="gd-icon-pdf">
                <Icon.Pdf width={11} height={14} color={theme?.palette?.complementary?.c8} />
            </span>
            <span className="s-attachment-name">{`${nameOfAttachment} ${textFilters}`}</span>
        </div>
    );
};

export const Attachment = injectIntl(withTheme(RenderAttachment));
