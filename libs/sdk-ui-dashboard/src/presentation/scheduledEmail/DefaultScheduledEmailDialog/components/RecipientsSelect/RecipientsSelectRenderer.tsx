// (C) 2019-2025 GoodData Corporation
/* eslint-disable import/named,import/namespace */
import {
    IAutomationRecipient,
    INotificationChannelMetadataObject,
    isAutomationExternalUserRecipient,
    isAutomationUserRecipient,
} from "@gooddata/sdk-model";
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
import {
    Bubble,
    BubbleHoverTrigger,
    IAlignPoint,
    LoadingMask,
    Message,
    Overlay,
    OverlayController,
    OverlayControllerProvider,
} from "@gooddata/sdk-ui-kit";
import cx from "classnames";

import { isEmail } from "../../utils/validate.js";
import { DASHBOARD_DIALOG_OVERS_Z_INDEX } from "../../../../constants/index.js";

const MAXIMUM_RECIPIENTS_RECEIVE = 60;
const DELAY_TIME = 500;
const PADDING = 16;
const LOADING_MENU_HEIGHT = 50;
const CREATE_OPTION = "create-option";
const SELECT_OPTION = "select-option";
const { Menu, Input } = ReactSelectComponents;
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
     * Has user canListUsersInProject permission?
     */
    canListUsersInProject?: boolean;

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
    notificationChannel?: INotificationChannelMetadataObject;
}

interface IRecipientsSelectRendererState {
    minRecipientsError: boolean;
}

export class RecipientsSelectRenderer extends React.PureComponent<
    IRecipientsSelectRendererProps,
    IRecipientsSelectRendererState
