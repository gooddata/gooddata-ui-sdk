// (C) 2020-2026 GoodData Corporation

import cx from "classnames";

import { Bubble } from "../Bubble/Bubble.js";
import { BubbleHoverTrigger } from "../Bubble/BubbleHoverTrigger.js";
import { Button } from "../Button/Button.js";
import { LoadingSpinner } from "../LoadingSpinner/LoadingSpinner.js";

import { CONFIRM_DIALOG_BASE_ID } from "./elementId.js";
import { type IConfirmDialogFooterProps } from "./typings.js";

/**
 * The default footer of {@link ConfirmDialogBase}: footer-left content, progress spinner, cancel
 * and submit buttons. The submit button carries two contracts a custom footer must otherwise
 * re-create: its `CONFIRM_DIALOG_BASE_ID` element id (Enter-key submit detection) and the
 * validation aria-describedby wiring.
 *
 * @internal
 */
export function ConfirmDialogFooter({
    footerLeft,
    showProgressIndicator,
    cancelButtonText,
    onCancel,
    isCancelDisabled,
    submitButtonText,
    onSubmit,
    isSubmitDisabled = false,
    submitButtonTooltipText,
    submitButtonTooltipAlignPoints,
    submitButtonTooltipArrowOffsets,
    hideSubmitButton,
    isPositive,
}: IConfirmDialogFooterProps) {
    const submitButtonClasses = cx({
        "s-dialog-submit-button": true,
        "gd-button-action": isPositive,
        "gd-button-negative": !isPositive,
    });

    return (
        <div className="gd-dialog-footer">
            {footerLeft}
            {showProgressIndicator ? <LoadingSpinner className="gd-dialog-spinner small" /> : null}

            <Button
                onClick={onCancel}
                className="gd-button-secondary s-dialog-cancel-button"
                value={cancelButtonText}
                disabled={isCancelDisabled}
            />

            {submitButtonText && !hideSubmitButton ? (
                <BubbleHoverTrigger className="gd-button" showDelay={0} hideDelay={0}>
                    <Button
                        id={CONFIRM_DIALOG_BASE_ID}
                        onClick={onSubmit}
                        className={submitButtonClasses}
                        value={submitButtonText}
                        disabled={isSubmitDisabled}
                        describedByFromValidation
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
    );
}
