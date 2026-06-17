// (C) 2026 GoodData Corporation

import { UiModalDialog } from "../UiModalDialog/UiModalDialog.js";

import { type IUiAddGranteeDialogCardProps, UiAddGranteeDialogCard } from "./UiAddGranteeDialogCard.js";

/**
 * @internal
 */
export interface IUiAddGranteeDialogProps extends IUiAddGranteeDialogCardProps {
    /** Whether the dialog is shown. */
    isOpen: boolean;
}

/**
 * Add-grantee dialog — wraps `UiAddGranteeDialogCard` in `UiModalDialog`
 * for the full modal contract (portal, dimmed backdrop, focus trap, Esc
 * and backdrop dismiss).
 *
 * @internal
 */
export function UiAddGranteeDialog({ isOpen, ...cardProps }: IUiAddGranteeDialogProps) {
    return (
        <UiModalDialog isOpen={isOpen} onClose={cardProps.onClose}>
            <UiAddGranteeDialogCard {...cardProps} />
        </UiModalDialog>
    );
}
