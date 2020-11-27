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

    render(): JSX.Element {
        const {
            isPositive,
            displayCloseButton,
            headline,
            warning,
            children,
            cancelButtonText,
            submitButtonText,
            isSubmitDisabled,
            onSubmit,
            onCancel,
        } = this.props;
        const dialogClasses = cx(
            {
                "gd-confirm": true,
            },
            this.getDialogClasses(),
        );

        const submitButtonClasses = cx({
            "s-dialog-submit-button": true,
            "gd-button-action": isPositive,
            "gd-button-negative": !isPositive,
        });

        return (
            <div tabIndex={0} onKeyDown={this.onKeyDown}>
                <div className={dialogClasses}>
                    {displayCloseButton && this.renderCloseButton()}

                    <div className="gd-dialog-header">
                        <h3>{headline}</h3>
                    </div>

                    {!!warning && <div className="gd-dialog-warning">{warning}</div>}

                    <div className="gd-dialog-content">{children}</div>

                    <div className="gd-dialog-footer">
                        <Button
                            onClick={onCancel}
                            className="gd-button-secondary s-dialog-cancel-button"
                            value={cancelButtonText}
                        />

                        <Button
                            onClick={onSubmit}
                            className={submitButtonClasses}
                            value={submitButtonText}
                            disabled={isSubmitDisabled}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
