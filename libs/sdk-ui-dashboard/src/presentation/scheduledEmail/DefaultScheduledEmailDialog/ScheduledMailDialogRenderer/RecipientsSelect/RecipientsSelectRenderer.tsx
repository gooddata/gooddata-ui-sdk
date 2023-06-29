// (C) 2019-2023 GoodData Corporation
/* eslint-disable import/named,import/namespace */
import { IUser, areObjRefsEqual } from "@gooddata/sdk-model";
import React from "react";
import { FormattedMessage } from "react-intl";
import CreatableSelect from "react-select/creatable";
import {
    ActionMeta,
    SelectComponentsConfig,
    InputProps,
    MenuProps,
    NoticeProps,
    MultiValueGenericProps,
    SingleValueProps,
    components as ReactSelectComponents,
    GroupBase,
} from "react-select";
import debounce from "lodash/debounce.js";
import isEmpty from "lodash/isEmpty.js";
import isEqual from "lodash/isEqual.js";
import includes from "lodash/includes.js";
import { IWorkspaceUsersQueryOptions } from "@gooddata/sdk-backend-spi";
import { Bubble, BubbleHoverTrigger, Message, LoadingMask, IAlignPoint } from "@gooddata/sdk-ui-kit";

import { isEmail } from "../../utils/validate.js";
import {
    IScheduleEmailExternalRecipient,
    IScheduleEmailRecipient,
    isScheduleEmailExistingRecipient,
    isScheduleEmailExternalRecipient,
} from "../../interfaces.js";
import {
    getScheduledEmailRecipientDisplayName,
    getScheduledEmailRecipientEmail,
    getScheduledEmailRecipientUniqueIdentifier,
    splitScheduledEmailRecipients,
    uniqueScheduledEmailRecipients,
} from "../../utils/scheduledMailRecipients.js";
import { messages } from "../../../../../locales.js";

const MAXIMUM_RECIPIENTS_RECEIVE = 60;
const DELAY_TIME = 500;
const PADDING = 16;
const REMOVE_ICON_WIDTH = 21;
const LOADING_MENU_HEIGHT = 50;
const CREATE_OPTION = "create-option";
const SELECT_OPTION = "select-option";
const { Menu, Input } = ReactSelectComponents;

export interface IRecipientsSelectRendererProps {
    /**
     * Author of the scheduled email - is always recipient of the scheduled email.
     */
    author: IScheduleEmailRecipient;

    /**
     * Current user creating or editing the schedule
     */
    currentUser: IUser;

    /**
     * Currently selected recipients.
     */
    value: IScheduleEmailRecipient[];

    /**
     * Originally selected recipients of a edited schedule
     */
    originalValue: IScheduleEmailRecipient[];

    /**
     * Recipients to display in the autocomplete.
     */
    options: IScheduleEmailRecipient[];

    /**
     * Allow multiple recipients to select?
     */
    isMulti?: boolean;

    /**
     * Callback to be called, when recipients are changed.
     */
    onChange?: (selectedUsers: IScheduleEmailRecipient[]) => void;

    /**
     * Callback to load autocomplete options.
     */
    onLoad?: (queryOptions?: IWorkspaceUsersQueryOptions) => void;

    /**
     * Show autocomplete loading indicator?
     */
    isLoading?: boolean;

    /**
     * Has user canListUsersInProject permission?
     */
    canListUsersInProject?: boolean;

    /**
     * Allow to remove the last recipient
     */
    allowEmptySelection?: boolean;
}

const bubbleAlignPoints: IAlignPoint[] = [{ align: "cr cl" }];

export class RecipientsSelectRenderer extends React.PureComponent<IRecipientsSelectRendererProps> {
    private recipientRef = React.createRef<HTMLDivElement>();

    public componentDidMount(): void {
        const { current } = this.recipientRef;

        if (!current) {
            return;
        }

        // update owner component style after recipient rendered
        const ownerContainer = current.querySelector(".gd-owner-user");
        const style = this.getStyle();
        if (ownerContainer && style) {
            ownerContainer.setAttribute("style", `max-width: ${style.maxWidth}px`);
        }
    }

