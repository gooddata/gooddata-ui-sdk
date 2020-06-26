// (C) 2020 GoodData Corporation
import * as React from "react";
import { FormattedMessage, injectIntl, WrappedComponentProps } from "react-intl";

interface IDocumentationLinkOwnProps {
    url: string;
}

type IDocumentationLinkProps = IDocumentationLinkOwnProps & WrappedComponentProps;

const DocumentationLink = ({ url }: IDocumentationLinkProps) => (
    <div className="gd-measure-custom-format-dialog-section gd-measure-custom-format-dialog-section-help">
        <a
            className="gd-measure-format-button s-custom-format-dialog-documentation-link"
            target="_blank"
            href={url}
        >
            <div className="icon-circle-question gd-measure-format-button-icon-left" />
            <span>
                <FormattedMessage id="measureNumberCustomFormatDialog.howToFormat" />
            </span>
        </a>
    </div>
);

export default injectIntl(DocumentationLink);
