// (C) 2020-2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { FormattedMessage } from "react-intl";
import { ISeparators } from "@gooddata/sdk-ui";

import PreviewRows from "../shared/PreviewRows.js";

interface IExtendedPreviewState {
    expanded: boolean;
}

interface IExtendedPreviewProps {
    format: string;
    separators?: ISeparators;
}

export class ExtendedPreview extends React.Component<IExtendedPreviewProps, IExtendedPreviewState> {
    public state: IExtendedPreviewState = {
        expanded: false,
    };

    public render() {
        const { expanded } = this.state;
        const { format, separators } = this.props;

        return (
            <div className="gd-measure-format-extended-preview s-custom-format-dialog-extended-preview">
                <div
                    className={cx("s-custom-format-dialog-extended-preview-button gd-measure-format-button", {
                        hidden: expanded,
                    })}
                    onClick={this.openExtendedPreview}
                >
                    <div className="gd-icon-navigateright gd-measure-format-button-icon-left" />
                    <span>
                        <FormattedMessage id="measureNumberCustomFormatDialog.extendedPreview.button" />
                    </span>
                </div>
                {expanded ? <PreviewRows format={format} separators={separators} /> : null}
            </div>
        );
    }

    private openExtendedPreview = (): void => {
        this.setState({ expanded: true });
    };
}