    public render() {
        const { isMulti, options, value } = this.props;
        const creatableSelectComponent: SelectComponentsConfig<
            IScheduleEmailRecipient,
            boolean,
            GroupBase<IScheduleEmailRecipient>
        > = {
            ...ReactSelectComponents,
            IndicatorsContainer: this.renderEmptyContainer,
            Input: this.renderInputContainer,
            MultiValueContainer: this.renderMultiValueContainer,
            Menu: this.renderMenuOptions,
            Placeholder: this.renderEmptyContainer,
            SingleValue: this.renderSingleValueContainer,
            NoOptionsMessage: this.renderNoOptionsContainer,
        };

        return (
            <div className="gd-input-component gd-recipients-field s-gd-schedule-email-dialog-recipients">
                <label className="gd-label">
                    <FormattedMessage id="dialogs.schedule.email.to.label" />
                </label>
                <div ref={this.recipientRef} className="gd-input s-gd-recipients-value">
                    <CreatableSelect
                        className="gd-recipients-container"
                        classNamePrefix="gd-recipients"
                        components={creatableSelectComponent}
                        getNewOptionData={this.getNewOptionData}
                        formatOptionLabel={this.renderOptionLabel}
                        isClearable={false}
                        isDisabled={!isMulti}
                        isMulti={isMulti}
                        onChange={
                            // using as any as it would be too tricky to type properly
                            this.handleOnChange as any
                        }
                        onInputChange={this.onSearch}
                        onMenuOpen={this.onMenuOpen}
                        options={options}
                        value={value}
                        getOptionValue={getScheduledEmailRecipientUniqueIdentifier}
                        getOptionLabel={getScheduledEmailRecipientEmail}
                    />
                </div>
            </div>
        );
    }

    private renderEmptyContainer = (): React.ReactElement | null => {
        return null;
    };

    private getStyle() {
        const { current } = this.recipientRef;
        const { width } = (!isEmpty(current) && current!.getBoundingClientRect()) || { width: undefined };

        return {
            maxWidth: width
                ? width - PADDING - REMOVE_ICON_WIDTH // label item width equal value item container - padding - remove icon
                : "100%",
        };
    }

    private renderNoOptionsContainer = (
        commonProps: NoticeProps<any, boolean>,
    ): React.ReactElement | null => {
        const {
            selectProps: { inputValue },
        } = commonProps;

        if (inputValue) {
            return (
                <Message
                    className="gd-recipient-existed s-gd-recipient-existed"
                    type="warning"
                    contrast={true}
                >
                    <FormattedMessage id="options.menu.schedule.email.recipient.warning.existed" />
                </Message>
            );
        }

        return this.renderEmptyContainer();
    };

    private renderMenuOptions = (menuProps: MenuProps<any, boolean>): React.ReactElement | null => {
        const { isLoading, author } = this.props;
        const {
            options,
            getValue,
            selectProps: { inputValue },
        } = menuProps;
        const selectedValues = getValue() || [];
        const selectedItemsCount = selectedValues.length;
        const areAllValuesSelected =
            options.length &&
            options.every(
                (option: IScheduleEmailRecipient) =>
                    (isScheduleEmailExistingRecipient(option) && isEqual(option, author)) ||
                    this.isRecipientAdded(selectedValues, getScheduledEmailRecipientEmail(option)),
            );

        if (isLoading) {
            return this.renderLoadingIcon(menuProps);
        }

        if (!inputValue && (selectedItemsCount >= MAXIMUM_RECIPIENTS_RECEIVE || areAllValuesSelected)) {
            return this.renderEmptyContainer();
        }

        return this.renderMenuOptionsContainer(menuProps);
    };

    private renderMenuOptionsContainer = (menuProps: MenuProps<any, boolean>): React.ReactElement => {
        return (
            <Menu className="s-gd-recipients-menu-container" {...menuProps}>
                {menuProps.children}
            </Menu>
        );
    };

    private renderLoadingIcon = (menuProps: MenuProps<any, boolean>): React.ReactElement => {
        return (
            <Menu className="s-gd-recipients-menu-container" {...menuProps}>
                <LoadingMask height={LOADING_MENU_HEIGHT} />
            </Menu>
        );
    };

    private currentUserIsAuthor() {
        const { currentUser, author } = this.props;
        return isScheduleEmailExistingRecipient(author) && areObjRefsEqual(author.user.ref, currentUser.ref);
    }

    private renderOwnerValueContainer = (name: string, email: string): React.ReactElement => {
        const { isMulti } = this.props;
        const selectTypeClassName = isMulti ? "multiple-value" : "single-value";
        // when editing schedule created by another user, the owner should be rendered as email address
        const value = this.currentUserIsAuthor() ? name : email;
        return (
            <div
                style={this.getStyle()}
                className={`gd-recipient-value-item s-gd-recipient-value-item ${selectTypeClassName} gd-owner-user`}
            >
                <div className="gd-recipient-label">{value}</div>
            </div>
        );
    };

