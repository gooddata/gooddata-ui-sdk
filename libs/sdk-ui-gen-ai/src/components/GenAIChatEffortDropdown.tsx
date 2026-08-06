// (C) 2026 GoodData Corporation

import { defineMessages, useIntl } from "react-intl";

import { type GenAIChatEffort } from "@gooddata/sdk-model";
import { Dropdown, UiButton, UiMenu, UiSubmenuHeader } from "@gooddata/sdk-ui-kit";

import {
    type EffortMenuItemData,
    useReasoningOptionItems,
    useSelectedReasoningLabel,
} from "./GenAIChatReasoningMenu.js";

const msgs = defineMessages({
    reasoning: {
        id: "gd.gen-ai.reasoning",
    },
});

export type GenAIChatEffortDropdownProps = {
    selectedEffort: GenAIChatEffort;
    isDisabled?: boolean;
    onSelectEffort: (effort: GenAIChatEffort) => void;
};

/**
 * Standalone reasoning-effort dropdown, structured like GenAIChatAgentDropdown but listing effort
 * options instead of agents.
 * @internal
 */
export function GenAIChatEffortDropdown({
    selectedEffort,
    isDisabled,
    onSelectEffort,
}: GenAIChatEffortDropdownProps) {
    const intl = useIntl();
    const reasoningLabel = intl.formatMessage(msgs.reasoning);
    const options = useReasoningOptionItems(selectedEffort, "full");
    const valueLabel = useSelectedReasoningLabel(selectedEffort, "full");

    return (
        <Dropdown
            className="gd-gen-ai-chat__input__effort-dropdown"
            alignPoints={[{ align: "tr br", offset: { x: 0, y: 0 } }]}
            closeOnEscape
            fullscreenOnMobile={false}
            autofocusOnOpen
            accessibilityConfig={{}}
            renderButton={({ isOpen, toggleDropdown, accessibilityConfig }) => (
                <UiButton
                    label={valueLabel ?? reasoningLabel}
                    variant="dropdownInline"
                    size="small"
                    iconAfter={isOpen ? "navigateUp" : "navigateDown"}
                    isDisabled={isDisabled}
                    onClick={toggleDropdown}
                    dataTestId="effort_dropdown_button"
                    accessibilityConfig={accessibilityConfig}
                    disableIconAnimation
                />
            )}
            renderBody={({ closeDropdown, ariaAttributes }) => (
                <UiMenu<EffortMenuItemData>
                    dataTestId="effort_dropdown_menu"
                    items={options}
                    size="small"
                    minWidth={200}
                    maxWidth={260}
                    containerTopPadding="small"
                    containerBottomPadding="small"
                    MenuHeader={EffortMenuHeader}
                    ariaAttributes={ariaAttributes}
                    onSelect={(item) => {
                        onSelectEffort(item.data.effort);
                        closeDropdown();
                    }}
                />
            )}
        />
    );
}

function EffortMenuHeader() {
    const intl = useIntl();

    return <UiSubmenuHeader title={intl.formatMessage(msgs.reasoning)} height="medium" />;
}
