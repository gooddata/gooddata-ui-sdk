// (C) 2025 GoodData Corporation

import React, { memo } from "react";

import { type MessageDescriptor, defineMessages, useIntl } from "react-intl";

import { type IconType, UiButtonSegmentedControl, UiIconButton, UiTooltip } from "@gooddata/sdk-ui-kit";

import { ObjectTypes } from "./constants.js";
import type { ObjectType } from "./types.js";
import { testIds } from "../automation/index.js";

type ButtonItem = {
    type: ObjectType;
    icon: IconType;
};

const buttonItems: ButtonItem[] = [
    {
        type: ObjectTypes.DASHBOARD,
        icon: "dashboard",
    },
    {
        type: ObjectTypes.VISUALIZATION,
        icon: "visualization",
    },
    {
        type: ObjectTypes.METRIC,
        icon: "metric",
    },
    {
        type: ObjectTypes.ATTRIBUTE,
        icon: "ldmAttribute",
    },
    {
        type: ObjectTypes.FACT,
        icon: "fact",
    },
];

const messages: Record<ObjectType, MessageDescriptor> = defineMessages({
    analyticalDashboard: { id: "analyticsCatalog.objectType.dashboard.button.ariaLabel" },
    insight: { id: "analyticsCatalog.objectType.visualization.button.ariaLabel" },
    measure: { id: "analyticsCatalog.objectType.metric.button.ariaLabel" },
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
                    <div key={item.type} data-testid={testIds.objectType} data-object-type={item.type}>
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
                                    // Since object types are stable, dynamic testing ID is acceptable.
                                    dataTestId={`${testIds.objectType}/${item.type}`}
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
