// (C) 2020-2025 GoodData Corporation
import React from "react";

import { FormattedMessage, WrappedComponentProps, injectIntl } from "react-intl";

interface IDocumentationLinkOwnProps {
    url: string;
}

type IDocumentationLinkProps = IDocumentationLinkOwnProps & WrappedComponentProps;

function DocumentationLink({ url }: IDocumentationLinkProps) {
    return (
        <div className="gd-measure-custom-format-dialog-section gd-measure-custom-format-dialog-section-help">
            <a
                aria-label="custom-format-documentation-link"
                className="gd-measure-format-button s-custom-format-dialog-documentation-link"
                target="_blank"
                rel="noreferrer noopener"
                href={url}
            >
                <div className="gd-icon-circle-question gd-measure-format-button-icon-left" />
                <span>
                    <FormattedMessage id="measureNumberCustomFormatDialog.howToFormat" />
                </span>
            </a>
        </div>
    );
}

export default injectIntl(DocumentationLink);
