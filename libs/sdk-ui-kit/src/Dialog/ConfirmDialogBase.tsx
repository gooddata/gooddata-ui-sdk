// (C) 2020-2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import noop from "lodash/noop.js";
import { Button } from "../Button/index.js";
import { LoadingSpinner } from "../LoadingSpinner/index.js";
import { DialogBase } from "./DialogBase.js";
import { IConfirmDialogBaseProps } from "./typings.js";
import { Bubble, BubbleHoverTrigger } from "../Bubble/index.js";
import { Typography } from "../Typography/index.js";

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
            titleRightIconRenderer,
            dialogHeaderClassName,
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

        const headerClassNames = cx("gd-dialog-header", dialogHeaderClassName);

        return (
            <div tabIndex={0} onKeyDown={this.onKeyDown}>
                <div className={dialogClasses}>
                    {displayCloseButton ? this.renderCloseButton() : null}

                    <div className="gd-dialog-header-wrapper">
                        {headerLeftButtonRenderer?.()}
                        <div className={headerClassNames}>
                            <Typography tagName="h3" className="gd-dialog-header-title">
                                {headline}
                            </Typography>
                            {titleRightIconRenderer?.()}
                        </div>
                    </div>
                    {!!warning && <div className="gd-dialog-warning">{warning}</div>}

                    <div className="gd-dialog-content">{children}</div>

                    <div className="gd-dialog-footer">
                        {footerLeftRenderer?.()}
                        {showProgressIndicator ? (
                            <LoadingSpinner className="gd-dialog-spinner small" />
                        ) : null}

                        <Button
                            onClick={onCancel}
                            className="gd-button-secondary s-dialog-cancel-button"
                            value={cancelButtonText}
                        />

                        {submitButtonText ? (
                            <BubbleHoverTrigger className="gd-button" showDelay={0} hideDelay={0}>
                                <Button
                                    onClick={onSubmit}
                                    className={submitButtonClasses}
                                    value={submitButtonText}
                                    disabled={isSubmitDisabled}
                                />
                                {submitButtonTooltipText ? (
                                    <Bubble
                                        className="bubble-primary"
                                        alignPoints={submitButtonTooltipAlignPoints || [{ align: "bc tc" }]}
                                        arrowOffsets={submitButtonTooltipArrowOffsets || { "bc tc": [0, 15] }}
                                    >
                                        {submitButtonTooltipText}
                                    </Bubble>
                                ) : null}
                            </BubbleHoverTrigger>
                        ) : null}
                    </div>
                </div>
            </div>
        );
    }
}
