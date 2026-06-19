// (C) 2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { useIntl } from "react-intl";

import {
    olpAddGranteeDialogMessages,
    olpPermissionMessages,
    uiGranteeAsyncPickerMessages,
} from "../../locales.js";
import { bem } from "../@utils/bem.js";
import { type IUiAutocompleteOption, type IUiAutocompleteSection } from "../UiAutocomplete/types.js";
import { UiAutocomplete } from "../UiAutocomplete/UiAutocomplete.js";
import { UiButton } from "../UiButton/UiButton.js";
import { type GranteeAvatarKind } from "../UiGranteeAvatar/UiGranteeAvatar.js";
import { UiGranteeRow } from "../UiGranteeRow/UiGranteeRow.js";
import { type PermissionMenuLevel, UiPermissionMenu } from "../UiPermissionMenu/UiPermissionMenu.js";

const { b, e } = bem("gd-ui-kit-grantee-async-picker");

/**
 * One pickable user or group entry.
 *
 * @internal
 */
export interface IUiGranteeAsyncOption {
    /** Stable identifier — used as the React key and as the value passed to `onSelect`. */
    id: string;
    /** Avatar variant. */
    kind: GranteeAvatarKind;
    /** Display name shown on the row. */
    name: string;
    /** Optional email subline (users only). */
    email?: string;
}

/**
 * A previously-picked grantee with its current permission level.
 *
 * @internal
 */
export interface IUiPickedGrantee extends IUiGranteeAsyncOption {
    /** Permission level chosen for this grantee. Drives the row's permission menu trigger label. */
    permissionLevel: PermissionMenuLevel;
}

/**
 * Result returned by the consumer's loader: separate `groups` and `users` arrays
 * so the dropdown can render the two sections independently. Either may be empty.
 *
 * @internal
 */
export interface IUiGranteeAsyncOptions {
    groups: IUiGranteeAsyncOption[];
    users: IUiGranteeAsyncOption[];
}

/**
 * @internal
 */
export interface IUiGranteeAsyncPickerProps {
    /**
     * Loader called whenever the (debounced) search query changes. The empty
     * string is passed on mount to populate the initial dropdown. Pagination
     * is intentionally not exposed at this layer — the loader returns the
     * full search result and the consumer caps backend results elsewhere.
     */
    loadOptions: (search: string) => Promise<IUiGranteeAsyncOptions>;
    /**
     * Grantees already picked. Rendered below the search input as `UiGranteeRow`s
     * with a `UiPermissionMenu` trigger and a Remove action. Also filtered out
     * of the dropdown so the user cannot pick the same grantee twice.
     */
    selectedGrantees?: ReadonlyArray<IUiPickedGrantee>;
    /** Fires when the user picks an option from the dropdown. */
    onSelect: (option: IUiGranteeAsyncOption) => void;
    /** Fires when the user changes the permission level on a picked row. */
    onPermissionChange?: (grantee: IUiPickedGrantee, next: PermissionMenuLevel) => void;
    /** Fires when the user picks Remove access in the row's permission menu. */
    onRemove?: (grantee: IUiPickedGrantee) => void;
    /** Test id forwarded to the root element. */
    dataTestId?: string;
}

/** Internal autocomplete option shape — extends `IUiAutocompleteOption` with the grantee payload. */
interface IGranteeAutocompleteOption extends IUiAutocompleteOption {
    grantee: IUiGranteeAsyncOption;
}

/**
 * Sectioned async grantee picker — specialization of `UiAutocomplete` for the
 * share/access-control domain. Renders a search input with a dropdown split
 * into `Groups` and `Users` sections, and a list of picked grantees below
 * (each as a `UiGranteeRow` with a `UiPermissionMenu` trigger). The
 * permission menu carries the Remove action; consumers wire it via `onRemove`.
 *
 * @internal
 */
