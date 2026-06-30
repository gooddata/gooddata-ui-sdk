// (C) 2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { useIntl } from "react-intl";

import {
    commonDialogMessages,
    olpTransferOwnershipDialogMessages,
    uiGranteeAsyncPickerMessages,
} from "../../locales.js";
import { bem } from "../@utils/bem.js";
import { type IUiAutocompleteOption, type IUiAutocompleteSection } from "../UiAutocomplete/types.js";
import { UiAutocomplete } from "../UiAutocomplete/UiAutocomplete.js";
import { UiButton } from "../UiButton/UiButton.js";
import { UiCheckbox } from "../UiCheckbox/UiCheckbox.js";
import {
    type IUiGranteeAsyncOption,
    type IUiGranteeAsyncOptions,
} from "../UiGranteeAsyncPicker/UiGranteeAsyncPicker.js";
import { UiGranteeRow } from "../UiGranteeRow/UiGranteeRow.js";
import { UiIconButton } from "../UiIconButton/UiIconButton.js";
import { UiDialogFooter } from "../UiModalDialog/UiDialogFooter.js";
import { UiDialogHeader } from "../UiModalDialog/UiDialogHeader.js";

const { b, e } = bem("gd-ui-kit-transfer-ownership-dialog");

/**
 * @internal
 */
export interface IUiTransferOwnershipDialogCardProps {
    /** Object title shown in the header — wrapped into `Transfer ownership of "\{title\}"`. */
    objectTitle: string;

    /**
     * Loader for the user search. Owner is always an individual user, so the
     * caller returns users only — any `groups` it carries are ignored here.
     */
    loadOptions: (search: string) => Promise<IUiGranteeAsyncOptions>;
    /**
     * The picked new owner, or undefined before one is chosen. Single select:
     * picking another user from the search replaces this one.
     */
    selectedOwner: IUiGranteeAsyncOption | undefined;
    /** Fires when the user picks someone from the search dropdown. */
    onSelectedOwnerChange: (owner: IUiGranteeAsyncOption) => void;

    /** Whether "Also remove my access" is checked. */
    alsoRemoveMyAccess: boolean;
    onAlsoRemoveMyAccessChange: (next: boolean) => void;

    /** Fires when the user clicks the header back-arrow button. */
    onBack: () => void;
    /** Fires when the user clicks the header X close button. */
    onClose: () => void;
    /** Fires when the user clicks Cancel in the footer. */
    onCancel: () => void;
    /**
     * Fires when the user confirms the transfer. The Transfer button is disabled
     * until an owner is picked, and while a transfer is in flight.
     */
    onTransfer: () => void;
    /** Whether a transfer write is in flight; disables the Transfer button. */
    isSaving?: boolean;

    /** Test id forwarded to the root element. */
    dataTestId?: string;
}

/** Internal autocomplete option shape — extends `IUiAutocompleteOption` with the grantee payload. */
interface IGranteeAutocompleteOption extends IUiAutocompleteOption {
    grantee: IUiGranteeAsyncOption;
}

/**
 * Transfer-ownership dialog card — header + single-user search picker + the
 * picked owner row (with an "Owner" tag) + an "Also remove my access" checkbox
 * and an informational note, then a footer with Cancel and Transfer. Renders
 * inline as a plain card; for modal behavior use `UiTransferOwnershipDialog`.
 *
 * The card owns the visual composition but no policy. The caller controls the
 * picked owner via `selectedOwner` / `onSelectedOwnerChange`, decides whether
 * that owner is already an owner, and performs the actual transfer on
 * `onTransfer`.
 *
 * @internal
 */
