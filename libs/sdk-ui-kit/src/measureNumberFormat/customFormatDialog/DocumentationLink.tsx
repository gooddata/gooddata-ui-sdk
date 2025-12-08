// (C) 2020-2025 GoodData Corporation

import { FormattedMessage } from "react-intl";

interface IDocumentationLinkProps {
    url: string;
}

export function DocumentationLink({ url }: IDocumentationLinkProps) {
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
