// (C) 2020 GoodData Corporation
import React from "react";
import cx from "classnames";
import noop from "lodash/noop";
import { Button } from "../Button";
import { DialogBase } from "./DialogBase";
import { IConfirmDialogBaseProps } from "./typings";

/**
 * @internal
 */
export class ConfirmDialogBase extends DialogBase<IConfirmDialogBaseProps> {
    static defaultProps: Partial<IConfirmDialogBaseProps> = {
        displayCloseButton: true,
        onCancel: noop,
        onSubmit: noop,
        isSubmitDisabled: false,
    };

    onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
        this.onKeyDown(event);
    };

    render(): JSX.Element {
        const dialogClasses = cx(
            {
                "gd-confirm": true,
            },
            this.getDialogClasses(),
        );

        const submitButtonClasses = cx({
            "s-dialog-submit-button": true,
            "gd-button-action": this.props.isPositive,
            "gd-button-negative": !this.props.isPositive,
        });

        return (
            <div tabIndex={0} onKeyDown={this.onKeyDown}>
                <div className={dialogClasses}>
                    {this.props.displayCloseButton && this.renderCloseButton()}

                    <div className="gd-dialog-header">
                        <h3>{this.props.headline}</h3>
                    </div>

                    {!!this.props.warning && <div className="gd-dialog-warning">{this.props.warning}</div>}

                    <div className="gd-dialog-content">{this.props.children}</div>

                    <div className="gd-dialog-footer">
                        <Button
                            onClick={this.props.onCancel}
                            className="gd-button-secondary s-dialog-cancel-button"
                            value={this.props.cancelButtonText}
                        />

                        <Button
                            onClick={this.props.onSubmit}
                            className={submitButtonClasses}
                            value={this.props.submitButtonText}
                            disabled={this.props.isSubmitDisabled}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