export function UiGranteeAsyncPicker({
    loadOptions,
    selectedGrantees = [],
    onSelect,
    onPermissionChange,
    onRemove,
    dataTestId,
}: IUiGranteeAsyncPickerProps) {
    const intl = useIntl();

    const groupsLabel = intl.formatMessage(uiGranteeAsyncPickerMessages.sectionGroups);
    const usersLabel = intl.formatMessage(uiGranteeAsyncPickerMessages.sectionUsers);
    const canViewLabel = intl.formatMessage(olpPermissionMessages.canView);
    const canShareLabel = intl.formatMessage(olpPermissionMessages.canViewAndShare);

    const selectedIds = useMemo(() => selectedGrantees.map((g) => g.id), [selectedGrantees]);

    const adaptedLoadOptions = useCallback(
        async (search: string) => {
            const { groups, users } = await loadOptions(search);
            const sections: IUiAutocompleteSection<IGranteeAutocompleteOption>[] = [];
            if (groups.length > 0) {
                sections.push({
                    id: "groups",
                    label: groupsLabel,
                    options: groups.map((g) => ({ id: g.id, label: g.name, grantee: g })),
                });
            }
            if (users.length > 0) {
                sections.push({
                    id: "users",
                    label: usersLabel,
                    options: users.map((u) => ({
                        id: u.id,
                        label: u.name,
                        secondaryText: u.email,
                        grantee: u,
                    })),
                });
            }
            // The grantee picker doesn't paginate at the kit level — backend
            // pagination, if any, is hidden inside the consumer's loader.
            return { sections };
        },
        [loadOptions, groupsLabel, usersLabel],
    );

    const handleSelect = useCallback(
        (option: IGranteeAutocompleteOption) => {
            onSelect(option.grantee);
        },
        [onSelect],
    );

    const autocompleteMessages = useMemo(
        () => ({
            searchPlaceholder: intl.formatMessage(olpAddGranteeDialogMessages.searchPlaceholder),
            stateError: intl.formatMessage(uiGranteeAsyncPickerMessages.stateError),
            stateNoMatch: intl.formatMessage(uiGranteeAsyncPickerMessages.stateNoMatch),
        }),
        [intl],
    );

    const fieldLabel = intl.formatMessage(olpAddGranteeDialogMessages.userOrGroup);

    return (
        <div className={b()} data-testid={dataTestId}>
            <div className={e("field")}>
                <div className={e("field-label")}>{fieldLabel}</div>
                <UiAutocomplete<IGranteeAutocompleteOption>
                    loadOptions={adaptedLoadOptions}
                    selectedIds={selectedIds}
                    onSelect={handleSelect}
                    messages={autocompleteMessages}
                    accessibilityConfig={{
                        ariaLabel: fieldLabel,
                    }}
                />
            </div>

            {selectedGrantees.length === 0 ? (
                <div className={e("empty-state")}>
                    {intl.formatMessage(olpAddGranteeDialogMessages.emptyState)}
                </div>
            ) : null}

            {selectedGrantees.length > 0 ? (
                <ul className={e("picked-list")}>
                    {selectedGrantees.map((g) => {
                        const triggerLabel = g.permissionLevel === "SHARE" ? canShareLabel : canViewLabel;
                        return (
                            <li key={g.id} className={e("picked-item")}>
                                <UiGranteeRow
                                    kind={g.kind}
                                    name={g.name}
                                    email={g.email}
                                    controls={
                                        <UiPermissionMenu
                                            selectedLevel={g.permissionLevel}
                                            onPermissionChange={(next) => onPermissionChange?.(g, next)}
                                            onRemoveAccess={onRemove ? () => onRemove(g) : undefined}
                                            anchor={
                                                <UiButton
                                                    label={triggerLabel}
                                                    variant="dropdownInline"
                                                    size="small"
                                                    iconAfter="navigateDown"
                                                />
                                            }
                                        />
                                    }
                                />
                            </li>
                        );
                    })}
                </ul>
            ) : null}
        </div>
    );
}
