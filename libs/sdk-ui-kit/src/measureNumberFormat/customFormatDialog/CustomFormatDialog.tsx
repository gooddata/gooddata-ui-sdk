// (C) 2020-2022 GoodData Corporation
import React from "react";
import { WrappedComponentProps } from "react-intl";
import { ISeparators } from "@gooddata/sdk-ui";

import { IPositioning, SnapPoint } from "../../typings/positioning.js";
import { positioningToAlignPoints } from "../../utils/positioning.js";
import { Button } from "../../Button/index.js";
import { Overlay } from "../../Overlay/index.js";
import { IFormatTemplate } from "../typings.js";
import Preview from "./previewSection/Preview.js";
import FormatInput from "./FormatInput.js";
import DocumentationLink from "./DocumentationLink.js";

interface ICustomFormatDialogOwnProps {
    onApply: (formatString: string) => void;
    onCancel: () => void;
    formatString: string;
    documentationLink?: string;
    anchorEl?: string | HTMLElement;
    positioning?: IPositioning[];
    separators?: ISeparators;
    locale?: string;
    templates?: ReadonlyArray<IFormatTemplate>;
}

interface ICustomFormatDialogState {
    format: string;
}

type ICustomFormatDialogProps = ICustomFormatDialogOwnProps & WrappedComponentProps;

export class CustomFormatDialog extends React.PureComponent<
    ICustomFormatDialogProps,
    ICustomFormatDialogState
> {
    public static defaultProps: Pick<ICustomFormatDialogProps, "positioning"> = {
        positioning: [
            { snapPoints: { parent: SnapPoint.CenterRight, child: SnapPoint.CenterLeft } },
            { snapPoints: { parent: SnapPoint.TopRight, child: SnapPoint.TopLeft } },
            { snapPoints: { parent: SnapPoint.BottomRight, child: SnapPoint.BottomLeft } },
        ],
    };

    public readonly state: Readonly<ICustomFormatDialogState> = {
        format: this.props.formatString || "",
    };

    public render() {
        const { anchorEl, positioning, onCancel, separators, templates, documentationLink, intl } =
            this.props;
        const { format } = this.state;

        return (
            <Overlay
                closeOnParentScroll={true}
                closeOnMouseDrag={true}
                closeOnOutsideClick={true}
                alignTo={anchorEl}
                alignPoints={positioningToAlignPoints(positioning!)} // positioning is declared in defaultProps so it is always defined
                onClose={onCancel}
            >
                <div className="gd-dropdown overlay">
                    <div className="gd-measure-custom-format-dialog-body s-custom-format-dialog-body">
                        <div className="gd-measure-custom-format-dialog-header">
                            <span>{intl.formatMessage({ id: "measureNumberCustomFormatDialog.title" })}</span>
                        </div>
                        <div className="gd-measure-custom-format-dialog-content">
                            <FormatInput
                                format={format}
                                templates={templates}
                                separators={separators}
                                onFormatChange={this.onFormatChange}
                            />
                            {documentationLink ? <DocumentationLink url={documentationLink} /> : null}
                            <Preview format={format} separators={separators} />
                        </div>
                        <div className="gd-measure-custom-format-dialog-footer">
                            <Button
                                className="gd-button-secondary gd-button-small s-custom-format-dialog-cancel"
                                onClick={onCancel}
                                value={intl.formatMessage({ id: "cancel" })}
                            />
                            <Button
                                className="gd-button-action gd-button-small s-custom-format-dialog-apply"
                                onClick={this.onApply}
                                value={intl.formatMessage({ id: "apply" })}
                                disabled={this.isApplyButtonDisabled()}
                            />
                        </div>
                    </div>
                </div>
            </Overlay>
        );
    }

    private onApply = () => {
        this.props.onApply(this.state.format);
    };

    private isApplyButtonDisabled = () =>
        this.props.formatString === this.state.format || this.state.format === "";

    private onFormatChange = (format: string) => {
        this.setState({ format });
    };
}
