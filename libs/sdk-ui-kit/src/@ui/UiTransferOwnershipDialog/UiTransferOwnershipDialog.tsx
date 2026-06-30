// (C) 2026 GoodData Corporation

import { UiModalDialog } from "../UiModalDialog/UiModalDialog.js";

import {
    type IUiTransferOwnershipDialogCardProps,
    UiTransferOwnershipDialogCard,
} from "./UiTransferOwnershipDialogCard.js";

/**
 * @internal
 */
export interface IUiTransferOwnershipDialogProps extends IUiTransferOwnershipDialogCardProps {
    /** Whether the dialog is shown. */
    isOpen: boolean;
}

/**
 * Transfer-ownership dialog — wraps `UiTransferOwnershipDialogCard` in
 * `UiModalDialog` for the full modal contract (portal, dimmed backdrop, focus
 * trap, Esc and backdrop dismiss).
 *
 * @internal
 */
export function UiTransferOwnershipDialog({ isOpen, ...cardProps }: IUiTransferOwnershipDialogProps) {
    return (
        <UiModalDialog isOpen={isOpen} onClose={cardProps.onClose}>
            <UiTransferOwnershipDialogCard {...cardProps} />
        </UiModalDialog>
    );
}
