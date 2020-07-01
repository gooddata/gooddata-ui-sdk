// (C) 2020 GoodData Corporation
import * as React from "react";
import classNames from "classnames";
import { FormattedMessage } from "react-intl";
import { ISeparators } from "@gooddata/sdk-ui";

import PreviewRows from "../shared/PreviewRows";

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
                    className={classNames(
                        "s-custom-format-dialog-extended-preview-button gd-measure-format-button",
                        {
                            hidden: expanded,
                        },
                    )}
                    onClick={this.openExtendedPreview}
                >
                    <div className="icon-navigateright gd-measure-format-button-icon-left" />
                    <span>
                        <FormattedMessage id="measureNumberCustomFormatDialog.extendedPreview.button" />
                    </span>
                </div>
                {expanded && <PreviewRows format={format} separators={separators} />}
            </div>
        );
    }

    private openExtendedPreview = () => {
        this.setState({ expanded: true });
    };
}
