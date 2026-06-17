// (C) 2026 GoodData Corporation

import { useIntl } from "react-intl";

import {
    commonDialogMessages,
    olpAddGranteeDialogMessages,
    olpObjectShareDialogMessages,
} from "../../locales.js";
import { bem } from "../@utils/bem.js";
import { UiButton } from "../UiButton/UiButton.js";
import {
    type IUiGranteeAsyncOptions,
    type IUiPickedGrantee,
    UiGranteeAsyncPicker,
} from "../UiGranteeAsyncPicker/UiGranteeAsyncPicker.js";
import { UiIconButton } from "../UiIconButton/UiIconButton.js";
import { UiDialogFooter } from "../UiModalDialog/UiDialogFooter.js";
import { UiDialogHeader } from "../UiModalDialog/UiDialogHeader.js";
import { type PermissionMenuLevel } from "../UiPermissionMenu/UiPermissionMenu.js";

import { useGranteeSelection } from "./useGranteeSelection.js";

const { b } = bem("gd-ui-kit-add-grantee-dialog");

/**
 * @internal
 */
export interface IUiAddGranteeDialogCardProps {
    /** Object title shown in the header — wrapped into `Share "\{title\}"`. */
    objectTitle: string;

    /** Loader passed straight through to the embedded `UiGranteeAsyncPicker`. */
    loadOptions: (search: string) => Promise<IUiGranteeAsyncOptions>;
    /**
     * Grantees currently picked. Single source of truth — the card derives all
     * row state from it and emits the next list via `onSelectedGranteesChange`.
     */
    selectedGrantees: ReadonlyArray<IUiPickedGrantee>;
    /**
     * Fires with the next list when the user picks a grantee, changes a row's
     * permission level, or removes a row. Consumers store the result in their
     * own state.
     */
    onSelectedGranteesChange: (next: IUiPickedGrantee[]) => void;
    /**
     * Permission level used when a grantee is added from the dropdown.
     * Defaults to `"VIEW"`. Consumers that need a different default (e.g.
     * "SHARE" for owners) override here.
     */
    initialPermissionLevel?: PermissionMenuLevel;

    /** Fires when the user clicks the header back-arrow button. */
    onBack: () => void;
    /** Fires when the user clicks the header X close button. */
    onClose: () => void;
    /** Fires when the user clicks Cancel in the footer. */
    onCancel: () => void;
    /**
     * Fires when the user clicks the primary Share button in the footer. The
     * button is disabled while no grantee has been picked.
     */
    onShare: () => void;

    /** Test id forwarded to the root element. */
    dataTestId?: string;
}

/**
 * Add-grantee dialog card — header + grantee picker (search input with
 * sectioned Groups/Users dropdown and picked-rows list) + footer with Cancel
 * and Share. Renders inline as a plain card. For modal behavior (portal,
 * backdrop, focus trap, dismiss), use `UiAddGranteeDialog` which wraps this
 * in `UiModalDialog`.
 *
 * The card owns the visual composition (picker layout) but no policy. The
 * caller controls the picked list via `selectedGrantees` / `onSelectedGranteesChange`,
 * and may override the initial permission level via `initialPermissionLevel`.
 *
 * @internal
 */
export function UiAddGranteeDialogCard({
    objectTitle,
    loadOptions,
    selectedGrantees,
    onSelectedGranteesChange,
    initialPermissionLevel = "VIEW",
    onBack,
    onClose,
    onCancel,
    onShare,
    dataTestId,
}: IUiAddGranteeDialogCardProps) {
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

    const { select, changePermission, remove } = useGranteeSelection({
        selectedGrantees,
        onSelectedGranteesChange,
        initialPermissionLevel,
    });

    return (
        <div className={b()} data-testid={dataTestId}>
            <UiDialogHeader title={dialogTitle} titleSize="large" onClose={onClose} leading={backButton} />

            <UiGranteeAsyncPicker
                loadOptions={loadOptions}
                selectedGrantees={selectedGrantees}
                onSelect={select}
                onPermissionChange={changePermission}
                onRemove={remove}
            />

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
                    onClick={onShare}
                    isDisabled={selectedGrantees.length === 0}
                />
            </UiDialogFooter>
        </div>
    );
}
