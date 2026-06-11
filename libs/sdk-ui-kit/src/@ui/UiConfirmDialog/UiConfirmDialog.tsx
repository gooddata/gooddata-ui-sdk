// (C) 2026 GoodData Corporation

import { UiModalDialog } from "../UiModalDialog/UiModalDialog.js";

import { type IUiConfirmDialogCardProps, UiConfirmDialogCard } from "./UiConfirmDialogCard.js";

/**
 * @internal
 */
export interface IUiConfirmDialogProps extends IUiConfirmDialogCardProps {
    /** Whether the dialog is shown. */
    isOpen: boolean;
}

/**
 * Modal confirm dialog used for actions that need explicit user confirmation
 * (granting workspace access, restricting access, removing a grantee,
 * transferring ownership). Wraps `UiConfirmDialogCard` in `UiModalDialog`
 * for the full modal contract — portal, dimmed backdrop, focus trap,
 * Esc and backdrop dismiss.
 *
 * @internal
 */
export function UiConfirmDialog({ isOpen, ...cardProps }: IUiConfirmDialogProps) {
    return (
        <UiModalDialog isOpen={isOpen} onClose={cardProps.onClose} width={420}>
            <UiConfirmDialogCard {...cardProps} />
        </UiModalDialog>
    );
}
