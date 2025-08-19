// (C) 2025 GoodData Corporation

import React, { memo } from "react";

import { type MessageDescriptor, defineMessages, useIntl } from "react-intl";

import { type IconType, UiButtonSegmentedControl, UiIconButton, UiTooltip } from "@gooddata/sdk-ui-kit";

import type { ObjectType } from "./types.js";

type ButtonItem = {
    type: ObjectType;
    icon: IconType;
};

const buttonItems: ButtonItem[] = [
    {
        type: "dashboard",
        icon: "dashboard",
    },
    {
        type: "visualization",
        icon: "visualization",
    },
    {
        type: "metric",
        icon: "metric",
    },
    {
        type: "fact",
        icon: "fact",
    },
    {
        type: "attribute",
        icon: "ldmAttribute",
    },
];

const messages: Record<ObjectType, MessageDescriptor> = defineMessages({
    dashboard: { id: "analyticsCatalog.objectType.dashboard.button.ariaLabel" },
    visualization: { id: "analyticsCatalog.objectType.visualization.button.ariaLabel" },
    metric: { id: "analyticsCatalog.objectType.metric.button.ariaLabel" },
    fact: { id: "analyticsCatalog.objectType.fact.button.ariaLabel" },
    attribute: { id: "analyticsCatalog.objectType.attribute.button.ariaLabel" },
});

type Props = {
    selectedTypes: ObjectType[];
    onSelect: (selectedTypes: ObjectType[]) => void;
};

export function ObjectTypeSelect(props: Props) {
    const { selectedTypes, onSelect } = props;
    const intl = useIntl();

    const handleSelect = (type: ObjectType) => {
        if (selectedTypes.includes(type)) {
            onSelect(selectedTypes.filter((selectedType) => selectedType !== type));
        } else {
            onSelect([...selectedTypes, type]);
        }
    };

    return (
        <UiButtonSegmentedControl>
            {buttonItems.map((item) => {
                const isSelected = selectedTypes.includes(item.type);
                const ariaLabel = intl.formatMessage(messages[item.type]);
                return (
                    <div key={item.type} data-object-type={item.type}>
                        <UiTooltip
                            triggerBy={["hover", "focus"]}
                            anchor={
                                <UiIconButton
                                    size="small"
                                    variant="secondary"
                                    icon={item.icon}
                                    isActive={isSelected}
                                    accessibilityConfig={{ ariaLabel }}
                                    onClick={() => handleSelect(item.type)}
                                />
                            }
                            content={ariaLabel}
                        />
                    </div>
                );
            })}
        </UiButtonSegmentedControl>
    );
}

export const ObjectTypeSelectMemo = memo(ObjectTypeSelect);