> {
    private recipientRef = React.createRef<HTMLDivElement>();

    constructor(props: IRecipientsSelectRendererProps) {
        super(props);
        this.state = {
            minRecipientsError: false,
        };
    }

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
        const { isMulti, options, value, maxRecipients, className } = this.props;
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

        const maxRecipientsError = maxRecipients && value.length > maxRecipients;
        const minRecipientsError = this.state.minRecipientsError;
        const someRecipientsMissingEmail = this.isEmailChannel()
            ? value.some((v) => (isAutomationUserRecipient(v) ? !isEmail(v.email ?? "") : false))
            : false;

        const showInputError = maxRecipientsError || minRecipientsError || someRecipientsMissingEmail;

        return (
            <div
                className={cx(
                    "gd-input-component gd-recipients-field s-gd-notifications-channels-dialog-recipients",
                    className,
                )}
            >
                <label className="gd-label">
                    <FormattedMessage id="dialogs.schedule.email.to.label" />
                </label>
                <div ref={this.recipientRef} className="gd-input s-gd-recipients-value">
                    <ReactSelect
                        className={cx("gd-recipients-container", {
                            "gd-input-component--invalid": showInputError,
                        })}
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
                    {showInputError ? (
                        <div className="gd-recipients-field-error">
                            {maxRecipientsError ? (
                                <FormattedMessage
                                    id="dialogs.schedule.email.max.recipients"
                                    values={{ maxRecipients }}
                                />
                            ) : null}
                            {minRecipientsError ? (
                                <FormattedMessage id="dialogs.schedule.email.min.recipients" />
                            ) : null}
                        </div>
                    ) : null}
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
            maxWidth: width ? width - PADDING : "100%",
            width,
        };
    }

    private isEmailChannel() {
        const { notificationChannel } = this.props;

        return notificationChannel?.destinationType === "smtp";
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
        const style = this.getStyle();
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
    };

    private renderLoadingIcon = (menuProps: MenuProps<any, boolean>): React.ReactElement => {
        return (
            <OverlayControllerProvider overlayController={overlayController}>
                <Menu className="s-gd-recipients-menu-container" {...menuProps}>
                    <LoadingMask height={LOADING_MENU_HEIGHT} />
                </Menu>
            </OverlayControllerProvider>
        );
    };

    private renderMultiValueItemContainer = (
        label: string,
        removeIcon: React.ReactElement | null,
        options: { hasEmail?: boolean; noExternal?: boolean; type?: "externalUser"; email?: string } = {},
    ): React.ReactElement => {
        const style = this.getStyle();

        const render = () => {
            return (
                <div
                    style={{ maxWidth: style.maxWidth }}
                    className={cx("gd-recipient-value-item s-gd-recipient-value-item multiple-value", {
                        "invalid-email": !options.hasEmail,
                        "invalid-external": options.noExternal,
                    })}
                >
                    <div className="gd-recipient-label">{label}</div>
                    {options.type === "externalUser" ? (
                        <div className="gd-recipient-quest">
                            <FormattedMessage id="dialogs.schedule.email.user.guest" />
                        </div>
                    ) : null}
                    <div aria-label="remove-icon" className="gd-recipient-remove-icon s-gd-recipient-remove">
                        {removeIcon}
                    </div>
                </div>
            );
        };

        if (options.hasEmail === false) {
            return (
                <BubbleHoverTrigger>
                    {render()}
                    <Bubble className="bubble-negative" alignPoints={TOOLTIP_ALIGN_POINTS}>
                        <FormattedMessage id="dialogs.schedule.email.user.missing.email" />
                    </Bubble>
                </BubbleHoverTrigger>
            );
        }

        if (options.noExternal === true) {
            return (
                <BubbleHoverTrigger>
                    {render()}
                    <Bubble className="bubble-negative" alignPoints={TOOLTIP_ALIGN_POINTS}>
                        <FormattedMessage id="dialogs.schedule.email.user.invalid.external" />
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
                            values={{
                                email: label,
                            }}
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
    };

    private renderMultiValueContainer = (
        multiValueProps: MultiValueGenericProps<IAutomationRecipient>,
    ): React.ReactElement => {
        const { allowExternalRecipients } = this.props;
        const { data, children } = multiValueProps;

        // MultiValueRemove component from react-select
        const removeIcon: React.ReactElement | null = (children as any)![1];
        const name = data.name ?? data.id;
        const hasEmail =
            this.isEmailChannel() && isAutomationUserRecipient(data) ? isEmail(data.email ?? "") : true;
        const noExternal = data.type === "externalUser" && !allowExternalRecipients;

        return this.renderMultiValueItemContainer(name, removeIcon, {
            hasEmail,
            noExternal,
            type: data.type,
            email: data.email,
        });
    };

    private renderOptionLabel = (recipient: IAutomationRecipient): React.ReactElement | null => {
        const displayName = recipient.name ?? recipient.id;

        return (
            <div className="gd-recipient-option-item s-gd-recipient-option-item">
                <span className="gd-recipient-option-label-item s-gd-recipient-option-label-item">
                    {displayName}
                </span>
                {this.renderRecipientValue(recipient)}
                {recipient.type === "externalUser" ? (
                    <div className="gd-recipient-option-label-external-warning">
                        <Message type="warning">
                            <FormattedMessage id="dialogs.schedule.email.user.warning.external" />
                        </Message>
                    </div>
                ) : null}
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
        if (newSelectedValues?.length === 0) {
            if (allowEmptySelection) {
                this.props.onChange?.([]);
                this.setState({ minRecipientsError: true });
            } else {
                this.props.onChange?.([value[0]]);
            }
            return;
        } else {
            this.setState({ minRecipientsError: false });
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
                  includes(
                      isAutomationUserRecipient(recipient) || isAutomationExternalUserRecipient(recipient)
                          ? recipient.email ?? ""
                          : "",
                      searchKey,
                  ),
              )
            : [];
    }

    private isRecipientAdded = (value: ReadonlyArray<IAutomationRecipient>, searchKey: string): boolean => {
        return value.some((recipient: IAutomationRecipient) => isEqual(recipient.id, searchKey));
    };
}
