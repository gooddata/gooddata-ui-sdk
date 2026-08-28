// (C) 2026 GoodData Corporation

import { Button, ConfirmDialogFooter, Hyperlink } from "@gooddata/sdk-ui-kit";

import { type IAutomationDialogActionBarProps } from "./types.js";

interface IAutomationDialogFooterLeftProps {
    helpLinkText?: string;
    helpLinkHref?: string;
    deleteButtonText?: string;
    onDelete?: () => void;
    isDeleteDisabled?: boolean;
}

/**
 * The footer-left area of both automation dialogs: the documentation link and, in edit mode,
 * the delete button.
 *
 * @internal
 */
export function AutomationDialogFooterLeft({
    helpLinkText,
    helpLinkHref,
    deleteButtonText,
    onDelete,
    isDeleteDisabled,
}: IAutomationDialogFooterLeftProps) {
    return (
        <div className="gd-notifications-channels-dialog-footer-link">
            {helpLinkText && helpLinkHref ? (
                <Hyperlink text={helpLinkText} href={helpLinkHref} iconClass="gd-icon-circle-question" />
            ) : null}
            {onDelete ? (
                <Button
                    className="gd-button-link-dimmed"
                    value={deleteButtonText}
                    onClick={onDelete}
                    disabled={isDeleteDisabled}
                />
            ) : null}
        </div>
    );
}

/**
 * Default render of both automation dialogs' action bar: the documentation link and Delete on the
 * left, Cancel and the submit button on the right. Props-driven — reads no context; every value it
 * renders arrives through {@link IAutomationDialogActionBarProps}. The default dialogs,
 * {@link AlertingDialogActionBar} and {@link ScheduledEmailDialogActionBar} render it with the
 * tree's action-bar props hook; a `slots.ActionBar` slot receives it as `Default`.
 *
 * @alpha
 */
export function DefaultAutomationDialogActionBar({
    cancelButtonText,
    submitButtonText,
    onCancel,
    onSubmit,
    isSubmitDisabled,
    isSaving,
    submitButtonTooltipText,
    helpLinkText,
    helpLinkHref,
    onDelete,
    deleteButtonText,
}: IAutomationDialogActionBarProps) {
    return (
        <ConfirmDialogFooter
            footerLeft={
                <AutomationDialogFooterLeft
                    helpLinkText={helpLinkText}
                    helpLinkHref={helpLinkHref}
                    deleteButtonText={deleteButtonText}
                    onDelete={onDelete}
                    isDeleteDisabled={isSaving}
                />
            }
            showProgressIndicator={isSaving}
            cancelButtonText={cancelButtonText}
            onCancel={onCancel}
            submitButtonText={submitButtonText}
            onSubmit={onSubmit}
            isSubmitDisabled={isSubmitDisabled}
            submitButtonTooltipText={submitButtonTooltipText}
            isPositive
        />
    );
}
