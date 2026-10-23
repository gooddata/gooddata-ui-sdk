// (C) 2026 GoodData Corporation

import { useId } from "react";

import { type MessageDescriptor, defineMessages, useIntl } from "react-intl";

import type { ObjectShareLevel } from "@gooddata/sdk-ui-ext";
import { type IconType, UiButton, UiSkeleton, UiTooltip } from "@gooddata/sdk-ui-kit";

const messages = defineMessages({
    privateLabel: { id: "metricComponent.editMetric.access.private" },
    privateTooltip: { id: "metricComponent.editMetric.access.private.tooltip" },
    sharedLabel: { id: "metricComponent.editMetric.access.shared" },
    sharedTooltip: { id: "metricComponent.editMetric.access.shared.tooltip" },
    workspaceLabel: { id: "metricComponent.editMetric.access.workspace" },
    workspaceTooltip: { id: "metricComponent.editMetric.access.workspace.tooltip" },
    ariaLabel: { id: "metricComponent.editMetric.access.ariaLabel" },
    fallbackLabel: { id: "metricComponent.editMetric.share" },
});

const LEVELS: Record<
    ObjectShareLevel,
    { icon: IconType; label: MessageDescriptor; tooltip: MessageDescriptor }
> = {
    PRIVATE: { icon: "invisible", label: messages.privateLabel, tooltip: messages.privateTooltip },
    SHARED: { icon: "users", label: messages.sharedLabel, tooltip: messages.sharedTooltip },
    WORKSPACE: {
        icon: "building",
        label: messages.workspaceLabel,
        tooltip: messages.workspaceTooltip,
    },
};

export interface IMetricAccessChipProps {
    level: ObjectShareLevel | undefined;
    isLoading?: boolean;
    isOpen?: boolean;
    onClick: () => void;
}

export function MetricAccessChip({ level, isLoading, isOpen, onClick }: IMetricAccessChipProps) {
    const intl = useIntl();
    const tooltipId = useId();

    const variant = level ? LEVELS[level] : undefined;
    const text = intl.formatMessage(variant?.label ?? messages.fallbackLabel);

    const anchor = isLoading ? (
        <UiSkeleton inline itemWidth={70} itemHeight={16} />
    ) : (
        <UiButton
            // Inside the editor's <form>, so without this the button would submit it.
            type="button"
            variant="tertiary"
            iconBefore={variant?.icon}
            iconBeforeSize={14}
            label={text}
            isSelected={isOpen}
            onClick={onClick}
            dataTestId="s-metric-share-button"
            accessibilityConfig={{
                ariaLabel: variant ? intl.formatMessage(messages.ariaLabel, { level: text }) : undefined,
                ariaDescribedBy: variant ? tooltipId : undefined,
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
