// (C) 2020-2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import noop from "lodash/noop";
import { Button } from "../Button";
import { LoadingSpinner } from "../LoadingSpinner";
import { DialogBase } from "./DialogBase";
import { IConfirmDialogBaseProps } from "./typings";
import { Bubble, BubbleHoverTrigger } from "../Bubble";

/**
 * @internal
 */
export class ConfirmDialogBase extends DialogBase<IConfirmDialogBaseProps> {
    static defaultProps: IConfirmDialogBaseProps = {
        displayCloseButton: true,
        onCancel: noop,
        onSubmit: noop,
        isSubmitDisabled: false,
        headerLeftButtonRenderer: undefined,
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
            submitButtonTooltipText,
            submitButtonTooltipAlignPoints,
            submitButtonTooltipArrowOffsets,
            isSubmitDisabled,
            showProgressIndicator,
            onSubmit,
            onCancel,
            headerLeftButtonRenderer,
            footerLeftRenderer,
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

                    <div className="gd-dialog-header-wrapper">
                        {headerLeftButtonRenderer?.()}
                        <div className="gd-dialog-header">
                            <h3>{headline}</h3>
                        </div>
                    </div>
                    {!!warning && <div className="gd-dialog-warning">{warning}</div>}

                    <div className="gd-dialog-content">{children}</div>
                    <div className="gd-dialog-footer-wrapper">
                        <div className="gd-dialog-footer-left-content">{footerLeftRenderer?.()}</div>
                        <div className="gd-dialog-footer">
                            {showProgressIndicator && <LoadingSpinner className="gd-dialog-spinner small" />}

                            <Button
                                onClick={onCancel}
                                className="gd-button-secondary s-dialog-cancel-button"
                                value={cancelButtonText}
                            />

                            <BubbleHoverTrigger className="gd-button" showDelay={0} hideDelay={0}>
                                <Button
                                    onClick={onSubmit}
                                    className={submitButtonClasses}
                                    value={submitButtonText}
                                    disabled={isSubmitDisabled}
                                />
                                {submitButtonTooltipText && (
                                    <Bubble
                                        className="bubble-primary"
                                        alignPoints={submitButtonTooltipAlignPoints || [{ align: "bc tc" }]}
                                        arrowOffsets={submitButtonTooltipArrowOffsets || { "bc tc": [0, 15] }}
                                    >
                                        {submitButtonTooltipText}
                                    </Bubble>
                                )}
                            </BubbleHoverTrigger>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
