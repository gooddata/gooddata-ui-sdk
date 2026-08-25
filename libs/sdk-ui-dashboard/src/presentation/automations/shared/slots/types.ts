// (C) 2026 GoodData Corporation

import { type ComponentType, type ReactNode } from "react";

import {
    type FilterContextItem,
    type IAutomationRecipient,
    type INotificationChannelIdentifier,
    type INotificationChannelMetadataObject,
    type IdentifierRef,
    type ParameterValue,
} from "@gooddata/sdk-model";

import { type IAutomationParameter } from "../automationFilters/automationParameters.js";

/**
 * Contract of a section-level slot: the default implementation and the exact props the default
 * dialog would render it with.
 *
 * The component a customer assigns to a slot is rendered as an element type, so its reference
 * identity is load-bearing: define it at module scope (or memoize it), never inline in a render
 * function — an inline definition gets a fresh identity on every render of the declaring
 * component, which unmounts and remounts the region, losing focus and transient DOM state.
 *
 * Render `<Default {...defaultProps} />` inside your own markup to wrap the region rather than
 * replace it; a slot that does not spread `defaultProps` onto `Default` loses the default
 * behavior wired through them (including the dialog's initial-focus ref).
 *
 * @alpha
 */
export interface ISlotProps<TProps> {
    /**
     * The default implementation of the region.
     */
    Default: ComponentType<TProps>;

    /**
     * The exact props the default dialog would render {@link ISlotProps.Default} with.
     */
    defaultProps: TProps;
}

/**
 * Members shared by both automation dialogs' header regions.
 *
 * @alpha
 */
export interface IAutomationDialogHeaderProps {
    /**
     * Current automation title.
     */
    title: string;

    /**
     * Placeholder shown while the title is empty.
     */
    placeholder: string;

    /**
     * Whether the secondary title row is shown.
     */
    isSecondaryTitleVisible?: boolean;

    /**
     * Secondary title text (e.g. the widget name).
     */
    secondaryTitle?: string;

    /**
     * Icon rendered before the secondary title.
     */
    secondaryTitleIcon: ReactNode;

    /**
     * Called on every title change with the new value. The dialog validates the title itself.
     */
    onChange: (value: string) => void;
}

/**
 * Members shared by both automation dialogs' filters regions.
 *
 * @alpha
 */
export interface IAutomationDialogFiltersProps {
    /**
     * All filters the automation could select from.
     */
    availableFilters: FilterContextItem[] | undefined;

    /**
     * The automation's current filter selection.
     */
    selectedFilters: FilterContextItem[];

    /**
     * Replaces the selection with the complete updated array. The dialog state applies it
     * wholesale — change/remove/add gestures must submit the whole array, not a delta.
     */
    onFiltersChange: (filters: FilterContextItem[]) => void;

    /**
     * Parameter chips to render. Empty or undefined while the `enableParameters` feature is off.
     */
    parameters?: IAutomationParameter[];

    /**
     * Workspace parameters addable via the "+" menu.
     */
    availableParameters?: IAutomationParameter[];

    /**
     * Called when a parameter is added from the "+" menu.
     */
    onParameterAdd: (ref: IdentifierRef) => void;

    /**
     * Called when a parameter chip's value is edited.
     */
    onParameterChange: (ref: IdentifierRef, value: ParameterValue) => void;

    /**
     * Called when a parameter chip is removed.
     */
    onParameterDelete: (ref: IdentifierRef) => void;
}

/**
 * Members shared by both automation dialogs' destination regions.
 *
 * @alpha
 */
export interface IAutomationDialogDestinationProps {
    /**
     * Notification channels the automation can target.
     */
    notificationChannels: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];

    /**
     * Id of the automation's currently selected notification channel.
     */
    selectedNotificationChannelId: string | undefined;

    /**
     * Called with the id of the newly selected notification channel.
     */
    onChange: (notificationChannelId: string) => void;
}

/**
 * Members shared by both automation dialogs' recipients regions.
 *
 * @alpha
 */
export interface IAutomationDialogRecipientsProps {
    /**
     * Currently selected recipients.
     */
    value: IAutomationRecipient[];

    /**
     * Replaces the selection with the complete updated array.
     */
    onChange: (recipients: IAutomationRecipient[]) => void;

    /**
     * The logged-in user as a recipient candidate.
     */
    loggedUser?: IAutomationRecipient;

    /**
     * Restricts the selection to the logged-in user.
     */
    allowOnlyLoggedUserRecipients?: boolean;

    /**
     * Allows removing the last recipient.
     */
    allowEmptySelection?: boolean;

    /**
     * Allows recipients that are not workspace users.
     */
    allowExternalRecipients?: boolean;

    /**
     * Maximum number of recipients.
     */
    maxRecipients?: number;

    /**
     * Notification channels, used to derive channel-specific recipient constraints.
     */
    notificationChannels?: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];

    /**
     * Id of the automation's currently selected notification channel.
     */
    notificationChannelId?: string;

    /**
     * When set, the only addable recipient is this external address.
     */
    externalRecipientOverride?: string;
}
