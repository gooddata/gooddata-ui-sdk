// (C) 2019-2025 GoodData Corporation
/* eslint-disable import/named,import/namespace */
import {
    IAutomationRecipient,
    INotificationChannelIdentifier,
    INotificationChannelMetadataObject,
    isAutomationUserRecipient,
} from "@gooddata/sdk-model";
import React, { memo, useRef, useState, useEffect, useCallback } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import ReactSelect, {
    ActionMeta,
    SelectComponentsConfig,
    InputProps,
    MenuProps,
    MultiValueGenericProps,
    components as ReactSelectComponents,
    GroupBase,
    MultiValueRemoveProps,
    MenuListProps,
} from "react-select";
import debounce from "lodash/debounce.js";
import isEmpty from "lodash/isEmpty.js";
import isEqual from "lodash/isEqual.js";
import { IWorkspaceUsersQueryOptions } from "@gooddata/sdk-backend-spi";
import {
    Bubble,
    BubbleHoverTrigger,
    IAlignPoint,
    isEscapeKey,
    LoadingMask,
    makeKeyboardNavigation,
    Message,
    Overlay,
    OverlayController,
    OverlayControllerProvider,
    UiIcon,
} from "@gooddata/sdk-ui-kit";
import cx from "classnames";

import { DASHBOARD_DIALOG_OVERS_Z_INDEX } from "../../../../constants/index.js";
import { isEmail } from "../../../utils/validate.js";
import { matchRecipient } from "../../../utils/users.js";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

const MAXIMUM_RECIPIENTS_RECEIVE = 60;
const DELAY_TIME = 500;
const PADDING = 16;
const LOADING_MENU_HEIGHT = 50;
const CREATE_OPTION = "create-option";
const SELECT_OPTION = "select-option";
const MENU_LIST_ID = "gd-recipients-menu-list-id";
const { Menu, Input, MultiValueRemove, MenuList } = ReactSelectComponents;
const overlayController = OverlayController.getInstance(DASHBOARD_DIALOG_OVERS_Z_INDEX);

const TOOLTIP_ALIGN_POINTS: IAlignPoint[] = [
    {
        align: "cr cl",
        offset: { x: 0, y: -2 },
    },
    {
        align: "cl cr",
        offset: { x: 0, y: -2 },
    },
];

export interface IRecipientsSelectRendererProps {
    /**
     * Currently selected recipients.
     */
    value: IAutomationRecipient[];

    /**
     * Originally selected recipients of a edited schedule
     */
    originalValue: IAutomationRecipient[];

    /**
     * Recipients to display in the autocomplete.
     */
    options: IAutomationRecipient[];

    /**
     * Allow multiple recipients to select?
     */
    isMulti?: boolean;

    /**
     * Callback to be called, when recipients are changed.
     */
    onChange?: (selectedUsers: IAutomationRecipient[]) => void;

    /**
     * Callback to load autocomplete options.
     */
    onLoad?: (queryOptions?: IWorkspaceUsersQueryOptions) => void;

    /**
     * Show autocomplete loading indicator?
     */
    isLoading?: boolean;

    /**
     * Error occurred while loading users
     */
    usersError?: GoodDataSdkError;

    /**
     * Has user canListUsersInProject permission?
     */
    canListUsersInProject?: boolean;

    /**
     * Currently logged in user as a recipient
     */
    loggedUser?: IAutomationRecipient;

    /**
     * Allow to select only me as a recipient
     */
    allowOnlyLoggedUserRecipients?: boolean;

    /**
     * Allow to remove the last recipient
     */
    allowEmptySelection?: boolean;

    /**
     * Allow external recipients
     */
    allowExternalRecipients?: boolean;

    /**
     * Maximum number of recipients
     */
    maxRecipients?: number;

    /**
     * Additional class name
     */
    className?: string;

    /**
     * Notification channel
     */
    notificationChannel?: INotificationChannelIdentifier | INotificationChannelMetadataObject;

    /**
     * Show label?
     */
    showLabel?: boolean;

    /**
     * Id
     */
    id: string;

    /**
     * Handle keyboard submit
     */
    onKeyDownSubmit?: (e: React.KeyboardEvent) => void;

    /**
     * Override recipients with an external recipient
     */
    externalRecipientOverride?: string;
}