export function UiTransferOwnershipDialogCard({
    objectTitle,
    loadOptions,
    selectedOwner,
    onSelectedOwnerChange,
    alsoRemoveMyAccess,
    onAlsoRemoveMyAccessChange,
    onBack,
    onClose,
    onCancel,
    onTransfer,
    isSaving = false,
    dataTestId,
}: IUiTransferOwnershipDialogCardProps) {
    const intl = useIntl();
    const dialogTitle = intl.formatMessage(olpTransferOwnershipDialogMessages.title, { title: objectTitle });

    const backButton = (
        <UiIconButton
            icon="chevronLeft"
            variant="tertiary"
            size="small"
            onClick={onBack}
            accessibilityConfig={{ ariaLabel: intl.formatMessage(olpTransferOwnershipDialogMessages.back) }}
        />
    );

    const usersLabel = intl.formatMessage(uiGranteeAsyncPickerMessages.sectionUsers);

    // Only users can own an object, so the search shows a single Users section
    // (no Groups). The caller already returns users only; ignore any groups.
    const adaptedLoadOptions = useCallback(
        async (search: string) => {
            const { users } = await loadOptions(search);
            const sections: IUiAutocompleteSection<IGranteeAutocompleteOption>[] =
                users.length > 0
                    ? [
                          {
                              id: "users",
                              label: usersLabel,
                              options: users.map((u) => ({
                                  id: u.id,
                                  label: u.name,
                                  secondaryText: u.email,
                                  grantee: u,
                              })),
                          },
                      ]
                    : [];
            return { sections };
        },
        [loadOptions, usersLabel],
    );

    const handleSelect = useCallback(
        (option: IGranteeAutocompleteOption) => onSelectedOwnerChange(option.grantee),
        [onSelectedOwnerChange],
    );

    const autocompleteMessages = useMemo(
        () => ({
            searchPlaceholder: intl.formatMessage(olpTransferOwnershipDialogMessages.searchPlaceholder),
            stateError: intl.formatMessage(uiGranteeAsyncPickerMessages.stateError),
            stateNoMatch: intl.formatMessage(uiGranteeAsyncPickerMessages.stateNoMatch),
        }),
        [intl],
    );

    const userLabel = intl.formatMessage(olpTransferOwnershipDialogMessages.userLabel);

    return (
        <div className={b()} data-testid={dataTestId}>
            <UiDialogHeader title={dialogTitle} titleSize="large" onClose={onClose} leading={backButton} />

            <div className={e("field")}>
                <div className={e("field-label")}>{userLabel}</div>
                <UiAutocomplete<IGranteeAutocompleteOption>
                    loadOptions={adaptedLoadOptions}
                    selectedIds={selectedOwner ? [selectedOwner.id] : undefined}
                    onSelect={handleSelect}
                    messages={autocompleteMessages}
                    accessibilityConfig={{ ariaLabel: userLabel }}
                />
            </div>

            {selectedOwner ? (
                <>
                    <UiGranteeRow kind="user" name={selectedOwner.name} email={selectedOwner.email} isOwner />
                    <UiCheckbox
                        checked={alsoRemoveMyAccess}
                        onChange={(ev) => onAlsoRemoveMyAccessChange(ev.target.checked)}
                        label={intl.formatMessage(olpTransferOwnershipDialogMessages.alsoRemoveMyAccess)}
                    />
                    <div className={e("note")}>
                        {intl.formatMessage(
                            alsoRemoveMyAccess
                                ? olpTransferOwnershipDialogMessages.noteLoseAccess
                                : olpTransferOwnershipDialogMessages.noteKeepAccess,
                        )}
                    </div>
                </>
            ) : null}

            <UiDialogFooter divider>
                <UiButton
                    label={intl.formatMessage(commonDialogMessages.cancel)}
                    variant="secondary"
                    size="medium"
                    onClick={onCancel}
                />
                <UiButton
                    label={intl.formatMessage(olpTransferOwnershipDialogMessages.transfer)}
                    variant="primary"
                    size="medium"
                    onClick={onTransfer}
                    isDisabled={!selectedOwner || isSaving}
                />
            </UiDialogFooter>
        </div>
    );
}
