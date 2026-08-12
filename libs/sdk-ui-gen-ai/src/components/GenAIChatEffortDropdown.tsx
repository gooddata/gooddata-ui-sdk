// (C) 2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { defineMessages, useIntl } from "react-intl";

import { type GenAIChatEffort } from "@gooddata/sdk-model";
import { Dropdown, UiButton, UiMenu, useIdPrefixed } from "@gooddata/sdk-ui-kit";

import {
    type EffortMenuItemData,
    ReasoningEffortMenuHeader,
    useReasoningOptionItems,
    useSelectedReasoningLabel,
} from "./GenAIChatReasoningMenu.js";

const msgs = defineMessages({
    reasoning: {
        id: "gd.gen-ai.reasoning",
    },
    effortTriggerAriaLabel: {
        id: "gd.gen-ai.effort.trigger.ariaLabel",
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
    const effortTitleId = useIdPrefixed("effort-menu-title");
    const effortTriggerId = useIdPrefixed("effort-dropdown-trigger");

    const MenuHeader = useCallback(
        () => <ReasoningEffortMenuHeader titleId={effortTitleId} />,
        [effortTitleId],
    );

    const effortTriggerAriaLabel = useMemo(
        () =>
            intl.formatMessage(msgs.effortTriggerAriaLabel, {
                effort: valueLabel ?? reasoningLabel,
            }),
        [intl, reasoningLabel, valueLabel],
    );

    return (
        <Dropdown
            className="gd-gen-ai-chat__input__effort-dropdown"
            alignPoints={[{ align: "tr br", offset: { x: 0, y: 0 } }]}
            closeOnEscape
            fullscreenOnMobile={false}
            autofocusOnOpen
            returnFocusTo={effortTriggerId}
            accessibilityConfig={{ popupRole: "dialog" }}
            renderButton={({ isOpen, toggleDropdown, accessibilityConfig }) => (
                <UiButton
                    id={effortTriggerId}
                    label={valueLabel ?? reasoningLabel}
                    variant="dropdownInline"
                    size="small"
                    iconAfter={isOpen ? "navigateUp" : "navigateDown"}
                    isDisabled={isDisabled}
                    onClick={toggleDropdown}
                    dataTestId="effort_dropdown_button"
                    accessibilityConfig={{
                        ...accessibilityConfig,
                        ariaLabel: effortTriggerAriaLabel,
                    }}
                    disableIconAnimation
                />
            )}
            renderBody={({ closeDropdown, ariaAttributes }) => (
                <div {...ariaAttributes} aria-labelledby={effortTitleId}>
                    <UiMenu<EffortMenuItemData>
                        dataTestId="effort_dropdown_menu"
                        items={options}
                        size="small"
                        minWidth={200}
                        maxWidth={260}
                        containerTopPadding="small"
                        containerBottomPadding="small"
                        MenuHeader={MenuHeader}
                        onClose={closeDropdown}
                        ariaAttributes={{
                            id: `${ariaAttributes.id}-menu`,
                            "aria-labelledby": effortTitleId,
                        }}
                        onSelect={(item) => {
                            onSelectEffort(item.data.effort);
                            closeDropdown();
                        }}
                    />
                </div>
            )}
        />
    );
}
