// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { useIntl } from "react-intl";

import {
    commonDialogMessages,
    olpAddGranteeDialogMessages,
    olpObjectShareDialogMessages,
} from "../../locales.js";
import { bem } from "../@utils/bem.js";
import { UiButton } from "../UiButton/UiButton.js";
import { UiDialogFooter } from "../UiDialogShell/UiDialogFooter.js";
import { UiDialogHeader } from "../UiDialogShell/UiDialogHeader.js";
import { UiDialogShell } from "../UiDialogShell/UiDialogShell.js";
import { UiIconButton } from "../UiIconButton/UiIconButton.js";
import { UiTextInput } from "../UiTextInput/UiTextInput.js";

const { b, e } = bem("gd-ui-kit-add-grantee-dialog");

/**
 * @internal
 */
export interface IUiAddGranteeDialogProps {
    /** Object title shown in the header — wrapped into `Share "\{title\}"`. */
    objectTitle: string;
    /** Current search query. */
    searchQuery: string;
    /** Fires when the user edits the search query. */
    onSearchQueryChange: (next: string) => void;
    /**
     * Optional slot rendered between the search input and the bottom divider.
     * When empty, the screen falls back to a "No user or group selected"
     * placeholder. Callers typically render a single `UiGranteeRow`
     * here to preview the grantee they've picked from the search dropdown.
     */
    selectedGrantee?: ReactNode;

    /** Fires when the user clicks the header back-arrow button. */
    onBack: () => void;
    /** Fires when the user clicks the header X close button. */
    onClose: () => void;
    /** Fires when the user clicks Cancel in the footer. */
    onCancel: () => void;
    /** Fires when the user clicks the primary Add button in the footer. */
    onAdd: () => void;
    /** When true, the primary Add button is disabled. */
    isAddDisabled?: boolean;

    /** Test id forwarded to the root element. */
    dataTestId?: string;
}

/**
 * Standalone dialog for adding a grantee, opened from the share dialog's
 * "+ Add" action. Lets the author search for a user or group, preview the
 * grantee they picked, and confirm adding them with the footer Add button.
 *
 * @internal
 */
export function UiAddGranteeDialog({
    objectTitle,
    searchQuery,
    onSearchQueryChange,
    selectedGrantee,
    onBack,
    onClose,
    onCancel,
    onAdd,
    isAddDisabled,
    dataTestId,
}: IUiAddGranteeDialogProps) {
    const intl = useIntl();
    const dialogTitle = intl.formatMessage(olpObjectShareDialogMessages.title, { title: objectTitle });
    const backButton = (
        <UiIconButton
            icon="chevronLeft"
            variant="tertiary"
            size="small"
            onClick={onBack}
            accessibilityConfig={{ ariaLabel: intl.formatMessage(olpAddGranteeDialogMessages.back) }}
        />
    );
    return (
        <UiDialogShell dataTestId={dataTestId}>
            <UiDialogHeader title={dialogTitle} titleSize="large" onClose={onClose} leading={backButton} />

            <div className={b()}>
                <UiTextInput
                    type="search"
                    value={searchQuery}
                    onChange={onSearchQueryChange}
                    label={intl.formatMessage(olpAddGranteeDialogMessages.userOrGroup)}
                    placeholder={intl.formatMessage(olpAddGranteeDialogMessages.searchPlaceholder)}
                />

                <div className={e("preview")}>
                    {selectedGrantee ?? (
                        <span className={e("empty-state")}>
                            {intl.formatMessage(olpAddGranteeDialogMessages.emptyState)}
                        </span>
                    )}
                </div>
            </div>

            <UiDialogFooter divider>
                <UiButton
                    label={intl.formatMessage(commonDialogMessages.cancel)}
                    variant="secondary"
                    size="medium"
                    onClick={onCancel}
                />
                <UiButton
                    label={intl.formatMessage(olpAddGranteeDialogMessages.add)}
                    variant="primary"
                    size="medium"
                    onClick={onAdd}
                    isDisabled={isAddDisabled}
                />
            </UiDialogFooter>
        </UiDialogShell>
    );
}
