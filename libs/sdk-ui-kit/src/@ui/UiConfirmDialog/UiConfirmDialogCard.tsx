// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { useIntl } from "react-intl";

import { commonDialogMessages } from "../../locales.js";
import { type VariantDanger, type VariantPrimary } from "../@types/variant.js";
import { bem } from "../@utils/bem.js";
import { UiButton } from "../UiButton/UiButton.js";
import { UiDialogBody } from "../UiModalDialog/UiDialogBody.js";
import { UiDialogFooter } from "../UiModalDialog/UiDialogFooter.js";
import { UiDialogHeader } from "../UiModalDialog/UiDialogHeader.js";

const { b } = bem("gd-ui-kit-confirm-dialog");

/**
 * Visual variant of the confirm button.
 *
 * @internal
 */
export type ConfirmDialogVariant = VariantPrimary | VariantDanger;

/**
 * @internal
 */
export interface IUiConfirmDialogCardProps {
    /** Dialog title rendered inside the header. */
    title: string;
    /** Body content — typically a sentence or two of description. */
    description: ReactNode;
    /** Label for the confirm button — e.g. "Confirm", "Remove", "Transfer". */
    confirmLabel: string;
    /** Visual variant of the confirm button. */
    confirmVariant?: ConfirmDialogVariant;
    /** Fires when the user clicks the header X close button. */
    onClose: () => void;
    /** Fires when the user clicks the footer Cancel button. */
    onCancel: () => void;
    /** Fires when the user clicks the footer confirm button. */
    onConfirm: () => void;
    /** Test id forwarded to the root of the card composition. */
    dataTestId?: string;
}

/**
 * Confirm dialog composition — header, description body, footer with Cancel
 * and Confirm buttons. Designed to be rendered inside `UiModalDialog`, which
 * provides the modal chrome (portal, backdrop, card surface, focus trap,
 * dismiss). `UiConfirmDialog` wraps this composition in `UiModalDialog`
 * with the right width and exposes the combined surface to callers.
 *
 * @internal
 */
export function UiConfirmDialogCard({
    title,
    description,
    confirmLabel,
    confirmVariant = "primary",
    onClose,
    onCancel,
    onConfirm,
    dataTestId,
}: IUiConfirmDialogCardProps) {
    const intl = useIntl();
    return (
        <div className={b()} data-testid={dataTestId}>
            <UiDialogHeader title={title} onClose={onClose} />

            <UiDialogBody>{description}</UiDialogBody>

            <UiDialogFooter>
                <UiButton
                    label={intl.formatMessage(commonDialogMessages.cancel)}
                    variant="secondary"
                    size="medium"
                    onClick={onCancel}
                    autoFocus
                />
                <UiButton label={confirmLabel} variant={confirmVariant} size="medium" onClick={onConfirm} />
            </UiDialogFooter>
        </div>
    );
}
