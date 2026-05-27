// (C) 2026 GoodData Corporation

import { type ReactNode, useId } from "react";

import { useIntl } from "react-intl";

import { commonDialogMessages } from "../../locales.js";
import { type VariantDanger, type VariantPrimary } from "../@types/variant.js";
import { bem } from "../@utils/bem.js";
import { UiButton } from "../UiButton/UiButton.js";
import { UiDialogFooter } from "../UiDialogShell/UiDialogFooter.js";
import { UiDialogHeader } from "../UiDialogShell/UiDialogHeader.js";
import { UiDialogShell } from "../UiDialogShell/UiDialogShell.js";

const { b, e } = bem("gd-ui-kit-confirm-dialog");

/**
 * Visual variant of the confirm button.
 *
 * @internal
 */
export type ConfirmDialogVariant = VariantPrimary | VariantDanger;

/**
 * @internal
 */
export interface IUiConfirmDialogProps {
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
    /** Test id forwarded to the root element. */
    dataTestId?: string;
}

/**
 * Compact modal confirm dialog used by the OLP share flow for actions that
 * need explicit user confirmation (granting workspace access, restricting
 * access, removing a grantee, transferring ownership). Always modal — focus
 * is trapped inside, autofocus + return-focus apply, and ESC fires onClose.
 *
 * @internal
 */
export function UiConfirmDialog({
    title,
    description,
    confirmLabel,
    confirmVariant = "primary",
    onClose,
    onCancel,
    onConfirm,
    dataTestId,
}: IUiConfirmDialogProps) {
    const intl = useIntl();
    const descriptionId = useId();
    return (
        <UiDialogShell
            width={420}
            isModal
            onClose={onClose}
            dataTestId={dataTestId}
            accessibilityConfig={{ ariaDescribedBy: descriptionId }}
        >
            <div className={b()}>
                <UiDialogHeader title={title} onClose={onClose} />

                <div className={e("body")} id={descriptionId}>
                    {description}
                </div>

                <UiDialogFooter>
                    <UiButton
                        label={intl.formatMessage(commonDialogMessages.cancel)}
                        variant="secondary"
                        size="medium"
                        onClick={onCancel}
                        autoFocus
                    />
                    <UiButton
                        label={confirmLabel}
                        variant={confirmVariant}
                        size="medium"
                        onClick={onConfirm}
                    />
                </UiDialogFooter>
            </div>
        </UiDialogShell>
    );
}
