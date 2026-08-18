// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { type MessageDescriptor, defineMessages, useIntl } from "react-intl";

import { type GenAIChatEffort } from "@gooddata/sdk-model";
import {
    Dropdown,
    type IUiMenuInteractiveItemWrapperProps,
    type IUiMenuItem,
    UiIcon,
    UiMenu,
    UiSubmenuHeader,
    typedUiMenuContextStore,
    useIdPrefixed,
} from "@gooddata/sdk-ui-kit";

import { SUPPORTED_EFFORTS, type SupportedEffort } from "./utils/effortSelection.js";

const msgs = defineMessages({
    reasoning: {
        id: "gd.gen-ai.reasoning",
    },
    reasoningRowAriaLabel: {
        id: "gd.gen-ai.reasoning.row.ariaLabel",
    },
    closeReasoning: {
        id: "gd.gen-ai.close.reasoning",
    },
    quick: {
        id: "gd.gen-ai.reasoning.quick",
    },
    quickFull: {
        id: "gd.gen-ai.reasoning.quick.full",
    },
    quickDescription: {
        id: "gd.gen-ai.reasoning.quick.description",
    },
    thinking: {
        id: "gd.gen-ai.reasoning.thinking",
    },
    thinkingFull: {
        id: "gd.gen-ai.reasoning.thinking.full",
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

/**
 * Which wording the reasoning options use.
 * - "short": abbreviated labels for the agent dropdown
 * - "full": complete labels for standalone display
 * @internal
 */
export type ReasoningLabelMode = "short" | "full";

const REASONING_COPY: Record<
    SupportedEffort,
    { labels: Record<ReasoningLabelMode, MessageDescriptor>; description: MessageDescriptor }
> = {
    LOW: {
        labels: { short: msgs.quick, full: msgs.quickFull },
        description: msgs.quickDescription,
    },
    MEDIUM: {
        labels: { short: msgs.thinking, full: msgs.thinkingFull },
        description: msgs.thinkingDescription,
    },
};

const REASONING_OPTIONS = SUPPORTED_EFFORTS.map((effort) => ({
    effort,
    ...REASONING_COPY[effort],
}));

/**
 * Localized label of the currently selected reasoning mode ("Quick" or "Quick answer", depending on
 * the label mode), or undefined otherwise.
 * @internal
 */
export function useSelectedReasoningLabel(
    selectedEffort: GenAIChatEffort,
    labelMode: ReasoningLabelMode,
): string | undefined {
    const intl = useIntl();
    const option = REASONING_OPTIONS.find((o) => o.effort === selectedEffort);
    return option ? intl.formatMessage(option.labels[labelMode]) : undefined;
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
 * Builds the effort options shared by the in-agent-menu reasoning row ("short": Quick / Thinking) and
 * the standalone reasoning dropdown ("full": Quick answer / Deep thinking).
 * @internal
 */
export function useReasoningOptionItems(
    selectedEffort: GenAIChatEffort,
    labelMode: ReasoningLabelMode,
): IUiMenuItem<EffortMenuItemData>[] {
    const intl = useIntl();

    return useMemo(
        () =>
            REASONING_OPTIONS.map(({ effort, labels, description }) => {
                const title = intl.formatMessage(labels[labelMode]);
                const descriptionText = intl.formatMessage(description);

                return {
                    type: "interactive",
                    id: `reasoning-${effort}`,
                    stringTitle: title,
                    isSelected: effort === selectedEffort,
                    selectionRole: "radio",
                    isDisabled: false,
                    data: { effort },
                    tooltip: descriptionText,
                    tooltipWidth: 230,
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
        [intl, selectedEffort, labelMode],
    );
}

/**
 * Header for the standalone effort dropdown (dialog with close control).
 * @internal
 */
export function ReasoningEffortMenuHeader({ titleId }: { titleId: string }) {
    const intl = useIntl();
    const { useContextStore, createSelector } = typedUiMenuContextStore();
    const onClose = useContextStore(createSelector((ctx) => ctx.onClose));

    return (
        <UiSubmenuHeader
            title={intl.formatMessage(msgs.reasoning)}
            titleId={titleId}
            height="medium"
            onClose={onClose}
            closeAriaLabel={intl.formatMessage(msgs.closeReasoning)}
        />
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
    const valueLabel = useSelectedReasoningLabel(selectedEffort, "short");
    const options = useReasoningOptionItems(selectedEffort, "short");
    const { useContextStore, createSelector } = typedUiMenuContextStore<{
        interactive: ReasoningMenuItemData;
    }>();
    const closeParentMenu = useContextStore(createSelector((ctx) => ctx.onClose));
    const reasoningTriggerId = useIdPrefixed("reasoning-row-trigger");
    const reasoningRowAriaLabel = intl.formatMessage(msgs.reasoningRowAriaLabel, {
        effort: valueLabel ?? reasoningLabel,
    });

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
                returnFocusTo={reasoningTriggerId}
                accessibilityConfig={{}}
                renderButton={({ isOpen, toggleDropdown }) => (
                    <button
                        type="button"
                        id={reasoningTriggerId}
                        className="gd-gen-ai-chat__reasoning-row__button"
                        aria-label={reasoningRowAriaLabel}
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
                        onClose={closeDropdown}
                        onSelect={(option) => {
                            onSelectEffort?.(option.data.effort);
                            closeDropdown();
                            closeParentMenu?.();
                        }}
                    />
                )}
            />
        </li>
    );
}