    private renderMultiValueItemContainer = (
        label: string,
        removeIcon: React.ReactElement | null,
    ): React.ReactElement => {
        return (
            <div className="gd-recipient-value-item s-gd-recipient-value-item multiple-value">
                <div style={this.getStyle()} className="gd-recipient-label">
                    {label}
                </div>
                <div aria-label="remove-icon" className="s-gd-recipient-remove">
                    {removeIcon}
                </div>
            </div>
        );
    };

    private renderErrorValueContainer = (
        label: string,
        removeIcon: React.ReactElement | null,
        bubbleMessageTranslationId: string,
    ): React.ReactElement => {
        return (
            <div className="gd-recipient-value-item s-gd-recipient-value-item multiple-value not-valid">
                <BubbleHoverTrigger className="gd-recipient-not-valid-bubble" showDelay={0} hideDelay={0}>
                    <div className="recipient-item-not-valid">
                        <div style={this.getStyle()} className="gd-recipient-label">
                            {label}
                        </div>
                        <div className="s-gd-recipient-remove">{removeIcon}</div>
                    </div>
                    <Bubble
                        className="bubble-negative s-gd-recipient-not-valid-email"
                        alignPoints={bubbleAlignPoints}
                    >
                        <FormattedMessage id={bubbleMessageTranslationId} />
                    </Bubble>
                </BubbleHoverTrigger>
            </div>
        );
    };

    private renderSingleValueContainer = (
        singleValueProps: SingleValueProps<IScheduleEmailRecipient>,
    ): React.ReactElement => {
        const { data } = singleValueProps;
        const displayName = getScheduledEmailRecipientDisplayName(data);
        const email = getScheduledEmailRecipientEmail(data);
        return this.renderOwnerValueContainer(displayName, email);
    };

    private renderMultiValueContainer = (
        multiValueProps: MultiValueGenericProps<IScheduleEmailRecipient>,
    ): React.ReactElement => {
        const { data, children } = multiValueProps;

        // MultiValueRemove component from react-select
        const removeIcon: React.ReactElement | null = (children as any)![1];

        if (isScheduleEmailExistingRecipient(data) && isEqual(data, this.props.author)) {
            const displayName = getScheduledEmailRecipientDisplayName(data);
            const email = getScheduledEmailRecipientEmail(data);
            return this.renderOwnerValueContainer(displayName, email);
        }

        const email = getScheduledEmailRecipientEmail(data);
        if (!isEmail(email)) {
            return this.renderErrorValueContainer(
                email,
                removeIcon,
                messages.scheduleEmailOptionRecepientInvalid.id!,
            );
        }
        // don't allow adding external recipients to schedules created by somebody else than the current user
        if (
            !this.currentUserIsAuthor() &&
            isScheduleEmailExternalRecipient(data) &&
            !this.isOriginalExternalRecipient(data)
        ) {
            return this.renderErrorValueContainer(
                email,
                removeIcon,
                messages.scheduleEmailOptionRecepientExternalNotAllowed.id!,
            );
        }

        return this.renderMultiValueItemContainer(email, removeIcon);
    };

    private isOriginalExternalRecipient(recipient: IScheduleEmailExternalRecipient) {
        return this.props.originalValue.some((option) => {
            return isScheduleEmailExternalRecipient(option) && option.email === recipient.email;
        });
    }

