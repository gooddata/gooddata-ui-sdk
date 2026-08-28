// (C) 2024-2026 GoodData Corporation

import { type ComponentType } from "react";

import {
    type ISlotProps,
    type IUiMenuInteractiveItemProps,
    type IUiMenuInteractiveItemWrapperProps,
} from "@gooddata/sdk-ui-kit";

import { type GenAIAgent } from "../../model.js";

/**
 * Properties for the LandingScreen slot.
 * @public
 */
export type IGenAIAssistantLandingScreenProps = {
    /**
     * Whether the chat is in fullscreen mode.
     */
    isFullscreen?: boolean;
    /**
     * Whether the chat is in big screen mode (greater or equal to md)
     */
    isBigScreen?: boolean;
    /**
     * Whether the chat is in small screen mode (less than md)
     */
    isSmallScreen?: boolean;
};

/**
 * Properties for the Disclaimer slot.
 * @public
 */
export type IGenAIAssistantDisclaimerProps = Record<string, never>;

/**
 * Properties for the AgentItem slot.
 * @public
 */
export type IGenAIAssistantAgentItemProps = {
    /**
     * The agent to render.
     */
    agent: GenAIAgent;
    /**
     * Whether the agent is currently selected.
     */
    isSelected: boolean;
    /**
     * Props to pass to the underlying UiMenuInteractiveItemWrapper.
     */
    menuItemProps?: IUiMenuInteractiveItemWrapperProps;
    /**
     * The content to render inside the item.
     */
    Content?: ComponentType<IUiMenuInteractiveItemProps>;
};

/**
 * Customizations for the Gen AI assistant.
 * @public
 */
export interface IGenAIAssistantSlots {
    /**
     * Custom React node rendered when no conversation exists yet or user has click
     * on "New conversation" button.
     */
    LandingScreen?: ComponentType<ISlotProps<IGenAIAssistantLandingScreenProps>>;

    /**
     * Custom React component rendered below the input as a disclaimer.
     */
    Disclaimer?: ComponentType<ISlotProps<IGenAIAssistantDisclaimerProps>>;

    /**
     * Custom React component rendered for each agent in the agent chooser dropdown.
     */
    AgentItem?: ComponentType<ISlotProps<IGenAIAssistantAgentItemProps>>;
}