interface IRecipientsSelectRendererState {
    menuOpen: boolean;
    minRecipientsError: boolean;
    focusedRecipientIndex: number;
}

export const RecipientsSelectRenderer = memo(function RecipientsSelectRenderer(
    props: IRecipientsSelectRendererProps,
) {
    const {
        isMulti,
        options,
        value,
        maxRecipients,
        className,
        usersError,
        allowOnlyLoggedUserRecipients,
        id,
        externalRecipientOverride,
        allowExternalRecipients,
        loggedUser,
        notificationChannel,
        showLabel,
        onChange,
        onLoad,
        isLoading,
        canListUsersInProject,
        allowEmptySelection,
        onKeyDownSubmit,
    } = props;

    const [state, setState] = useState<IRecipientsSelectRendererState>({
        menuOpen: false,
        minRecipientsError: false,
        focusedRecipientIndex: -1,
    });

    const recipientRef = useRef<HTMLDivElement>(null);
    const intl = useIntl();

    const keyboardRecipientNavigationHandler = makeKeyboardNavigation({
        onFocusPrevious: [{ code: ["ArrowLeft"] }],
        onFocusNext: [{ code: ["ArrowRight"] }],
        onSubmit: [{ code: ["Enter"] }],
        onRecipientRemove: [{ code: ["Delete", "Backspace", "Enter"] }],
    });

    useEffect(() => {
        const { current } = recipientRef;

        if (!current) {
            return;
        }

        // update owner component style after recipient rendered
        const ownerContainer = current.querySelector(".gd-owner-user");
        const style = getStyle();
        if (ownerContainer && style) {
            ownerContainer.setAttribute("style", `max-width: ${style.maxWidth}px`);
        }
    });

    const evaluateErrors = useCallback(() => {
        const maxRecipientsError = maxRecipients !== undefined && value.length > maxRecipients;
        const minRecipientsError = state.minRecipientsError;
        const someRecipientsMissingEmail = isEmailChannel()
            ? value.some((v) => (isAutomationUserRecipient(v) ? !isEmail(v.email ?? "") : false))
            : false;

        const invalidExternalRecipients = value.filter((v) => v.type === "externalUser");
        const invalidExternalError = !!invalidExternalRecipients.length && !allowExternalRecipients;

        const invalidUnknownRecipients = value.filter((v) => v.type === "unknownUser");
        const invalidUnknownError = !!invalidUnknownRecipients.length;

        const invalidRecipientsValues = [...invalidExternalRecipients, ...invalidUnknownRecipients]
            .map((v) => v.name ?? v.id)
            .join(", ");

        const authorOnlyError =
            allowOnlyLoggedUserRecipients &&
            ((value.length === 1 && value[0].id !== loggedUser?.id) || value.length > 1);

        const missingEmailRecipients = value.filter((v) => getHasEmail(v) === false);
        const missingEmailRecipientsValues = missingEmailRecipients.map((v) => v.name ?? v.id).join(", ");
        const missingEmailError = !!missingEmailRecipients.length;

        return {
            maxRecipientsError,
            minRecipientsError,
            invalidExternalError,
            invalidUnknownError,
            authorOnlyError,
            missingEmailError,
            invalidRecipientsValues,
            missingEmailRecipientsValues,
            someRecipientsMissingEmail,
        };
    }, [
        value,
        maxRecipients,
        allowExternalRecipients,
        allowOnlyLoggedUserRecipients,
        loggedUser,
        state.minRecipientsError,
    ]);

    const renderInputError = useCallback(
        ({
            authorOnlyError,
            invalidExternalError,
            invalidUnknownError,
            maxRecipientsError,
            minRecipientsError,
            missingEmailError,
            invalidRecipientsValues,
            missingEmailRecipientsValues,
            maxRecipients,
            usersError,
        }: {
            authorOnlyError?: boolean;
            invalidExternalError?: boolean;
            invalidUnknownError?: boolean;
            maxRecipientsError?: boolean;
            minRecipientsError?: boolean;
            missingEmailError?: boolean;
            invalidRecipientsValues: string;
            missingEmailRecipientsValues: string;
            maxRecipients: number | undefined;
            usersError: GoodDataSdkError | undefined;
        }): React.ReactElement | null => {
            return (
                <div id="gd-recipients-field-error" className="gd-recipients-field-error">
                    {authorOnlyError ? (
                        <div className="gd-recipients-field-error-item">
                            <FormattedMessage id="dialogs.schedule.email.user.invalid.onlyYou" />
                        </div>
                    ) : null}
                    {invalidExternalError || invalidUnknownError ? (
                        <div className="gd-recipients-field-error-item">
                            <FormattedMessage
                                id="dialogs.schedule.email.user.invalid.external"
                                values={{ recipients: invalidRecipientsValues }}
                            />
                        </div>
                    ) : null}
                    {maxRecipientsError ? (
                        <div className="gd-recipients-field-error-item">
                            <FormattedMessage
                                id="dialogs.schedule.email.max.recipients"
                                values={{ maxRecipients }}
                            />
                        </div>
                    ) : null}
                    {minRecipientsError ? (
                        <div className="gd-recipients-field-error-item">
                            <FormattedMessage id="dialogs.schedule.email.min.recipients" />
                        </div>
                    ) : null}
                    {missingEmailError ? (
                        <div className="gd-recipients-field-error-item">
                            <FormattedMessage
                                id="dialogs.schedule.email.user.missing.email"
                                values={{ recipients: missingEmailRecipientsValues }}
                            />
                        </div>
                    ) : null}
                    {usersError ? (
                        <div className="gd-recipients-field-error-item">
                            <FormattedMessage id="dialogs.schedule.email.usersLoad.error" />
                        </div>
                    ) : null}
                </div>
            );
        },
        [],
    );

    const renderEmptyContainer = useCallback((): React.ReactElement | null => {
        return null;
    }, []);

    const getStyle = useCallback(() => {
        const { current } = recipientRef;
        const { width } = (!isEmpty(current) && current!.getBoundingClientRect()) || { width: undefined };

        return {
            maxWidth: width ? width - PADDING : "100%",
            width,
        };
    }, []);

    const isEmailChannel = useCallback(() => {
        return notificationChannel?.destinationType === "smtp";
    }, [notificationChannel]);

    const renderNoOptionsContainer = useCallback((): React.ReactElement | null => {
        if (externalRecipientOverride) {
            return null;
        }

        return (
            <div className="gd-recipients-no-match">
                <FormattedMessage id="dialogs.schedule.email.user.noMatch" />
            </div>
        );
    }, [externalRecipientOverride]);

    const renderMultiValueRemove = useCallback(
        (props: MultiValueRemoveProps<IAutomationRecipient>): React.ReactElement | null => {
            const modifiedProps = {
                ...props,
                innerProps: {
                    ...props.innerProps,
                    "aria-label": intl.formatMessage(
                        { id: "dialogs.schedule.email.user.remove" },
                        { name: props.data.name ?? props.data.id },
                    ),
                },
            };
            return <MultiValueRemove {...modifiedProps} />;
        },
        [intl],
    );

    const renderMenuOptions = useCallback(
        (menuProps: MenuProps<any, boolean>): React.ReactElement | null => {
            const {
                getValue,
                selectProps: { inputValue },
            } = menuProps;
            const selectedValues = getValue() || [];
            const selectedItemsCount = selectedValues.length;
            const areAllValuesSelected = false;

            if (isLoading) {
                return renderLoadingIcon(menuProps);
            }

            if (!inputValue && (selectedItemsCount >= MAXIMUM_RECIPIENTS_RECEIVE || areAllValuesSelected)) {
                return renderEmptyContainer();
            }

            return renderMenuOptionsContainer(menuProps);
        },
        [isLoading],
    );

    const renderMenuList = useCallback((menuListProps: MenuListProps<any, boolean>): React.ReactElement => {
        const modifiedInnerProps = {
            ...menuListProps.innerProps,
            id: MENU_LIST_ID,
        };

        return <MenuList {...menuListProps} innerProps={modifiedInnerProps} />;
    }, []);

    const renderMenuOptionsContainer = useCallback(
        (menuProps: MenuProps<any, boolean>): React.ReactElement => {
            const style = getStyle();
            return (
                <OverlayControllerProvider overlayController={overlayController}>
                    <Overlay alignTo={".gd-recipients-container"} alignPoints={[{ align: "bc tc" }]}>
                        <div className="gd-recipients-overlay" style={{ width: style.width }}>
                            <Menu className="s-gd-recipients-menu-container" {...menuProps}>
                                {menuProps.children}
                            </Menu>
                        </div>
                    </Overlay>
                </OverlayControllerProvider>
            );
        },
        [getStyle],
    );

    const renderLoadingIcon = useCallback((menuProps: MenuProps<any, boolean>): React.ReactElement => {
        return (
            <OverlayControllerProvider overlayController={overlayController}>
                <Menu className="s-gd-recipients-menu-container" {...menuProps}>
                    <LoadingMask height={LOADING_MENU_HEIGHT} />
                </Menu>
            </OverlayControllerProvider>
        );
    }, []);

    const renderMultiValueItemContainer = useCallback(
        (
            label: string,
            removeIcon: React.ReactElement | null,
            recipientIndex: number,
            options: {
                hasEmail?: boolean;
                noExternal?: boolean;
                invalidExternal?: boolean;
                invalidLoggedUser?: boolean;
                type?: "externalUser";
                email?: string;
            } = {},
        ): React.ReactElement => {
            const style = getStyle();
            const { focusedRecipientIndex } = state;

            const render = () => {
                const showErrorIcon =
                    options.noExternal ||
                    options.invalidExternal ||
                    options.invalidLoggedUser ||
                    !options.hasEmail;
                const isFocused = focusedRecipientIndex === recipientIndex;

                return (
                    <div
                        style={{ maxWidth: style.maxWidth }}
                        className={cx("gd-recipient-value-item s-gd-recipient-value-item multiple-value", {
                            "invalid-email": !options.hasEmail,
                            "invalid-external": options.noExternal || options.invalidExternal,
                            "invalid-user": options.invalidLoggedUser,
                            "gd-recipient-focused": isFocused,
                        })}
                    >
                        {showErrorIcon ? (
                            <div className="gd-recipient-label-error">
                                <UiIcon type="crossCircle" size={12} color="error" />
                            </div>
                        ) : null}
                        <div className="gd-recipient-label">{label}</div>
                        {options.type === "externalUser" ? (
                            <div className="gd-recipient-quest">
                                <FormattedMessage id="dialogs.schedule.email.user.guest" />
                            </div>
                        ) : null}
                        <div className="gd-recipient-remove-icon s-gd-recipient-remove">{removeIcon}</div>
                    </div>
                );
            };

            if (options.invalidLoggedUser === true) {
                return (
                    <BubbleHoverTrigger>
                        {render()}
                        <Bubble className="bubble-negative" alignPoints={TOOLTIP_ALIGN_POINTS}>
                            <FormattedMessage id="dialogs.schedule.email.user.notMe" />
                        </Bubble>
                    </BubbleHoverTrigger>
                );
            }

            if (options.invalidExternal === true) {
                return (
                    <BubbleHoverTrigger>
                        {render()}
                        <Bubble className="bubble-negative" alignPoints={TOOLTIP_ALIGN_POINTS}>
                            <FormattedMessage id="dialogs.schedule.email.user.unknown" />
                        </Bubble>
                    </BubbleHoverTrigger>
                );
            }

            if (options.hasEmail === false) {
                return (
                    <BubbleHoverTrigger>
                        {render()}
                        <Bubble className="bubble-negative" alignPoints={TOOLTIP_ALIGN_POINTS}>
                            <FormattedMessage id="dialogs.schedule.email.user.missing.email.tooltip" />
                        </Bubble>
                    </BubbleHoverTrigger>
                );
            }

            if (options.noExternal === true) {
                return (
                    <BubbleHoverTrigger>
                        {render()}
                        <Bubble className="bubble-negative" alignPoints={TOOLTIP_ALIGN_POINTS}>
                            <FormattedMessage id="dialogs.schedule.email.user.invalid.external.tooltip" />
                        </Bubble>
                    </BubbleHoverTrigger>
                );
            }

            if (options.type === "externalUser") {
                return (
                    <BubbleHoverTrigger>
                        {render()}
                        <Bubble className="bubble-primary" alignPoints={TOOLTIP_ALIGN_POINTS}>
                            <FormattedMessage
                                id="dialogs.schedule.email.user.used.external"
                                values={{ email: label }}
                            />
                        </Bubble>
                    </BubbleHoverTrigger>
                );
            }

            if (options.email) {
                return (
                    <BubbleHoverTrigger>
                        {render()}
                        <Bubble className="bubble-primary" alignPoints={TOOLTIP_ALIGN_POINTS}>
                            {options.email}
                        </Bubble>
                    </BubbleHoverTrigger>
                );
            }

            return render();
        },
        [getStyle, state.focusedRecipientIndex],
    );

    const getHasEmail = useCallback(
        (recipient: IAutomationRecipient) => {
            return isEmailChannel() && isAutomationUserRecipient(recipient)
                ? isEmail(recipient.email ?? "")
                : true;
        },
        [isEmailChannel],
    );

    const renderMultiValueContainer = useCallback(
        (multiValueProps: MultiValueGenericProps<IAutomationRecipient>): React.ReactElement => {
            const { data, children } = multiValueProps;

            // MultiValueRemove component from react-select
            const removeIcon: React.ReactElement | null = (children as any)![1];
            const name = data.name ?? data.id;
            const hasEmail = getHasEmail(data);
            const noExternal = data.type === "externalUser" && !allowExternalRecipients;
            const invalidExternal = data.type === "unknownUser";
            const invalidLoggedUser = allowOnlyLoggedUserRecipients ? data.id !== loggedUser?.id : false;

            // Find the index of this recipient in the value array
            const recipientIndex = value.findIndex((recipient) => recipient.id === data.id);

            return renderMultiValueItemContainer(name, removeIcon, recipientIndex, {
                hasEmail,
                noExternal,
                invalidLoggedUser,
                invalidExternal,
                type: data.type,
                email: data.email,
            });
        },
        [
            allowExternalRecipients,
            allowOnlyLoggedUserRecipients,
            loggedUser,
            value,
            getHasEmail,
            renderMultiValueItemContainer,
        ],
    );

    const renderOptionLabel = useCallback(
        (recipient: IAutomationRecipient): React.ReactElement | null => {
            const displayName = recipient.name ?? recipient.id;
            const email = isAutomationUserRecipient(recipient) ? (recipient.email ?? "") : "";

            const renderValue = renderRecipientValue(recipient);

            return (
                <BubbleHoverTrigger>
                    <div className="gd-recipient-option-item s-gd-recipient-option-item">
                        <span className="gd-recipient-option-label-item s-gd-recipient-option-label-item">
                            {displayName}
                        </span>
                        {allowExternalRecipients && recipient.type === "externalUser" ? (
                            <span className="gd-recipient-quest">
                                &nbsp;
                                <FormattedMessage id="dialogs.schedule.email.user.guest" />
                            </span>
                        ) : (
                            renderValue
                        )}
                        {!externalRecipientOverride &&
                        allowExternalRecipients &&
                        recipient.type === "externalUser" ? (
                            <div className="gd-recipient-option-label-external-warning">
                                <Message type="warning">
                                    <FormattedMessage
                                        id="dialogs.schedule.email.user.warning.external"
                                        values={{ email: displayName }}
                                    />
                                </Message>
                            </div>
                        ) : null}
                    </div>
                    <Bubble className="bubble-primary" alignPoints={TOOLTIP_ALIGN_POINTS}>
                        {displayName} {isEmail(email) ? `(${email})` : ""}
                    </Bubble>
                </BubbleHoverTrigger>
            );
        },
        [allowExternalRecipients, externalRecipientOverride],
    );

    const renderRecipientValue = useCallback(
        (recipient: IAutomationRecipient): React.ReactElement | null => {
            const email = isAutomationUserRecipient(recipient) ? (recipient.email ?? "") : "";

            if (isEmail(email)) {
                return (
                    <span className="gd-recipient-option-value-item s-gd-recipient-option-value-item">
                        {email}
                    </span>
                );
            }

            return renderEmptyContainer();
        },
        [renderEmptyContainer],
    );

    const renderInputContainer = useCallback(
        (inputProps: InputProps<IAutomationRecipient>): React.ReactElement | null => {
            if (!isMulti) {
                return renderEmptyContainer();
            }

            const props: InputProps<IAutomationRecipient> = {
                ...inputProps,
                id: id,
                "aria-controls": MENU_LIST_ID,
            };

            return (
                <div className="gd-recipient-input s-gd-recipient-input">
                    <Input {...props} />
                </div>
            );
        },
        [isMulti, id, renderEmptyContainer],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            const { menuOpen } = state;

            if (isEscapeKey(e)) {
                e.stopPropagation();
            }

            if (!menuOpen) {
                handleKeyboardNavigation(e);
            }
        },
        [state.menuOpen],
    );

    const handleOnChange = useCallback(
        (selectedValues: IAutomationRecipient[], actionTypes: ActionMeta<IAutomationRecipient>): void => {
            const newSelectedValues = selectedValues;

            const { action } = actionTypes;
            if (
                value.length >= MAXIMUM_RECIPIENTS_RECEIVE &&
                (action === CREATE_OPTION || action === SELECT_OPTION)
            ) {
                onChange?.(value);
                return;
            }
            if (newSelectedValues?.length === 0) {
                if (allowEmptySelection) {
                    onChange?.([]);
                    //setState(prev => ({ ...prev, minRecipientsError: true }));
                } else {
                    onChange?.([value[0]]);
                }
                return;
            } else {
                setState((prev) => ({ ...prev, minRecipientsError: false }));
            }

            onChange?.(newSelectedValues);
        },
        [value, allowEmptySelection, onChange],
    );

    const onBlur = useCallback((): void => {
        if (allowEmptySelection && value.length === 0) {
            setState((prev) => ({ ...prev, minRecipientsError: true }));
        }
    }, [allowEmptySelection, value.length]);

    const loadUserListItems = useCallback(
        (searchString: string): void => {
            const isRecipientAdded = isRecipientAddedFn(value, searchString);

            if (!canListUsersInProject || isRecipientAdded) {
                return;
            }

            onLoad?.({ search: searchString });
        },
        [value, canListUsersInProject, onLoad],
    );

    const onMenuOpen = useCallback((): void => {
        const userListCount = options.length;
        setState((prev) => ({ ...prev, menuOpen: true, focusedRecipientIndex: -1 }));
        if (!userListCount && canListUsersInProject) {
            onLoad?.();
        }
    }, [options.length, canListUsersInProject, onLoad]);

    const onSearchCore = useCallback(
        (searchString: string): void => {
            loadUserListItems(searchString);
        },
        [loadUserListItems],
    );

    const onSearch = useCallback(debounce(onSearchCore, DELAY_TIME), [onSearchCore]);

    const isRecipientAddedFn = useCallback(
        (value: ReadonlyArray<IAutomationRecipient>, searchKey: string): boolean => {
            return value.some((recipient: IAutomationRecipient) => isEqual(recipient.id, searchKey));
        },
        [],
    );

    const handleKeyboardRecipientRemove = useCallback(
        (index: number): void => {
            if (index < 0 || index >= value.length) {
                return;
            }

            const newValues = value.filter((_, i) => i !== index);
            onChange?.(newValues);

            const newFocusIndex = newValues.length === 0 ? -1 : Math.min(index, newValues.length - 1);

            setState((prev) => ({ ...prev, focusedRecipientIndex: newFocusIndex }));
        },
        [value, onChange],
    );

    const handleKeyboardNavigation = useCallback(
        (e: React.KeyboardEvent) => {
            const { focusedRecipientIndex } = state;
            const totalRecipients = value.length;

            const keyboardHandler = keyboardRecipientNavigationHandler({
                onFocusPrevious: () => {
                    if (focusedRecipientIndex === -1 && totalRecipients > 0) {
                        const lastIndex = totalRecipients - 1;
                        setState((prev) => ({ ...prev, focusedRecipientIndex: lastIndex }));
                    } else if (focusedRecipientIndex > 0) {
                        const prevIndex = focusedRecipientIndex - 1;
                        setState((prev) => ({ ...prev, focusedRecipientIndex: prevIndex }));
                    } else {
                        setState((prev) => ({ ...prev, focusedRecipientIndex: -1 }));
                    }
                },
                onFocusNext: () => {
                    if (focusedRecipientIndex < totalRecipients - 1) {
                        const nextIndex = focusedRecipientIndex + 1;
                        setState((prev) => ({ ...prev, focusedRecipientIndex: nextIndex }));
                    } else if (focusedRecipientIndex === totalRecipients - 1) {
                        setState((prev) => ({ ...prev, focusedRecipientIndex: -1 }));
                    }
                },
                onSubmit: () => {
                    if (focusedRecipientIndex === -1) {
                        onKeyDownSubmit?.(e);
                    } else {
                        handleKeyboardRecipientRemove(focusedRecipientIndex);
                    }
                },
                onRecipientRemove: () => {
                    if (e.key === "Backspace" && focusedRecipientIndex === -1) {
                        const newValues = value.slice(0, -1);
                        onChange?.(newValues);
                    }
                    if (focusedRecipientIndex !== -1) {
                        handleKeyboardRecipientRemove(focusedRecipientIndex);
                    }
                },
                onUnhandledKeyDown: () => {
                    setState((prev) => ({ ...prev, focusedRecipientIndex: -1 }));
                },
            });
            keyboardHandler(e);
        },
        [state.focusedRecipientIndex, value, onKeyDownSubmit, handleKeyboardRecipientRemove, onChange],
    );

    const creatableSelectComponent: SelectComponentsConfig<
        IAutomationRecipient,
        boolean,
        GroupBase<IAutomationRecipient>
    > = {
        ...ReactSelectComponents,
        IndicatorsContainer: renderEmptyContainer,
        Input: renderInputContainer,
        MultiValueContainer: renderMultiValueContainer,
        Menu: renderMenuOptions,
        MenuList: renderMenuList,
        Placeholder: renderEmptyContainer,
        NoOptionsMessage: renderNoOptionsContainer,
        MultiValueRemove: renderMultiValueRemove,
    };

    const {
        maxRecipientsError,
        minRecipientsError,
        invalidExternalError,
        invalidUnknownError,
        someRecipientsMissingEmail,
        authorOnlyError,
        missingEmailError,
        invalidRecipientsValues,
        missingEmailRecipientsValues,
    } = evaluateErrors();

    const showInputError =
        maxRecipientsError ||
        minRecipientsError ||
        invalidExternalError ||
        invalidUnknownError ||
        someRecipientsMissingEmail ||
        !!usersError ||
        authorOnlyError ||
        missingEmailError;

    const someExternalRecipients = value.some((v) => v.type === "externalUser");
    const renderExternalRecipientsNote = someExternalRecipients && !externalRecipientOverride;

    return (
        <div
            className={cx(
                "gd-input-component gd-recipients-field s-gd-notifications-channels-dialog-recipients",
                className,
            )}
        >
            {showLabel ? (
                <label htmlFor={id} className="gd-label">
                    <FormattedMessage id="dialogs.schedule.email.recipients.label" />
                </label>
            ) : null}
            <div ref={recipientRef} className="gd-input s-gd-recipients-value">
                <ReactSelect
                    tabSelectsValue={false}
                    id={id}
                    className={cx("gd-recipients-container", {
                        "gd-input-component--invalid": showInputError,
                    })}
                    classNamePrefix="gd-recipients"
                    components={creatableSelectComponent}
                    formatOptionLabel={renderOptionLabel}
                    filterOption={(opt, value) => {
                        return matchRecipient(opt.data, value);
                    }}
                    isClearable={false}
                    isDisabled={!isMulti}
                    isMulti={isMulti}
                    onChange={
                        // using as any as it would be too tricky to type properly
                        handleOnChange as any
                    }
                    onInputChange={onSearch}
                    onMenuOpen={onMenuOpen}
                    onMenuClose={() => setState((prev) => ({ ...prev, menuOpen: false }))}
                    onKeyDown={handleKeyDown}
                    options={options}
                    onBlur={onBlur}
                    value={value}
                    getOptionValue={(o) => o.id}
                    getOptionLabel={(o) => o.name ?? o.id}
                    aria-describedby={showInputError ? "gd-recipients-field-error" : undefined}
                    aria-invalid={showInputError}
                />
                {showInputError ? (
                    renderInputError({
                        authorOnlyError,
                        invalidExternalError,
                        invalidUnknownError,
                        maxRecipientsError,
                        minRecipientsError,
                        missingEmailError,
                        invalidRecipientsValues,
                        missingEmailRecipientsValues,
                        maxRecipients,
                        usersError,
                    })
                ) : renderExternalRecipientsNote ? (
                    <div className="gd-recipients-field-note">
                        <FormattedMessage id="dialogs.schedule.email.recipients.note" />
                    </div>
                ) : allowOnlyLoggedUserRecipients ? (
                    <div className="gd-recipients-field-note">
                        <FormattedMessage id="dialogs.schedule.email.destinationWarning" />
                    </div>
                ) : null}
            </div>
        </div>
    );
});
