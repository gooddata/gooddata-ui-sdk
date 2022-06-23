// (C) 2019-2022 GoodData Corporation
import * as React from "react";
import { useIntl } from "react-intl";
import { Icon } from "@gooddata/sdk-ui-kit";
import { ITheme } from "@gooddata/sdk-model";
import { withTheme } from "@gooddata/sdk-ui-theme-provider";

import { isMobileView } from "../../utils/responsive";

export interface IAttachmentProps {
    className?: string;
    label: string;
    fileName: string;
    theme?: ITheme;
}

const AttachmentNoWidgetsComponent = (props: IAttachmentProps) => {
    const { className = "", fileName, label, theme } = props;
    const intl = useIntl();
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

export const AttachmentNoWidgets = withTheme(AttachmentNoWidgetsComponent);
