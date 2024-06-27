// (C) 2019-2024 GoodData Corporation
/* eslint-disable import/named,import/namespace */
import { IAutomationRecipient, isAutomationUserRecipient } from "@gooddata/sdk-model";
import React from "react";
import { FormattedMessage } from "react-intl";
import ReactSelect, {
    ActionMeta,
    SelectComponentsConfig,
    InputProps,
    MenuProps,
    MultiValueGenericProps,
    components as ReactSelectComponents,
    GroupBase,
} from "react-select";
import debounce from "lodash/debounce.js";
import isEmpty from "lodash/isEmpty.js";
import isEqual from "lodash/isEqual.js";
import includes from "lodash/includes.js";
import { IWorkspaceUsersQueryOptions } from "@gooddata/sdk-backend-spi";
import { LoadingMask } from "@gooddata/sdk-ui-kit";

import { isEmail } from "../../utils/validate.js";

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
     * Has user canListUsersInProject permission?
     */
    canListUsersInProject?: boolean;

    /**
     * Allow to remove the last recipient
     */
    allowEmptySelection?: boolean;
}

// const bubbleAlignPoints: IAlignPoint[] = [{ align: "cr cl" }];

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
            IAutomationRecipient,
            boolean,
            GroupBase<IAutomationRecipient>
        > = {
            ...ReactSelectComponents,
            IndicatorsContainer: this.renderEmptyContainer,
            Input: this.renderInputContainer,
            MultiValueContainer: this.renderMultiValueContainer,
            Menu: this.renderMenuOptions,
            Placeholder: this.renderEmptyContainer,
            NoOptionsMessage: this.renderNoOptionsContainer,
        };

        return (
            <div className="gd-input-component gd-recipients-field s-gd-schedule-email-dialog-recipients">
                <label className="gd-label">
                    <FormattedMessage id="dialogs.schedule.email.to.label" />
                </label>
                <div ref={this.recipientRef} className="gd-input s-gd-recipients-value">
                    <ReactSelect
                        className="gd-recipients-container"
                        classNamePrefix="gd-recipients"
                        components={creatableSelectComponent}
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
                        getOptionValue={(o) => o.id}
                        getOptionLabel={(o) => o.name ?? o.id}
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

    private renderNoOptionsContainer = (): React.ReactElement | null => {
        return this.renderEmptyContainer();
    };

    private renderMenuOptions = (menuProps: MenuProps<any, boolean>): React.ReactElement | null => {
        const { isLoading } = this.props;
        const {
            getValue,
            selectProps: { inputValue },
        } = menuProps;
        const selectedValues = getValue() || [];
        const selectedItemsCount = selectedValues.length;
        const areAllValuesSelected = false;

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

    private renderMultiValueContainer = (
        multiValueProps: MultiValueGenericProps<IAutomationRecipient>,
    ): React.ReactElement => {
        const { data, children } = multiValueProps;

        // MultiValueRemove component from react-select
        const removeIcon: React.ReactElement | null = (children as any)![1];
        const name = data.name ?? data.id;

        return this.renderMultiValueItemContainer(name, removeIcon);
    };

    private renderOptionLabel = (recipient: IAutomationRecipient): React.ReactElement | null => {
        const displayName = recipient.name ?? recipient.id;

        return (
            <div className="gd-recipient-option-item s-gd-recipient-option-item">
                <span className="gd-recipient-option-label-item s-gd-recipient-option-label-item">
                    {displayName}
                </span>
                {this.renderRecipientValue(recipient)}
            </div>
        );
    };

    private renderRecipientValue = (recipient: IAutomationRecipient): React.ReactElement | null => {
        const email = isAutomationUserRecipient(recipient) ? recipient.email ?? "" : "";

        if (isEmail(email)) {
            return (
                <span className="gd-recipient-option-value-item s-gd-recipient-option-value-item">
                    {email}
                </span>
            );
        }

        return this.renderEmptyContainer();
    };

    private renderInputContainer = (
        inputProps: InputProps<IAutomationRecipient>,
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
        selectedValues: IAutomationRecipient[],
        actionTypes: ActionMeta<IAutomationRecipient>,
    ): void => {
        const newSelectedValues = selectedValues;

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
        options: IAutomationRecipient[],
        searchKey: string,
    ): IAutomationRecipient[] {
        return searchKey
            ? options.filter((recipient: IAutomationRecipient) =>
                  includes(isAutomationUserRecipient(recipient) ? recipient.email ?? "" : "", searchKey),
              )
            : [];
    }

    private isRecipientAdded = (value: ReadonlyArray<IAutomationRecipient>, searchKey: string): boolean => {
        return value.some((recipient: IAutomationRecipient) => isEqual(recipient.id, searchKey));
    };
}
