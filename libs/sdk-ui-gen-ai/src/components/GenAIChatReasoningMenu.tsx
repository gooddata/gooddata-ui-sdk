// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { defineMessages, useIntl } from "react-intl";

import { type GenAIChatEffort } from "@gooddata/sdk-model";
import {
    Dropdown,
    type IUiMenuInteractiveItemWrapperProps,
    type IUiMenuItem,
    UiIcon,
    UiMenu,
} from "@gooddata/sdk-ui-kit";

const msgs = defineMessages({
    reasoning: {
        id: "gd.gen-ai.reasoning",
    },
    quick: {
        id: "gd.gen-ai.reasoning.quick",
    },
    quickDescription: {
        id: "gd.gen-ai.reasoning.quick.description",
    },
    thinking: {
        id: "gd.gen-ai.reasoning.thinking",
    },
    thinkingDescription: {
        id: "gd.gen-ai.reasoning.thinking.description",
    },
});

/**
 * Menu-item payload for the reasoning row. Carries the current value and the change callback so the
 * custom wrapper can render the nested Dropdown without the agent dropdown wiring it per-render.
 * @internal
 */
export type ReasoningMenuItemData = {
    type: "reasoning";
    selectedEffort: GenAIChatEffort;
    onSelectEffort?: (effort: GenAIChatEffort) => void;
};

export const REASONING_MENU_ITEM_ID = "reasoning";

const REASONING_OPTIONS = [
    { effort: "LOW", label: msgs.quick, description: msgs.quickDescription },
    { effort: "MEDIUM", label: msgs.thinking, description: msgs.thinkingDescription },
] as const satisfies ReadonlyArray<{
    effort: GenAIChatEffort;
    label: (typeof msgs)[keyof typeof msgs];
    description: (typeof msgs)[keyof typeof msgs];
}>;

/**
 * Localized label of the currently selected reasoning mode (e.g. "Quick"), or undefined otherwise.
 * @internal
 */
export function useSelectedReasoningLabel(selectedEffort: GenAIChatEffort): string | undefined {
    const intl = useIntl();
    const option = REASONING_OPTIONS.find((o) => o.effort === selectedEffort);
    return option ? intl.formatMessage(option.label) : undefined;
}

/**
 * Builds the items appended at the bottom of the agent menu: a separator and the "Reasoning" row.
 * Returns an empty array when the feature is disabled.
 * @internal
 */
export function useReasoningMenuItems({
    enabled,
    selectedEffort,
    onSelectEffort,
}: {
    enabled: boolean;
    selectedEffort: GenAIChatEffort;
    onSelectEffort?: (effort: GenAIChatEffort) => void;
}): IUiMenuItem<{ interactive: ReasoningMenuItemData }>[] {
    const intl = useIntl();

    return useMemo(() => {
        if (!enabled) {
            return [];
        }

        return [
            { type: "separator", id: "reasoning-separator" },
            {
                type: "interactive",
                id: REASONING_MENU_ITEM_ID,
                stringTitle: intl.formatMessage(msgs.reasoning),
                isDisabled: false,
                data: { type: "reasoning", selectedEffort, onSelectEffort },
            },
        ];
    }, [enabled, selectedEffort, onSelectEffort, intl]);
}

/**
 * Menu-item payload for a single reasoning-effort option.
 * @internal
 */
export type EffortMenuItemData = {
    interactive: { effort: GenAIChatEffort };
};

/**
 * Builds the effort options (Quick / Thinking) shared by the in-agent-menu reasoning row and the
 * standalone reasoning dropdown.
 * @internal
 */
export function useReasoningOptionItems(selectedEffort: GenAIChatEffort): IUiMenuItem<EffortMenuItemData>[] {
    const intl = useIntl();

    return useMemo(
        () =>
            REASONING_OPTIONS.map(({ effort, label, description }) => {
                const title = intl.formatMessage(label);
                const descriptionText = intl.formatMessage(description);

                return {
                    type: "interactive",
                    id: `reasoning-${effort}`,
                    stringTitle: title,
                    isSelected: effort === selectedEffort,
                    isDisabled: false,
                    data: { effort },
                    tooltip: descriptionText,
                    ariaAttributes: { "aria-label": `${title}. ${descriptionText}` },
                    iconRight: (
                        <UiIcon
                            type="question"
                            size={12}
                            color="complementary-5"
                            accessibilityConfig={{ ariaHidden: true }}
                        />
                    ),
                };
            }),
        [intl, selectedEffort],
    );
}

/**
 * The "Reasoning" row rendered inside the agent menu. It is a self-contained Dropdown whose trigger
 * is the row and whose body is the effort options — opened as its own overlay on the left of the row.
 * @internal
 */
export function GenAIChatReasoningMenuRow({
    item,
}: IUiMenuInteractiveItemWrapperProps<{ interactive: ReasoningMenuItemData }>) {
    const intl = useIntl();
    const { selectedEffort, onSelectEffort } = item.data;
    const reasoningLabel = intl.formatMessage(msgs.reasoning);
    const valueLabel = useSelectedReasoningLabel(selectedEffort);
    const options = useReasoningOptionItems(selectedEffort);

    return (
        <li role="none" className="gd-gen-ai-chat__reasoning-row">
            <Dropdown
                alignPoints={[
                    { align: "tr tl", offset: { x: -4, y: 0 } },
                    { align: "tl tr", offset: { x: 4, y: 0 } },
                ]}
                closeOnEscape
                fullscreenOnMobile={false}
                autofocusOnOpen
                accessibilityConfig={{}}
                renderButton={({ isOpen, toggleDropdown }) => (
                    <button
                        type="button"
                        className="gd-gen-ai-chat__reasoning-row__button"
                        aria-haspopup="menu"
                        aria-expanded={isOpen}
                        onClick={toggleDropdown}
                    >
                        <span className="gd-gen-ai-chat__reasoning-row__title">{reasoningLabel}</span>
                        {valueLabel ? (
                            <span className="gd-gen-ai-chat__reasoning-row__value">{valueLabel}</span>
                        ) : null}
                        <i className="gd-icon-navigateright" />
                    </button>
                )}
                renderBody={({ closeDropdown, ariaAttributes }) => (
                    <UiMenu<EffortMenuItemData>
                        dataTestId="reasoning_dropdown_menu"
                        items={options}
                        size="small"
                        minWidth={200}
                        maxWidth={260}
                        containerTopPadding="small"
                        containerBottomPadding="small"
                        ariaAttributes={ariaAttributes}
                        onSelect={(option) => {
                            onSelectEffort?.(option.data.effort);
                            closeDropdown();
                        }}
                    />
                )}
            />
        </li>
    );
}
