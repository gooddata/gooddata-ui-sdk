// (C) 2026 GoodData Corporation

import { UiModalDialog } from "../UiModalDialog/UiModalDialog.js";

import { type IUiObjectShareDialogCardProps, UiObjectShareDialogCard } from "./UiObjectShareDialogCard.js";

/**
 * @internal
 */
export interface IUiObjectShareDialogProps extends IUiObjectShareDialogCardProps {
    /** Whether the dialog is shown. */
    isOpen: boolean;
}

/**
 * Object share dialog — wraps `UiObjectShareDialogCard` in `UiModalDialog`
 * for the full modal contract (portal, dimmed backdrop, focus trap, Esc
 * and backdrop dismiss).
 *
 * @internal
 */
export function UiObjectShareDialog({ isOpen, ...cardProps }: IUiObjectShareDialogProps) {
    return (
        <UiModalDialog isOpen={isOpen} onClose={cardProps.onClose}>
            <UiObjectShareDialogCard {...cardProps} />
        </UiModalDialog>
    );
}
