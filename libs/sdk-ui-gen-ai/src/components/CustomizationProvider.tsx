// (C) 2025-2026 GoodData Corporation

import { type PropsWithChildren, createContext, useContext, useMemo } from "react";

import { DefaultAgentItem } from "./customized/AgentItem.js";
import { DefaultDisclaimer } from "./customized/Disclaimer.js";
import { DefaultLandingScreen } from "./customized/LandingScreen.js";
import { type IGenAIAssistantAgentItemProps, type IGenAIAssistantSlots } from "./customized/types.js";
import { useFullscreenCheck } from "./hooks/useFullscreenCheck.js";

export type CustomizationContext = {
    slots?: IGenAIAssistantSlots;
};

const defaultCustomizationContext: Required<CustomizationContext> = {
    slots: {},
};

const customizationContext = createContext(defaultCustomizationContext);

function LandingScreenSlotRenderer() {
    const { slots } = useContext(customizationContext);
    const { isFullscreen, isBigScreen, isSmallScreen } = useFullscreenCheck();

    const LandingScreenSlot = slots?.LandingScreen;
    const defaultProps = { isFullscreen, isBigScreen, isSmallScreen };

    if (LandingScreenSlot) {
        return <LandingScreenSlot Default={DefaultLandingScreen} defaultProps={defaultProps} />;
    }
    return <DefaultLandingScreen {...defaultProps} />;
}

function DisclaimerSlotRenderer() {
    const { slots } = useContext(customizationContext);
    const DisclaimerSlot = slots?.Disclaimer;
    const defaultProps = {};

    if (DisclaimerSlot) {
        return <DisclaimerSlot Default={DefaultDisclaimer} defaultProps={defaultProps} />;
    }
    return <DefaultDisclaimer />;
}

function AgentItemSlotRenderer(props: IGenAIAssistantAgentItemProps) {
    const { slots } = useContext(customizationContext);
    const AgentItemSlot = slots?.AgentItem;
    const { agent, isSelected, menuItemProps, Content } = props;
    const defaultProps = { agent, isSelected, menuItemProps, Content };

    if (AgentItemSlot) {
        return <AgentItemSlot Default={DefaultAgentItem} defaultProps={defaultProps} />;
    }
    return <DefaultAgentItem {...props} />;
}

export function CustomizationProvider({ children, slots }: PropsWithChildren<CustomizationContext>) {
    const value = useMemo(
        () => ({
            slots: slots ?? {},
        }),
        [slots],
    );

    return <customizationContext.Provider value={value}>{children}</customizationContext.Provider>;
}

export const useCustomization = () => {
    return useMemo(
        () => ({
            LandingScreenComponent: LandingScreenSlotRenderer,
            DisclaimerComponent: DisclaimerSlotRenderer,
            AgentItemComponent: AgentItemSlotRenderer,
        }),
        [],
    );
};
