// (C) 2020-2026 GoodData Corporation

import { memo, useMemo } from "react";

import cx from "classnames";

import { Typography } from "../Typography/Typography.js";
import { useId } from "../utils/useId.js";

import { ConfirmDialogFooter } from "./ConfirmDialogFooter.js";
import { DialogBase } from "./DialogBase.js";
import { type IConfirmDialogBaseProps } from "./typings.js";

/**
 * @internal
 */
export const ConfirmDialogBase = memo<IConfirmDialogBaseProps>(function ConfirmDialogBase({
    displayCloseButton = true,
    isSubmitDisabled = false,
    isCancelDisabled,
    isPositive,
    headline,
    cancelButtonText,
    submitButtonText,
    submitButtonTooltipText,
    submitButtonTooltipAlignPoints,
    submitButtonTooltipArrowOffsets,
    hideSubmitButton,
    warning,
    showProgressIndicator,
    headerLeftButtonRenderer,
    footerLeftRenderer,
    footerRenderer,
    dialogHeaderClassName,
    initialFocus,
    returnFocusTo,
    returnFocusAfterClose = true,
    titleRightIconRenderer,

    ...dialogBaseProps
}) {
    const dialogClasses = cx("gd-confirm", dialogBaseProps.className);

    const headerClassNames = cx("gd-dialog-header", dialogHeaderClassName);

    const titleElementIdWhenNotSet = useId();
    const accessibilityConfig = useMemo(() => {
        let titleElementId = dialogBaseProps.accessibilityConfig?.titleElementId;
        if (headline && !titleElementId) {
            titleElementId = titleElementIdWhenNotSet;
        }

        return {
            ...(dialogBaseProps.accessibilityConfig ?? {}),
            titleElementId,
            isModal: true,
        };
    }, [dialogBaseProps.accessibilityConfig, headline, titleElementIdWhenNotSet]);

    const guardedOnSubmit = isSubmitDisabled ? undefined : dialogBaseProps.onSubmit;

    return (
        <DialogBase
            {...dialogBaseProps}
            onSubmit={guardedOnSubmit}
            className={dialogClasses}
            displayCloseButton={displayCloseButton}
            accessibilityConfig={accessibilityConfig}
            initialFocus={initialFocus}
            returnFocusTo={returnFocusTo}
            returnFocusAfterClose={returnFocusAfterClose}
        >
            <div className="gd-dialog-header-wrapper">
                {headerLeftButtonRenderer?.()}
                <div className={headerClassNames}>
                    {headline ? (
                        <Typography
                            tagName="h3"
                            className="gd-dialog-header-title"
                            id={accessibilityConfig.titleElementId}
                        >
                            {headline}
                        </Typography>
                    ) : null}
                    {titleRightIconRenderer?.()}
                </div>
            </div>
            {!!warning && <div className="gd-dialog-warning">{warning}</div>}

            <div className="gd-dialog-content">{dialogBaseProps.children}</div>

            {footerRenderer ? (
                footerRenderer()
            ) : (
                <ConfirmDialogFooter
                    footerLeft={footerLeftRenderer?.()}
                    showProgressIndicator={showProgressIndicator}
                    cancelButtonText={cancelButtonText}
                    onCancel={dialogBaseProps.onCancel}
                    isCancelDisabled={isCancelDisabled}
                    submitButtonText={submitButtonText}
                    onSubmit={dialogBaseProps.onSubmit}
                    isSubmitDisabled={isSubmitDisabled}
                    submitButtonTooltipText={submitButtonTooltipText}
                    submitButtonTooltipAlignPoints={submitButtonTooltipAlignPoints}
                    submitButtonTooltipArrowOffsets={submitButtonTooltipArrowOffsets}
                    hideSubmitButton={hideSubmitButton}
                    isPositive={isPositive}
                />
            )}
        </DialogBase>
    );
});
