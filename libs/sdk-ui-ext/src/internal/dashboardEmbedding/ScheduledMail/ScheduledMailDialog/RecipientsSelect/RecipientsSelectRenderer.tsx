// (C) 2019-2020 GoodData Corporation
/* eslint-disable import/named,import/namespace */
import React from "react";
import { WrappedComponentProps, injectIntl, FormattedMessage } from "react-intl";
import CreatableSelect from "react-select/creatable";
import {
    ActionMeta,
    SelectComponentsConfig,
    InputProps,
    MenuProps,
    MultiValueProps,
    SingleValueProps,
    components as ReactSelectComponents,
} from "react-select";
import debounce from "lodash/debounce";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import includes from "lodash/includes";
import { IWorkspaceUsersQueryOptions } from "@gooddata/sdk-backend-spi";
import { Bubble, BubbleHoverTrigger, Message, LoadingMask } from "@gooddata/sdk-ui-kit";

import { isEmail } from "../../utils/validate";
import {
    IScheduleEmailRecipient,
    isScheduleEmailExistingRecipient,
    isScheduleEmailExternalRecipient,
} from "../../interfaces";
import {
    getScheduledEmailRecipientDisplayName,
    getScheduledEmailRecipientEmail,
    getScheduledEmailRecipientUniqueIdentifier,
} from "../../utils/scheduledMailRecipients";

const MAXIMUM_RECIPIENTS_RECEIVE = 20;
const DELAY_TIME = 500;
const PADDING = 16;
const REMOVE_ICON_WIDTH = 21;
const LOADING_MENU_HEIGHT = 50;
const CREATE_OPTION = "create-option";
const SELECT_OPTION = "select-option";
const { Menu, Input } = ReactSelectComponents;

export interface IRecipientsSelectRendererOwnProps {
    /**
     * Author of the scheduled email - is always recipient of the scheduled email.
     */
    currentUser: IScheduleEmailRecipient;

    /**
     * Currently selected recipients.
     */
    value: IScheduleEmailRecipient[];

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
}

type IRecipientsSelectRendererProps = IRecipientsSelectRendererOwnProps & WrappedComponentProps;

class RecipientsSelectRendererUI extends React.PureComponent<IRecipientsSelectRendererProps> {
    private recipientRef = React.createRef<HTMLDivElement>();

    constructor(props: IRecipientsSelectRendererProps) {
        super(props);
        this.onSearch = debounce(this.onSearch, DELAY_TIME);
    }

    public componentDidMount() {
        const { current } = this.recipientRef;

        if (!current) {
            return;
        }

        // update owner component style after recipient rendered
        const ownerContainer = current.querySelector(".gd-owner-user");
        const { maxWidth } = this.getStyle();
        if (ownerContainer) {
            ownerContainer.setAttribute("style", `max-width: ${maxWidth}px`);
        }
    }

    public render(): React.ReactNode {
        const { intl, isMulti, options, value } = this.props;
        const creatableSelectComponent: SelectComponentsConfig<any, boolean> = {
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
                    {intl.formatMessage({ id: "dialogs.schedule.email.to.label" })}
                </label>
                <div ref={this.recipientRef} className="gd-input s-gd-recipients-value">
                    <CreatableSelect
                        cacheOptions={true}
                        className="gd-recipients-container"
                        classNamePrefix="gd-recipients"
                        components={creatableSelectComponent}
                        getNewOptionData={this.getNewOptionData}
                        formatOptionLabel={this.renderOptionLabel}
                        isClearable={false}
                        isDisabled={!isMulti}
                        isMulti={isMulti}
                        onChange={this.handleOnChange}
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

    private renderEmptyContainer = (): React.ReactElement => {
        return null;
    };

    private getStyle() {
        const { current } = this.recipientRef;
        const { width } = !isEmpty(current) && current.getBoundingClientRect();

        // label item width equal value item container - padding - remove icon
        const recipientLabelWidth = width - PADDING - REMOVE_ICON_WIDTH;

        return {
            maxWidth: width ? recipientLabelWidth : "100%",
        };
    }

    private renderNoOptionsContainer = (menuProps: MenuProps<any, boolean>): React.ReactElement => {
        const {
            selectProps: { inputValue },
        } = menuProps;

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

    private renderMenuOptions = (menuProps: MenuProps<any, boolean>): React.ReactElement => {
        const { isLoading, currentUser } = this.props;
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
                    (isScheduleEmailExistingRecipient(option) && isEqual(option, currentUser)) ||
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

    private renderOwnerValueContainer = (value: string): React.ReactElement => {
        const { isMulti } = this.props;
        const selectTypeClassName = isMulti ? "multiple-value" : "single-value";
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
        removeIcon: React.ReactNode,
    ): React.ReactElement => {
        return (
            <div className="gd-recipient-value-item s-gd-recipient-value-item multiple-value">
                <div style={this.getStyle()} className="gd-recipient-label">
                    {label}
                </div>
                <div className="s-gd-recipient-remove">{removeIcon}</div>
            </div>
        );
    };

    private renderErrorValueContainer = (label: string, removeIcon: React.ReactNode): React.ReactElement => {
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
                        alignPoints={[{ align: "cr cl" }]}
                    >
                        <FormattedMessage id="options.menu.schedule.email.recipient.invalid" />
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
        return this.renderOwnerValueContainer(displayName);
    };

    private renderMultiValueContainer = (
        multiValueProps: MultiValueProps<IScheduleEmailRecipient>,
    ): React.ReactElement => {
        const { data, children } = multiValueProps;

        // MultiValueRemove component from react-select
        const removeIcon: React.ReactNode = children[1];

        if (isScheduleEmailExistingRecipient(data) && isEqual(data, this.props.currentUser)) {
            return this.renderOwnerValueContainer(getScheduledEmailRecipientDisplayName(data));
        }

        const email = getScheduledEmailRecipientEmail(data);
        if (!isEmail(email)) {
            return this.renderErrorValueContainer(email, removeIcon);
        }

        return this.renderMultiValueItemContainer(email, removeIcon);
    };

    private renderOptionLabel = (recipient: IScheduleEmailRecipient): React.ReactNode => {
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

        // Render warning message, when it's an external user
        if (isExternalUser && isEmail(email)) {
            return (
                // This class is necessary for testcafes
                <div className="s-gd-recipient-option-item s-recipient-not-in-workspace-warning">
                    <Message type="warning" contrast={true}>
                        <FormattedMessage id="options.menu.schedule.email.recipient.warning.belong.workspace" />
                    </Message>
                </div>
            );
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

    private renderRecipientValue = (recipient: IScheduleEmailRecipient): React.ReactNode => {
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

    private renderInputContainer = (inputProps: InputProps): React.ReactElement => {
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
        const { value } = this.props;
        const { action } = actionTypes;
        if (
            value.length >= MAXIMUM_RECIPIENTS_RECEIVE &&
            (action === CREATE_OPTION || action === SELECT_OPTION)
        ) {
            this.props.onChange(value);
            return;
        }
        if (selectedValues === null) {
            this.props.onChange([value[0]]);
            return;
        }

        this.props.onChange(selectedValues);
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
        onLoad({ search: searchString });
    };

    private onMenuOpen = (): void => {
        const { onLoad, canListUsersInProject, options } = this.props;
        const userListCount = options.length;
        if (!userListCount && canListUsersInProject) {
            onLoad();
        }
    };

    private onSearch = (searchString: string): void => {
        this.loadUserListItems(searchString);
    };

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

export const RecipientsSelectRenderer = injectIntl(RecipientsSelectRendererUI);