    private renderOptionLabel = (recipient: IScheduleEmailRecipient): React.ReactElement | null => {
        const email = getScheduledEmailRecipientEmail(recipient);
        const isExternalUser = isScheduleEmailExternalRecipient(recipient);
        const isExternalUserMatchingExistingEmail =
            isExternalUser &&
            this.props.options.some((option) => getScheduledEmailRecipientEmail(option) === email);

        // When we are typing in react-select, it creates a new option on the background (check this.getNewOptionData)
        // To avoid displaying duplicities in the options, do not render external user option,
        // when it matches existing user email.
        if (isExternalUserMatchingExistingEmail) {
            return null;
        }

        if (isEmail(email) && isExternalUser) {
            if (this.currentUserIsAuthor()) {
                // Render warning message, when it's an external recipient
                return (
                    <div className="s-gd-recipient-option-item s-recipient-not-in-workspace-warning">
                        <Message type="warning" contrast={true}>
                            <FormattedMessage id="options.menu.schedule.email.recipient.warning.belong.workspace" />
                        </Message>
                    </div>
                );
            } else {
                // Render warning message, when it's an external recipient and the current user is not the author
                // Other users cannot add external recipients
                return (
                    <div className="s-gd-recipient-option-item s-external-recipient-not-allowed">
                        <Message type="error" contrast={true}>
                            <FormattedMessage id="options.menu.schedule.email.recipient.external.not.allowed" />
                        </Message>
                    </div>
                );
            }
        }

        return (
            <div className="gd-recipient-option-item s-gd-recipient-option-item">
                <span className="gd-recipient-option-label-item s-gd-recipient-option-label-item">
                    {email}
                </span>
                {this.renderRecipientValue(recipient)}
            </div>
        );
    };

    private getNewOptionData = (inputValue: string): IScheduleEmailRecipient => ({
        email: inputValue,
    });

    private renderRecipientValue = (recipient: IScheduleEmailRecipient): React.ReactElement | null => {
        const isExternalUser = isScheduleEmailExternalRecipient(recipient);
        const email = getScheduledEmailRecipientEmail(recipient);

        if (!isExternalUser && isEmail(email)) {
            return (
                <span className="gd-recipient-option-value-item s-gd-recipient-option-value-item">
                    {getScheduledEmailRecipientDisplayName(recipient)}
                </span>
            );
        }

        return this.renderEmptyContainer();
    };

    private renderInputContainer = (
        inputProps: InputProps<IScheduleEmailRecipient>,
    ): React.ReactElement | null => {
        const { isMulti } = this.props;

        if (!isMulti) {
            return this.renderEmptyContainer();
        }

        return (
            <div className="gd-recipient-input s-gd-recipient-input">
                <Input {...inputProps} />
            </div>
        );
    };

    private handleOnChange = (
        selectedValues: IScheduleEmailRecipient[],
        actionTypes: ActionMeta<IScheduleEmailRecipient>,
    ): void => {
        const splittedSelectedValues = splitScheduledEmailRecipients(selectedValues);
        const newSelectedValues = uniqueScheduledEmailRecipients(splittedSelectedValues);
        const { value, allowEmptySelection } = this.props;
        const { action } = actionTypes;
        if (
            value.length >= MAXIMUM_RECIPIENTS_RECEIVE &&
            (action === CREATE_OPTION || action === SELECT_OPTION)
        ) {
            this.props.onChange?.(value);
            return;
        }
        if (newSelectedValues === null) {
            if (allowEmptySelection) {
                this.props.onChange?.([]);
            } else {
                this.props.onChange?.([value[0]]);
            }
            return;
        }

        this.props.onChange?.(newSelectedValues);
    };

    private loadUserListItems = (searchString: string): void => {
        const { options, value, canListUsersInProject, onLoad } = this.props;
        const matchedUserList = this.getMatchedRecipientEmails(options, searchString);
        const matchedUserListCount = matchedUserList.length;
        const isRecipientAdded = this.isRecipientAdded(value, searchString);

        if (!canListUsersInProject || isRecipientAdded || matchedUserListCount > 0) {
            return;
        }

        this.setState({ isLoading: true });
        onLoad?.({ search: searchString });
    };

    private onMenuOpen = (): void => {
        const { onLoad, canListUsersInProject, options } = this.props;
        const userListCount = options.length;
        if (!userListCount && canListUsersInProject) {
            onLoad?.();
        }
    };

    private onSearchCore = (searchString: string): void => {
        this.loadUserListItems(searchString);
    };

    private onSearch = debounce(this.onSearchCore, DELAY_TIME);

    private getMatchedRecipientEmails(
        options: IScheduleEmailRecipient[],
        searchKey: string,
    ): IScheduleEmailRecipient[] {
        return searchKey
            ? options.filter((recipient: IScheduleEmailRecipient) =>
                  includes(getScheduledEmailRecipientEmail(recipient), searchKey),
              )
            : [];
    }

    private isRecipientAdded = (
        value: ReadonlyArray<IScheduleEmailRecipient>,
        searchKey: string,
    ): boolean => {
        return value.some((recipient: IScheduleEmailRecipient) =>
            isEqual(getScheduledEmailRecipientUniqueIdentifier(recipient), searchKey),
        );
    };
}
