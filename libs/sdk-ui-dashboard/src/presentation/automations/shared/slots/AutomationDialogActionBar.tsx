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
 * Default implementation of both automation dialogs' ActionBar slot. Fully props-driven: every
 * value it renders arrives through {@link IAutomationDialogActionBarProps}, so a wrapping slot
 * can override any of them before spreading onto it.
 *
 * @internal
 */
export function AutomationDialogActionBar({
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
