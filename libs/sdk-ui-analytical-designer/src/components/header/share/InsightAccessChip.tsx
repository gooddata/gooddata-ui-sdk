// (C) 2026 GoodData Corporation

import { useId } from "react";

import { type MessageDescriptor, defineMessages, useIntl } from "react-intl";

import type { ObjectShareLevel } from "@gooddata/sdk-ui-ext";
import { type IconType, UiButton, UiSkeleton, UiTooltip } from "@gooddata/sdk-ui-kit";

const messages = defineMessages({
    privateLabel: { id: "insightAccess.private" },
    privateTooltip: { id: "insightAccess.private.tooltip" },
    sharedLabel: { id: "insightAccess.shared" },
    sharedTooltip: { id: "insightAccess.shared.tooltip" },
    workspaceLabel: { id: "insightAccess.workspace" },
    workspaceTooltip: { id: "insightAccess.workspace.tooltip" },
    ariaLabel: { id: "insightAccess.ariaLabel" },
    fallbackLabel: { id: "insightAccess.share" },
});

const LEVELS: Record<
    ObjectShareLevel,
    { icon: IconType; label: MessageDescriptor; tooltip: MessageDescriptor }
> = {
    PRIVATE: { icon: "invisible", label: messages.privateLabel, tooltip: messages.privateTooltip },
    SHARED: { icon: "users", label: messages.sharedLabel, tooltip: messages.sharedTooltip },
    WORKSPACE: { icon: "building", label: messages.workspaceLabel, tooltip: messages.workspaceTooltip },
};

export interface IInsightAccessChipProps {
    level: ObjectShareLevel | undefined;
    isLoading?: boolean;
    isOpen?: boolean;
    onClick: () => void;
}

export function InsightAccessChip({ level, isLoading, isOpen, onClick }: IInsightAccessChipProps) {
    const intl = useIntl();
    const tooltipId = useId();

    const variant = level ? LEVELS[level] : undefined;
    const text = intl.formatMessage(variant?.label ?? messages.fallbackLabel);

    const anchor = isLoading ? (
        <UiSkeleton inline itemWidth={70} itemHeight={16} />
    ) : (
        <UiButton
            variant="tertiary"
            iconBefore={variant?.icon}
            iconBeforeSize={14}
            label={text}
            isSelected={isOpen}
            onClick={onClick}
            dataTestId="s-insight-access-button"
            accessibilityConfig={{
                ariaLabel: variant ? intl.formatMessage(messages.ariaLabel, { level: text }) : undefined,
                ariaDescribedBy: variant ? tooltipId : undefined,
                ariaHaspopup: "dialog",
                ariaExpanded: isOpen,
                iconAriaHidden: true,
            }}
        />
    );

    return (
        <UiTooltip
            id={tooltipId}
            disabled={!variant || isLoading}
            arrowPlacement="top"
            offset={10}
            triggerBy={["hover", "focus"]}
            hoverOpenDelay={300}
            inlineAnchor
            content={variant ? intl.formatMessage(variant.tooltip) : ""}
            anchor={anchor}
        />
    );
}
